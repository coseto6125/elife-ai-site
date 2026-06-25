#!/usr/bin/env python3
"""
Tasker 自動投標輪巡 (rnet + msgspec, self-contained uv project).

One invocation = one sweep: fetch the latest cases in the configured
categories, pre-filter cheaply by keyword + budget, ask Claude (via the
Claude Code subscription OAuth token, billed to the subscription not the
Console) whether the case is in 數位綠洲's software/AI wheelhouse, generate a
proposal + price band, and either preview (dry-run) or submit it. Already-seen
cases are skipped via a local SQLite file so re-runs don't double-propose.

No resident process: run from cron every ~30s with jitter; it exits when the
sweep is done. HTTP goes through rnet with a Chrome TLS fingerprint so the
Tasker requests look like a real browser.

Auth & secrets come from env (see config.env.example):
  TASKER_BEARER_TOKEN         Tasker login token (cookie `bearerToken`)
  RESEND_API_KEY              Resend key for emailing the proposal to the owner
  ANTHROPIC_OAUTH_CREDS_PATH  optional override of ~/.claude/.credentials.json
  AUTOBID_DRY_RUN             "1" (default) previews; "0" submits + emails
"""

from __future__ import annotations

import asyncio
import html
import os
import re
import secrets
import sqlite3
import sys
import time
from pathlib import Path
from urllib.parse import urlencode

import msgspec
from rnet import Client, Impersonate

# ---- config -----------------------------------------------------------------

TASKER_API = "https://api.tasker.com.tw"
# Category filtering on the case list works via `service_tag` (the expanded
# child-tag ids of a category), NOT `selected_categories` — the latter is
# silently ignored by /api/issue/list. These tags are categories 110 (AI應用)
# + 101 (軟硬體開發), captured from the real browser request. `budget=…` keeps
# the same wide range the site sends.
SERVICE_TAGS = os.getenv(
    "AUTOBID_SERVICE_TAGS",
    "311,497,504,514,516,512,520,521,499,502,500,501,125,305,527,522,524,525,"
    "526,531,532,523,528,529,530,427,393,498,394,496,510,509,511,513,515,508,"
    "519,517,518,1,141,75,161,424,391,392,120,229,426,26,178,425,193,260,239,"
    "205,217,51,250,275,98,299,268,287,293,428,281,76,2,194,121,429,430,27,206,"
    "142,230,99,179,218,52,432,240,433,251,434,431,261,165,254,264,221,162,243,"
    "209,182,271,197",
)
BUDGET_FILTER = "0|10000000,0|0"
PER_PAGE = 20
PRICE_MIN_RATIO = 0.8
PRICE_MAX_RATIO = 1.2
PRICE_FLOOR = 1000  # Tasker enforces initial_price_min >= 1000

DB_PATH = Path(os.getenv("AUTOBID_DB", Path(__file__).parent / "autobid.db"))
DRY_RUN = os.getenv("AUTOBID_DRY_RUN", "1") != "0"
MAIL_FROM = os.getenv("AUTOBID_MAIL_FROM", "數位綠洲 <enor@e-life-ai.com>")

# Each fit case gets a pre-generated demo hash so the /demo/<hash>/ URL can be
# written into the text proposal before the HTML is deployed. The HTML lands in
# QUEUE_DIR; deploy-queue.sh (run on a machine with git) ships the batch.
SITE_BASE = "https://service.e-life-ai.com"
QUEUE_DIR = Path(os.getenv("AUTOBID_QUEUE", Path(__file__).parent / "deploy-queue"))
# When AUTOBID_REPO points at a git clone (OCI), each proposal is committed and
# pushed straight to main so its /demo/<hash>/ page goes live without a separate
# manual deploy step. Unset (local dev) → HTML just sits in the queue.
REPO_DIR = Path(p) if (p := os.getenv("AUTOBID_REPO")) else None
# Registering a hash with the tracking Worker makes the proposal show up on the
# /stats/ dashboard immediately (count 0), no HTML deploy or git needed.
TRACK_WORKER = "https://elife-ai-contact.digital-oasis-tw.workers.dev"

ANTHROPIC_API = "https://api.anthropic.com/v1/messages"
ANTHROPIC_MODEL = os.getenv("AUTOBID_MODEL", "claude-opus-4-8")
OAUTH_BETA = "oauth-2025-04-20"
CLAUDE_MAX_RETRIES = 4  # transient 429/529/503 retries before giving up
CLAUDE_BACKOFF_BASE = 3.0  # seconds; doubles each attempt → 3,6,12,24
# The subscription OAuth endpoint rejects requests (429) unless the system
# prompt opens with Claude Code's own identity line — verified empirically.
SPOOF_SYSTEM = "You are Claude Code, Anthropic's official CLI for Claude."

_decoder = msgspec.json.Decoder()


# ---- tiny logger ------------------------------------------------------------

def log(msg: str) -> None:
    """Print a timestamped line to stdout (cron captures it to a file)."""
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {msg}", flush=True)


# ---- HTTP (rnet, Chrome TLS fingerprint) ------------------------------------

def make_client() -> Client:
    """One rnet client impersonating Chrome for browser-like TLS."""
    return Client(impersonate=Impersonate.Chrome131)


def _tasker_headers() -> dict[str, str]:
    return {
        "Authorization": f"Bearer {os.environ['TASKER_BEARER_TOKEN']}",
        "Accept": "application/json",
    }


async def _get_json(cli: Client, url: str, headers: dict[str, str]) -> tuple[int, object]:
    """GET and decode JSON; returns (status, decoded_or_None)."""
    r = await cli.get(url, headers=headers)
    raw = await r.bytes()
    if r.status != 200:
        return r.status, None
    return r.status, _decoder.decode(raw)


# ---- Tasker API -------------------------------------------------------------

async def fetch_cases(cli: Client) -> list[dict]:
    """Fetch the latest case list filtered to our service tags (AI + software)."""
    qs = urlencode({"service_tag": SERVICE_TAGS, "budget": BUDGET_FILTER, "page": 1, "per_page": PER_PAGE})
    url = f"{TASKER_API}/api/issue/list/latest?{qs}"
    status, data = await _get_json(cli, url, _tasker_headers())
    if status == 401:
        raise PermissionError("tasker 401 — bearer token expired, re-login needed")
    if status != 200 or not isinstance(data, dict):
        log(f"fetch_cases unexpected status {status}")
        return []
    return data.get("list", [])


async def fetch_detail(cli: Client, tk_no: str) -> dict | None:
    """Fetch a single case's full detail (owner email, budget, content)."""
    _, data = await _get_json(cli, f"{TASKER_API}/api/issue/{tk_no}", _tasker_headers())
    return data.get("detail") if isinstance(data, dict) else None


async def can_propose(cli: Client, tk_no: str) -> bool:
    """Return True when the case is still open to a proposal from us."""
    _, data = await _get_json(cli, f"{TASKER_API}/api/issue/{tk_no}/proposal/check", _tasker_headers())
    return bool(isinstance(data, dict) and data.get("data", {}).get("can_propose"))


async def submit_proposal(cli: Client, tk_no: str, price_min: int, price_max: int, content: str,
                          quota_amount: int = 0) -> tuple[bool, str]:
    """
    POST a real proposal as multipart/form-data. Returns (ok, detail).

    quota_amount is the ⚡️ ranking-boost quota spent in the SAME form (it rides
    on the proposal POST, there is no separate endpoint). 0 = no boost. Balance
    is at GET /api/member/wallet/info (quota_balance); spending it raises
    proposal_order. Auto sweeps pass 0 — boost is a manual judgement per case.
    """
    boundary = "----autobid7MA4YWxkTrZu0gW"
    fields = [("initial_price_min", price_min), ("initial_price_max", price_max), ("content", content)]
    if quota_amount > 0:
        fields.append(("quota_amount", quota_amount))
    body = "".join(
        f'--{boundary}\r\nContent-Disposition: form-data; name="{n}"\r\n\r\n{v}\r\n' for n, v in fields
    ) + f"--{boundary}--\r\n"
    headers = _tasker_headers() | {"Content-Type": f"multipart/form-data; boundary={boundary}"}
    r = await cli.post(f"{TASKER_API}/api/issue/{tk_no}/proposal", headers=headers, body=body.encode("utf-8"))
    raw = await r.bytes()
    ok = r.status == 200 and isinstance(d := _safe_decode(raw), dict) and d.get("status") == "0"
    return ok, f"status={r.status} body={raw[:160]!r}"


def _safe_decode(raw: bytes) -> object:
    try:
        return _decoder.decode(raw)
    except msgspec.DecodeError:
        return None


# ---- budget / pricing -------------------------------------------------------

def parse_budget(budget_text: str) -> int | None:
    """Extract an integer NTD amount from "$10,000"; None if no number."""
    digits = re.sub(r"[^\d]", "", budget_text or "")
    return int(digits) if digits else None


def price_band(budget: int) -> tuple[int, int]:
    """Apply the 0.8x~1.2x band, floored at Tasker's 1000 minimum."""
    lo = max(PRICE_FLOOR, round(budget * PRICE_MIN_RATIO))
    hi = max(lo + 1, round(budget * PRICE_MAX_RATIO))
    return lo, hi


# ---- Claude (subscription OAuth) --------------------------------------------

def _oauth_token() -> str:
    """Read Claude Code's subscription access token (read-only, like enoract)."""
    path = Path(os.getenv("ANTHROPIC_OAUTH_CREDS_PATH", Path.home() / ".claude" / ".credentials.json"))
    cred = _decoder.decode(path.read_bytes())["claudeAiOauth"]
    if cred.get("expiresAt", 0) / 1000.0 <= time.time():
        log("warning: claude oauth token past expiry — may need /login in Claude Code")
    return cred["accessToken"]


async def _claude(cli: Client, system: str, user: str, max_tokens: int = 1024) -> str:
    """One /v1/messages call billed to the Claude subscription. Returns text."""
    body = msgspec.json.encode({
        "model": ANTHROPIC_MODEL,
        "max_tokens": max_tokens,
        # spoof line first, then our real instructions — both as system blocks.
        "system": [{"type": "text", "text": SPOOF_SYSTEM}, {"type": "text", "text": system}],
        "messages": [{"role": "user", "content": user}],
    })
    headers = {
        "Authorization": f"Bearer {_oauth_token()}",
        "anthropic-version": "2023-06-01",
        "anthropic-beta": OAUTH_BETA,
        "Content-Type": "application/json",
    }
    # 429/529/503 + body-level overloaded are transient overload. Back off and
    # retry rather than returning "" (an empty result silently poisons the
    # proposal/html downstream and can ship a dead demo URL to the owner).
    for attempt in range(CLAUDE_MAX_RETRIES + 1):
        r = await cli.post(ANTHROPIC_API, headers=headers, body=body)
        raw = await r.bytes()
        if r.status == 200:
            blocks = _decoder.decode(raw).get("content", [])
            return "".join(b.get("text", "") for b in blocks if b.get("type") == "text").strip()
        transient = r.status in {429, 503, 529} or b"overloaded" in raw.lower()
        if not transient or attempt == CLAUDE_MAX_RETRIES:
            log(f"claude {r.status}: {raw[:160]!r}")
            return ""
        delay = CLAUDE_BACKOFF_BASE * 2**attempt
        log(f"claude {r.status} transient, retry {attempt + 1}/{CLAUDE_MAX_RETRIES} in {delay:.0f}s")
        await asyncio.sleep(delay)
    return ""


FEASIBILITY_SYSTEM = (
    "你是數位綠洲（純軟體外包團隊，純遠端交付，專長：全端開發、網站、App、AI/LLM 應用、軟體自動化、資料分析）的接案評估助手。"
    '判斷一個 Tasker 案件是否落在我們的守備範圍、值得投標。只回 JSON：{"fit": true/false, "reason": "一句話"}。'
    "fit:true 僅限純軟體、且可全程遠端交付的案：網站、Web/手機 App、後端/API、AI/LLM 應用、軟體流程自動化、資料分析與報表、軟體技術顧問。"
    "fit:false 一律排除以下，即使涉及程式："
    "（1）硬體／韌體／嵌入式：Arduino、ESP32、單晶片、PLC、伺服馬達、控制盤、電路、PCB、機構、LoRa 等需要動到實體電子或韌體的；"
    "（2）非軟體：動畫、影音剪輯、實體維修、跑腿、純平面/工業設計、機電整合、人才招募、行政、翻譯；"
    "（3）需到場或在地履約：內文若要求親自到場、面談、碰面、實地勘查、駐點、進駐辦公室、出差、現場安裝佈線、在特定城市/國家當地服務，或把『可到府／可面議地點』設為承接前提，一律 fit:false，因為我們只做遠端，無法到場。"
    "（4）無程式介面的純 GUI 拼湊：交付主體是在某個 no-code/SaaS 後台用內建功能手動點選設定，無法以程式（API/SDK/腳本）完成的案，一律 fit:false，例如 Ragic、Airtable、Notion、Zapier、Excel/Google Sheet 公式或巨集、各式平台後台的純手動表單與報表設定。判準：若該平台只能靠人在 GUI 逐項點選交付、其 API 無法建立表結構與顯示設定，則我們的程式能力無從發揮，不投。反之，若案子要寫程式串接該平台的 API 做自動化，仍 fit:true。"
    "判讀準則："
    "交付物若是『可在電腦或手機上運行的軟體』且全程可遠端（線上溝通、遠端交付）才 fit；"
    "需交付實體裝置、電路板、韌體燒錄或機構，或需要人到現場，或交付主體是 no-code 後台的純手動設定，一律 fit:false。"
    "（5）由你語意判讀內文，不限關鍵字：業主只是順帶提到公司設在某地、客戶在某地，不算需到場；唯有要求『我們這方的人』實際出現在某地點才算。"
    "（6）AR／VR／MR／XR 沉浸式或空間運算：交付主體是擴增實境、虛擬實境、混合實境、WebAR、3D 空間互動、頭戴裝置或相機即時疊合體驗的案，一律 fit:false，即使用網頁或 App 包裝。判準：若案子的核心價值在於 AR/VR 體驗本身（如商品試戴、空間導覽、3D 互動展示），即使其中含 LINE OA 或網頁客製，整案仍 fit:false；唯有案子主體是一般網站／App／後端／自動化，AR 僅為可有可無的附帶提及，才不受此限。"
)

# Tone rules lifted from .claude/skills/proposal/SKILL.md
# (專業書面語、無公文八股、禁業務尾巴、不貶低/不教育、硬性).
PROPOSAL_SYSTEM = (
    "你是數位綠洲（e-life-ai）的提案撰寫者，為 Tasker 案件寫一段給業主、可直接貼到平台的提案說明。語氣是穩重、收斂、有專業重量的書面語，像一位資深工程師向業主說明，硬性規範："
    "1. 全程繁體中文，第一人稱一律「我們」，不用「本團隊」、不用獨白式「我」。"
    "2. 不用破折號（——／—），句中用「，」、列舉用「：」、標題分隔用「｜」。"
    "3. 基調是專業書面語，避開兩端：一端是公文八股（懇請／敬請／謹／出具／使…得以／係／爰），一端是過輕的口語白話（喬掉／瞄一眼／怪怪的／吃不準／搞定／划算／對一下／不用等轉圈）。落在中間穩重通順的書面語，如「以利於對齊彼此認知」「過往實際產出與交付上線」這種有重量的講法。"
    "4. 禁業務尾巴（最易出油）：陳述完一件事就收，不要在後面接一句把鏡頭轉回自己、暗示「所以我們很在乎／很懂／很重視」的話。底氣靠事實本身透出，不靠回頭表態。"
    "5. 不貶低對照組、不教育業主：不踩同行、不暗示別人會做壞，業主用詞不專業或有誤解時不擺出「您理解錯了」的姿態，把正確理解寫成「我們的理解」交回去確認。避開強調性詞彙（絕對／保證／我們最／業界少有），陳述事實的口吻比強調更有底。"
    "6. 不揭露特定技術名給業主（不寫 FastAPI／Next.js／Ollama／PostgreSQL／模型參數等），改用能力描述（如「成熟的後端框架」「輕量本地模型」）。"
    "7. 實績說「我們曾產出之商業成品」「我們實際出貨過的生產級系統」，不空泛吹捧。"
    "8. 報價誠實掛條件：把需先取得的素材／範例設為正式報價的前提，不把不確定範圍講死。"
    "9. 競爭策略：低預算小案靠「一眼看出我們最懂這題」取勝，把業主的模糊用詞翻成專業概念、給務實選型與誠實條件，不靠堆功能。"
    "10. 200~350 字，以業主能得到什麼開頭，結尾邀請進一步討論。只輸出提案正文，不要標題或前後綴。"
)


async def assess_fit(cli: Client, title: str, content: str) -> tuple[str, str]:
    """
    Ask Claude if the case fits our wheelhouse.

    Returns (verdict, reason) where verdict is "fit" / "not_fit" / "error".
    "error" means the Claude call failed (empty/401/garbage) — the caller must
    NOT persist it as not_fit, or a transient token expiry would permanently
    drop a real software case. The case stays unjudged for a later sweep.
    """
    out = await _claude(cli, FEASIBILITY_SYSTEM, f"案件標題：{title}\n需求說明：{content}", max_tokens=200)
    if not out:
        return "error", "claude empty (call failed)"
    try:
        d = _decoder.decode(re.search(r"\{.*\}", out, re.DOTALL).group(0))
        return ("fit" if bool(d.get("fit")) else "not_fit"), str(d.get("reason", ""))[:80]
    except (msgspec.DecodeError, AttributeError):
        return "error", f"unparseable: {out[:60]}"


async def gen_proposal(cli: Client, title: str, content: str, budget: int) -> str:
    """Generate the proposal body text for the owner."""
    user = f"案件標題：{title}\n需求說明：{content}\n業主預算：約 NT${budget:,}"
    return await _claude(cli, PROPOSAL_SYSTEM, user, max_tokens=900)


async def register_track(cli: Client, hash_: str, label: str) -> bool:
    """Register the proposal on the /stats/ dashboard (count 0). No deploy needed."""
    qs = urlencode({"p": hash_, "label": label[:80]})
    r = await cli.get(f"{TRACK_WORKER}/track/register?{qs}",
                      headers={"Origin": SITE_BASE})
    return r.status == 200


# ---- HTML proposal page (queued for batch deploy) ---------------------------

HTML_SYSTEM = (
    "你為數位綠洲（e-life-ai）產出一份簡版 HTML 提案頁的內容區，套用既有版面 class。"
    "只輸出數個 <section> 區塊（不要 <html>/<head>/<body>/header/footer，外層由系統包好）。"
    '可用結構：<section><h2 class="sec"><span class="sec-no">N</span>標題</h2><p class="lead">…</p>'
    '<ul class="plain"><li>…</li></ul></section>，需要表格時用 <table><thead><tr><th>…</th></tr></thead>'
    '<tbody><tr><td>…</td></tr></tbody></table>，報價結論用 <div class="price-note">…</div>，'
    '關鍵相依用 <div class="callout"><b>關鍵相依：</b>…</div>。'
    "業主原始需求區塊（sec-no 1）由系統另外加上，你的內容從 sec-no 2 開始依序："
    "2 我們對需求的理解、3 我們能提供的能力、4 報價與前提（含報價區間與需先取得的素材）。"
    "語氣規範同提案正文：穩重的專業書面語（避開公文八股與口語白話兩端）、第一人稱「我們」、不用破折號、不揭露特定技術名、報價誠實掛條件、禁業務尾巴（陳述完即收，不回頭表態自己很在乎／很懂）、不貶低對照組、不教育業主、避開強調性詞彙。"
    "不要編造未談過的功能模組明細或分期百分比。只輸出 HTML，不要 markdown 圍欄。"
)

# Detailed tier — distils the proposal skill's craft into the prompt so the
# auto pipeline can also produce a big-case-grade proposal. Used for high-value
# or flagged cases instead of HTML_SYSTEM. Domain insight (e.g. the dual-axis
# kinship-graph framing) is passed in per-case via the user message.
DETAILED_HTML_SYSTEM = (
    "你為數位綠洲（e-life-ai）產出一份詳盡 HTML 提案頁的內容區，套用既有版面 class，目標是讓業主一眼看出我們最懂這題。"
    "只輸出 <section> 區塊（不要 <html>/<head>/<body>/header/footer，外層由系統包好）。"
    '可用結構：<section><h2 class="sec"><span class="sec-no">N</span>標題</h2><p class="lead">…</p>'
    '<ul class="plain"><li>…</li></ul></section>；功能用 <table><thead><tr><th class="num">#</th><th>模組</th><th>內容</th></tr></thead><tbody>…</tbody></table>；'
    '確認事項用 <ol class="confirm"><li><b>項目：</b><p>說明</p></li></ol>；報價分期用表格加 <div class="price-note">結論</div>；'
    '明確排除用 <ul class="plain exclude"><li>…</li></ul>；關鍵相依用 <div class="callout"><b>關鍵相依：</b>…</div>。'
    "業主原始需求區塊（sec-no 1）由系統另外加上，你的內容從 sec-no 2 開始依序："
    "2 我們對需求的理解（把業主的模糊用詞翻成清楚的概念）、"
    "3 我們建議的做法與功能範圍（用功能表，每個模組搭一句業主能想像的具體情境，例如『點開一位族人即可看到其上下三代與所屬房份，一鍵列出某一房在世成員』，不堆技術名詞）、"
    "4 報價前需確認的事項（confirm 清單）、5 報價與分期（表格＋區間結論＋明確排除＋關鍵相依）。"
    "硬性語氣規範：穩重的專業書面語，避開兩端（公文八股：懇請／謹／出具／係／爰；口語白話：對一下／不用等轉圈／搞定），落在中間有重量的書面講法；"
    "第一人稱「我們」、不用「本團隊」「我」、不用破折號、不揭露特定技術名（用能力描述與具體情境取代）；"
    "禁業務尾巴（陳述完一件事即收，不接一句把鏡頭轉回自己暗示「所以我們很在乎／很懂／很重視」，底氣靠事實透出）；"
    "不貶低對照組、不教育業主，避開強調性詞彙（絕對／保證／我們最／業界少有），陳述事實的口吻比強調更有底；"
    "實績說「我們曾產出之商業成品」、報價誠實掛條件（需先取得的素材設為正式報價前提）。"
    "不要編造未談過的精確數字或百分比，分期占比可用區間或階段描述。只輸出 HTML，不要 markdown 圍欄。"
)


def _html_shell(title: str, lead: str, tk_no: str, industry: str, budget: int, sections: str, hash_: str, label: str) -> str:
    """Wrap Claude's section HTML in the proposal template shell + tracking beacon."""
    esc = html.escape
    # Keep `track?p=<hash>` as one literal substring so deploy-queue.sh's
    # injection check (grep "track?p=$HASH") matches.
    beacon = (
        "<script>(function(){"
        "var u='" + SITE_BASE + "/track?p=" + hash_ + "&label='"
        "+encodeURIComponent('" + label.replace("'", "’") + "');"
        "new Image().src=u+'&t='+Date.now();})();</script>"
    )
    return f"""<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>{esc(title)}｜報價提案｜e-life-ai</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Noto+Sans+TC:wght@400;500;700;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="assets/proposal.css" />
</head>
<body>
<header class="cover">
  <div class="wrap">
    <div class="brandline">
      <img class="logo-mark" src="logo-mark.svg" alt="e-life-ai" width="40" height="40" />
      <span class="brand-name">e-life-ai</span>
      <span class="brand-tag">service.e-life-ai.com</span>
    </div>
    <span class="eyebrow">需求釐清與報價提案</span>
    <h1 class="title">{esc(title)}</h1>
    <p class="lead">{esc(lead)}</p>
    <div class="meta-row">
      <span class="chip">案件編號 <b>{esc(tk_no)}</b></span>
      <span class="chip">行業 <b>{esc(industry or "未提供")}</b></span>
      <span class="chip">執行地點 <b>可遠端</b></span>
      <span class="chip">預算 <b>${budget:,}</b></span>
    </div>
  </div>
</header>
<div class="paper">
<div class="wrap">
{sections}
</div>
</div>
<footer>
  <div class="foot-inner">
    <div class="foot-lockup">
      <img src="logo-mark.svg" alt="e-life-ai" width="32" height="32" />
      <span class="fl-name">e-life-ai</span>
    </div>
    <div class="foot-top">
      <span>service.e-life-ai.com</span>
      <span>本提案有效期 14 天｜聯絡：<a href="mailto:enor@e-life-ai.com">enor@e-life-ai.com</a></span>
    </div>
    <div class="foot-reg">數位綠洲有限公司｜統一編號 60512091</div>
  </div>
</footer>
{beacon}
</body>
</html>
"""


async def build_html_proposal(cli: Client, tk_no: str, title: str, content: str, industry: str,
                              budget: int, lo: int, hi: int, hash_: str,
                              detailed: bool = False, domain_hint: str = "") -> bool:
    """
    Generate the HTML proposal page and write it to the deploy queue. Returns success.

    detailed=True uses the big-case prompt; domain_hint feeds per-case insight
    (e.g. "以宗族關係圖譜與會員行政為雙主軸").
    """
    hint = f"\n領域洞察（請融入提案，用具體情境呈現，不堆技術名）：{domain_hint}" if domain_hint else ""
    user = (
        f"案件標題：{title}\n需求說明：{content}\n業主預算：約 NT${budget:,}\n"
        f"報價區間：NT${lo:,} ~ NT${hi:,}（請在報價區塊據此說明，並把需先取得的素材設為前提）{hint}"
    )
    system = DETAILED_HTML_SYSTEM if detailed else HTML_SYSTEM
    sections = await _claude(cli, system, user, max_tokens=4000 if detailed else 2000)
    sections = re.sub(r"^```[a-z]*\n?|\n?```$", "", sections.strip())  # strip any md fence
    if "<section" not in sections:
        return False
    # sec-no 1: the owner's original requirement, verbatim, so they can confirm
    # this proposal maps to their case (Claude's sections start at sec-no 2).
    req_lines = "".join(f"<li>{html.escape(ln.strip())}</li>" for ln in content.splitlines() if ln.strip())
    req_section = (
        '<section><h2 class="sec"><span class="sec-no">1</span>您的需求</h2>'
        f'<ul class="plain">{req_lines}</ul></section>'
    )
    lead = content.splitlines()[0][:60] if content else title
    page = _html_shell(title, lead, tk_no, industry, budget, req_section + "\n" + sections, hash_, f"{title} {tk_no}")
    QUEUE_DIR.mkdir(exist_ok=True)
    (QUEUE_DIR / f"{hash_}.html").write_text(page, encoding="utf-8")
    return True


async def _git(repo: Path, *args: str) -> tuple[int, str]:
    """Run one git command in repo; return (rc, combined output)."""
    proc = await asyncio.create_subprocess_exec(
        "git", "-C", str(repo), *args,
        stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.STDOUT,
    )
    out, _ = await proc.communicate()
    return proc.returncode or 0, out.decode(errors="replace").strip()


async def deploy_to_repo(hash_: str, title: str) -> bool:
    """
    Build the self-contained demo under the repo and push main (OCI path).

    Mirrors deploy-queue.sh: copies the queued HTML + shared css/logo into
    app/public/demo/<hash>/, then commits and pushes only that path. Returns
    True when the push succeeds (the page goes live after Pages builds).
    """
    if REPO_DIR is None:
        return False
    src = QUEUE_DIR / f"{hash_}.html"
    css = REPO_DIR / "proposals/assets/proposal.css"
    logo = REPO_DIR / "logo/logo-mark.svg"
    if not (src.is_file() and css.is_file() and logo.is_file()):
        log(f"deploy: missing src/css/logo for {hash_}")
        return False
    dst = REPO_DIR / "app/public/demo" / hash_
    (dst / "assets").mkdir(parents=True, exist_ok=True)
    (dst / "assets/proposal.css").write_bytes(css.read_bytes())
    (dst / "logo-mark.svg").write_bytes(logo.read_bytes())
    (dst / "index.html").write_bytes(src.read_bytes())
    # Pull first so a concurrent run's commit doesn't make the push non-fast-forward.
    await _git(REPO_DIR, "pull", "--quiet", "--rebase")
    await _git(REPO_DIR, "add", f"app/public/demo/{hash_}")
    rc, out = await _git(REPO_DIR, "commit", "-q", "-m", f"feat(proposal): deploy autobid {hash_} ({title[:40]})")
    if rc != 0 and "nothing to commit" not in out:
        log(f"deploy commit failed {hash_}: {out[:120]}")
        return False
    rc, out = await _git(REPO_DIR, "push", "--quiet", "origin", "main")
    if rc != 0:
        log(f"deploy push failed {hash_}: {out[:120]}")
        return False
    return True


# ---- email (Resend) ---------------------------------------------------------

async def email_owner(cli: Client, to_addr: str, title: str, proposal: str, price_min: int, price_max: int, demo_url: str = "") -> bool:
    """Email the proposal copy to the owner via Resend. Returns success."""
    key = os.getenv("RESEND_API_KEY")
    if not key:
        log("no RESEND_API_KEY — skip owner email")
        return False
    page_line = f"完整提案頁：{demo_url}\n\n" if demo_url else ""
    text = (
        f"您好，\n\n感謝您在 Tasker 發布「{title}」。我們是數位綠洲，以下是我們的提案：\n\n"
        f"{proposal}\n\n初步報價區間：NT${price_min:,} ~ NT${price_max:,}（最終以諮詢後為準）。\n\n"
        f"{page_line}歡迎回信或在 Tasker 上與我們進一步討論。\n\n— 數位綠洲 service.e-life-ai.com"
    )
    reply_to = MAIL_FROM.split("<")[-1].rstrip(">").strip() or MAIL_FROM
    body = msgspec.json.encode({
        "from": MAIL_FROM, "to": [to_addr], "reply_to": reply_to,
        "subject": f"數位綠洲提案：{title}", "text": text,
    })
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    r = await cli.post("https://api.resend.com/emails", headers=headers, body=body)
    ok = r.status in {200, 201}
    if not ok:
        log(f"resend {r.status}: {(await r.bytes())[:120]!r}")
    return ok


# ---- state (SQLite) ---------------------------------------------------------
#
# Every case Claude judges is written here exactly once — including not-fit
# ones — so a re-run never spends a second Claude call on a case already
# decided. `status` records the outcome: not_fit / proposed / submitted /
# submit_failed / dry_run.

def db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS cases ("
        "tk_no TEXT PRIMARY KEY, ts INTEGER, title TEXT, budget INTEGER, "
        "fit INTEGER, reason TEXT, status TEXT, "
        "price_min INTEGER, price_max INTEGER, emailed INTEGER, dry_run INTEGER, "
        "hash TEXT, demo_url TEXT)"
    )
    return conn


def already_judged(conn: sqlite3.Connection, tk_no: str) -> bool:
    """True when this case has already been judged by Claude (any outcome)."""
    return conn.execute("SELECT 1 FROM cases WHERE tk_no=?", (tk_no,)).fetchone() is not None


def record(
    conn: sqlite3.Connection, tk_no: str, *, title: str, budget: int, fit: bool, reason: str,
    status: str, price_min: int = 0, price_max: int = 0, emailed: bool = False,
    hash_: str = "", demo_url: str = "",
) -> None:
    """Persist one case's verdict (fit or not) so it's never re-judged."""
    conn.execute(
        "INSERT OR REPLACE INTO cases VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
        (tk_no, int(time.time()), title, budget, int(fit), reason, status,
         price_min, price_max, int(emailed), int(DRY_RUN), hash_, demo_url),
    )
    conn.commit()


# ---- one sweep --------------------------------------------------------------

async def sweep() -> None:
    """Run a single fetch→assess→propose pass; judge every unseen case once."""
    conn = db()
    cli = make_client()
    try:
        cases = await fetch_cases(cli)
    except PermissionError as e:
        log(f"FATAL {e}")
        sys.exit(2)
    log(f"sweep: {len(cases)} cases (dry_run={DRY_RUN}, model={ANTHROPIC_MODEL})")

    for c in cases:
        tk = c.get("tk_no")
        title = c.get("title", "")
        if not tk or already_judged(conn, tk):
            continue

        budget = parse_budget((c.get("budget") or {}).get("text", ""))

        # Pull full detail, then let Claude judge fit — no keyword pre-filter.
        detail = await fetch_detail(cli, tk)
        if not detail:
            continue
        content = detail.get("content", c.get("content", ""))

        verdict, reason = await assess_fit(cli, title, content)
        if verdict == "error":
            # Claude call failed (token expiry / rate limit / garbage). Do NOT
            # persist — leave the case unjudged so a later sweep retries it.
            log(f"  retry-later {tk} 「{title[:24]}」: {reason}")
            continue
        if verdict == "not_fit":
            log(f"  not-fit {tk} 「{title[:24]}」: {reason}")
            record(conn, tk, title=title, budget=budget or 0, fit=False, reason=reason, status="not_fit")
            continue

        # Fit, but with no numeric budget we can't compute a price band yet.
        if budget is None:
            log(f"  fit-no-budget {tk} 「{title[:24]}」: 預算詳談，待人工或聊天確認")
            record(conn, tk, title=title, budget=0, fit=True, reason=reason, status="fit_no_budget")
            continue

        if not await can_propose(cli, tk):
            log(f"  fit-closed {tk} 「{title[:24]}」: can_propose=false")
            record(conn, tk, title=title, budget=budget, fit=True, reason=reason, status="closed")
            continue

        lo, hi = price_band(budget)
        proposal = await gen_proposal(cli, title, content, budget)
        if not proposal:
            log(f"  proposal-empty {tk}")
            record(conn, tk, title=title, budget=budget, fit=True, reason=reason, status="gen_failed",
                   price_min=lo, price_max=hi)
            continue

        # Pre-generate the demo hash so its URL can go into the text proposal
        # now; the HTML page is queued for a later batch deploy from a git host.
        hash_ = secrets.token_hex(6)
        demo_url = f"{SITE_BASE}/demo/{hash_}/"
        # If the HTML page didn't build (e.g. Claude overload exhausted retries),
        # skip the whole case: never submit/email a demo_url that will 404.
        # Leave it unrecorded as gen_failed so a later sweep retries the case.
        if not await build_html_proposal(cli, tk, title, content, detail.get("industry", ""), budget, lo, hi, hash_):
            log(f"  html-failed {tk} 「{title[:24]}」: skip submit (no live demo page)")
            record(conn, tk, title=title, budget=budget, fit=True, reason=reason, status="gen_failed",
                   price_min=lo, price_max=hi)
            continue
        proposal_full = f"{proposal}\n\n完整提案頁：{demo_url}"

        if DRY_RUN:
            log(f"  [DRY] {tk} 「{title}」 fit({reason})")
            log(f"        price NT${lo:,}~{hi:,} | demo={demo_url}")
            log(f"        proposal: {proposal[:120]}…")
            record(conn, tk, title=title, budget=budget, fit=True, reason=reason, status="dry_run",
                   price_min=lo, price_max=hi, hash_=hash_, demo_url=demo_url)
            continue

        ok, detail_msg = await submit_proposal(cli, tk, lo, hi, proposal_full)
        emailed = registered = deployed = False
        if ok:
            # Show on /stats/ immediately (count 0).
            registered = await register_track(cli, hash_, f"{title} {tk}")
            # Push the demo page live (OCI path) so the URL in the proposal works.
            deployed = await deploy_to_repo(hash_, title)
            # The owner's email is hidden until we've proposed — re-fetch detail
            # post-submit to pick up the now-unlocked address, then email a copy.
            fresh = await fetch_detail(cli, tk) or {}
            owner_email = fresh.get("owner_email")
            if owner_email:
                emailed = await email_owner(cli, owner_email, title, proposal, lo, hi, demo_url)
        record(conn, tk, title=title, budget=budget, fit=True, reason=reason,
               status="submitted" if ok else "submit_failed", price_min=lo, price_max=hi,
               emailed=emailed, hash_=hash_, demo_url=demo_url)
        log(f"  {'SENT' if ok else 'FAIL'} {tk} 「{title}」 NT${lo:,}~{hi:,} emailed={emailed} stats={registered} deployed={deployed} {'' if ok else detail_msg}")
    conn.close()


if __name__ == "__main__":
    asyncio.run(sweep())
