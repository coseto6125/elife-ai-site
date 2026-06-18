# 客服 Bot：需求釐清（Brainstorming）模式設計藍圖

> **內部文件 — 不對客戶提供。** 給 e-life-ai 接案客服 bot（enoract org_id=2, slug `e-life-ai`）。
> 目標：當訪客開始描述具體專案需求時，bot 自動切換到「腦力激盪式釐清」流程，並把該階段的 LLM 升級為 Opus 4.8。
> 方法論萃取自 obra/superpowers 的 `brainstorming` skill。

---

## 1. 問題與動機

現況：bot 用 `claude-haiku-4-5` + scenarios `knowledge_qa / ask_clarification / out_of_scope`。
痛點：訪客一開口描述需求，bot 回得「重」——一次倒完四大類服務 + 技術名詞，造成壓迫；且 Haiku 對「把模糊需求收斂成可落地範疇」這種高階推理力不足。

期望：複製 superpowers `brainstorming` 的精髓——**漸進釐清、一次一問、聚焦 purpose/constraints/success**——並在這個最吃腦力的階段用 Opus 4.8。

## 2. 萃取自 superpowers brainstorming 的方法論

可直接搬進 bot 提問流程的原則（去掉 superpowers 中「寫 spec / 進 implementation」等不適用客服情境的部分）：

1. **一次只問一個問題**（one question per message）— 絕不一口氣丟多題。
2. **聚焦理解三件事**：purpose（為何要做）、constraints（預算/時程/技術限制）、success criteria（怎樣算成功）。
3. **先評估規模**：若需求含多個獨立子系統，先點出「這其實是好幾個專案」，協助拆解，別急著問細節。
4. **優先選擇題**降低訪客負擔（呼應官網 AskUserQuestion 風格）。
5. **收斂後給方向**：理解夠了，提 1–2 個可行方向 + 推薦，**但不在此報價**（報價走既有 `怎麼報價` FAQ + 免費需求釐清對談）。
6. **軟收尾**：每輪結尾用一句柔性提問把球丟回訪客，而非單向轟炸（已在 FAQ 改版中落地，這裡延續）。

客服情境的 HARD-GATE 改寫：**理解 purpose/constraints/success 之前，不丟方案、不引導報價、不催促留聯絡方式。**

## 3. enoract 平台能力盤點（ecp/grep 實查，2026-06-18）

| 能力 | 現況 | 出處 |
|------|------|------|
| Scenario 由 LLM router 依 `description` 自動觸發 | ✅ 已支援 | `shared/scenario/__init__.py:113`（`description` 即 router 輸入） |
| scenario 注入提問流程指引 | ✅ `injection_message` 欄位 | `shared/scenario/__init__.py:122` |
| scenario 限定特定 bot | ✅ `restricted_to_bot_slugs` | `__init__.py:171` |
| skip-LLM 模板輸出 | ✅ `skip_llm` | `__init__.py:147` |
| per-bot turn model + 獨立 repair model | ✅ 已分離 | `chat/turn/dispatcher.py:55-56` |
| **per-scenario 指定模型（切 Opus）** | ❌ **無** — `Scenario` struct 無 model 欄位 | `__init__.py:107-180` 全欄位無 model/provider |
| Opus 4.8 provider 可用性 | 待查 model registry（anthropic-oauth 已在用，doni/e-life-ai 等） | bot LLM = anthropic-oauth/claude-haiku-4-5（[[elife-ai-line-bot]]） |

**結論**：「brainstorming 提問流程」= 純設定（新增一個 scenario）。「釐清階段切 Opus」= **需新增 enoract code**（Scenario 加 model override 欄位 + turn pipeline 讀取）。

## 4. 設計：兩塊

### 塊 A — 新增 `requirement_brainstorm` scenario（純設定，無 code）

新 builtin scenario，`restricted_to_bot_slugs=["e-life-ai"]`：

- **`description`（router 觸發訊號）**：1–2 句「何時觸發」——
  「訪客開始描述一個具體的專案/系統需求（想做某個網站、AI、自動化、爬蟲），而非只問服務範圍或報價。Pick this when the visitor moves from browsing to describing what they actually want built.」
- **`injection_message`**：把第 2 節方法論逐條寫成給 LLM 的流程指引（一次一問、purpose→constraints→success、規模先評估、收斂才給方向、不在此報價）。
- **`execution_mode="default"`**（走 LLM，非模板）。

觸發後，LLM router 自動進入此 scenario，照 injection 指引漸進提問。**這塊不需改 enoract 程式，只是新增一個 scenario 定義 + 掛到 bot 的 `enabled_scenario_names`。**

### 塊 B — per-scenario 模型升級（需 enoract code）

最小變更集：

1. `Scenario` struct 加選用欄位：`model_override: str | None = None`（msgspec 加欄位向後相容，預設 None = 用 bot 既有 turn model）。
2. turn pipeline 解析 turn model 處（dispatcher / executor 的模型解析點）：若當前 scenario 有 `model_override`，用它覆蓋 per-bot model。
3. `requirement_brainstorm` scenario 設 `model_override="claude-opus-4-8"`（provider 走 anthropic-oauth，與既有 bot 一致）。
4. 確認 model registry 認得 `claude-opus-4-8` / anthropic-oauth 能服務它（部署前驗證）。

成本控制（符合「只釐清階段用 Opus」決策）：只有 `requirement_brainstorm` 這一個 scenario 走 Opus；FAQ/閒聊/報價仍 Haiku。Opus 只在訪客真的進入需求描述時啟用——天然限縮高成本範圍。

## 5. 風險與待確認

- **Opus token 成本**：Opus 4.8 ≈ Haiku 20–30×。已用 scenario gating 限縮到只有釐清階段，但仍需觀察：router 誤判把閒聊也分到 brainstorm → 不必要的 Opus 呼叫。緩解：`description` 寫精準（「描述具體需求」而非「任何提到做東西」）+ 上線後看 telemetry 校正。
- **anthropic-oauth token 過期**：全平台共用 token 會過期不自動續（見 [[elife-ai-line-bot]]），Opus 同樣受影響。
- **model registry 是否含 claude-opus-4-8**：塊 B 部署前必驗。
- **per-scenario model 的 fork 邊界**：`Scenario` 是框架層 struct，加欄位影響所有 fork——確認加選用欄位（預設 None）不破壞既有 scenario 反序列化。

## 6. 落地順序

1. **塊 A 先行**（純設定，零風險）：新增 `requirement_brainstorm` scenario，掛到 e-life-ai bot，先用現有 Haiku 跑，驗證 router 觸發準確度 + 提問流程體感。
2. 觀察 telemetry：觸發命中率、誤觸率、對話收斂品質。
3. **塊 B 跟進**（需 code）：Scenario 加 `model_override` + turn 解析 + 驗 Opus registry，再把 brainstorm scenario 切 Opus。
4. A/B：Haiku-brainstorm vs Opus-brainstorm 的收斂品質與成本，決定是否值得。

## 7. Demo 範本

`docs/demo/brainstorm-demo.html` — 純靜態示意頁，深色工程風，展示 brainstorm 對話流的理想長相（漸進一次一問、選擇題、軟收尾）。僅供內部對齊體感，非實際串接。
