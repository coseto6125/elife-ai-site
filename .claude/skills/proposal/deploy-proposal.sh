#!/usr/bin/env bash
# 一鍵把一份提案 HTML 部署上線到 service.e-life-ai.com 並啟用瀏覽追蹤。
#
# 用法：
#   .claude/skills/proposal/deploy-proposal.sh <提案HTML路徑> "<標籤>"
# 例：
#   .claude/skills/proposal/deploy-proposal.sh \
#     proposals/TK26061711IBDEQ89-order-extraction.html "訂單抽取案 TK26061711IBDEQ89"
#
# 它會：
#   1. 產生一個 12 位 hex 的 demo hash
#   2. 在 app/public/demo/<hash>/ 建自包含版本（index.html + assets/proposal.css + logo-mark.svg）
#      ‧ 把 ../logo/logo-mark.svg 改成同層 logo-mark.svg
#      ‧ 在 </footer> 後注入帶 label 的追蹤 beacon
#   3. commit + push main（觸發 GitHub Pages 部署）
#   4. 等部署完成，呼叫 /track/register 登記（總覽即顯示 0 次）
#   5. 印出 demo 網址與 stats 網址
#
# 前置：在 repo 根目錄執行；提案 HTML 已寫好（含 <meta robots noindex>）。
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel)
cd "$ROOT"

SRC="${1:?需要提案 HTML 路徑，例：proposals/TKxxxx-slug.html}"
LABEL="${2:?需要標籤（案件編號或客戶名），例：\"訂單抽取案 TKxxxx\"}"
WORKER="https://elife-ai-contact.digital-oasis-tw.workers.dev"

[ -f "$SRC" ] || { echo "✘ 找不到提案 HTML：$SRC" >&2; exit 1; }
[ -f proposals/assets/proposal.css ] || { echo "✘ 缺 proposals/assets/proposal.css" >&2; exit 1; }
[ -f logo/logo-mark.svg ] || { echo "✘ 缺 logo/logo-mark.svg" >&2; exit 1; }

# 1) 產 hash（環境禁 Math.random/Date.now in JS sandbox，但 shell 的 openssl 可用）
HASH=$(openssl rand -hex 6)
DIR="app/public/demo/$HASH"
echo "▸ demo hash：$HASH"

# 2) 建自包含版本
mkdir -p "$DIR/assets"
cp proposals/assets/proposal.css "$DIR/assets/proposal.css"
cp logo/logo-mark.svg "$DIR/logo-mark.svg"

# label 做 HTML/JS 安全處理：取代單引號避免破壞注入的 JS 字串
SAFE_LABEL=${LABEL//\'/’}

# 轉資產路徑 + 注入追蹤 beacon（在 </footer> 後）
sed "s#\.\./logo/logo-mark\.svg#logo-mark.svg#g" "$SRC" \
  | awk -v hash="$HASH" -v label="$SAFE_LABEL" -v worker="$WORKER" '
    /<\/footer>/ {
      print
      print "<!-- 提案瀏覽追蹤（只記開啟次數與時間，無 cookie、無個資） -->"
      print "<script>"
      print "  (function () {"
      print "    if (/[?&]preview=1\\b/.test(location.search)) return;"
      print "    var base = '\''" worker "/track'\'';"
      print "    var q = '\''?p=" hash "&label='\'' + encodeURIComponent('\''" label "'\'');"
      print "    new Image().src = base + q + '\''&t='\'' + Date.now();"
      print "  })();"
      print "</script>"
      next
    }
    { print }
  ' > "$DIR/index.html"

# 驗證注入成功（beacon 把 base 與 q 拆成兩個 JS 變數，故檢查 q 字串裡的 ?p=<hash>）
grep -q "?p=$HASH&label=" "$DIR/index.html" || { echo "✘ 追蹤腳本注入失敗" >&2; exit 1; }
echo "▸ 已建立 $DIR/（index.html + assets + logo，含追蹤）"

# 3) commit + push main
git add "$DIR"
git commit -q -m "feat(proposal): deploy $(basename "$SRC" .html) demo ($HASH)" \
  -m "Self-contained live copy under app/public/demo/$HASH/ (served at /demo/$HASH/, noindex), with label-tagged view-tracking beacon. Label: $LABEL"
echo "▸ 已 commit，push main…"
git push -q origin main

# 4) 等 Pages 部署完成
echo "▸ 等待 GitHub Pages 部署…"
RUN=$(gh run list --workflow=deploy.yml --limit 1 --json databaseId -q '.[0].databaseId')
for i in $(seq 1 30); do
  ST=$(gh run view "$RUN" --json status,conclusion -q '.status+" "+(.conclusion//"")' 2>/dev/null || echo "")
  case "$ST" in
    "completed success"*) echo "  部署成功"; break ;;
    "completed "*) echo "  ✘ 部署失敗：$ST" >&2; exit 1 ;;
    *) sleep 12 ;;
  esac
done

# 5) 登記追蹤（總覽即顯示 0 次）
ENC=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$LABEL")
curl -s "$WORKER/track/register?p=$HASH&label=$ENC" -H "Origin: https://service.e-life-ai.com" >/dev/null
echo "▸ 已登記追蹤"

echo
echo "════════════════════════════════════════════"
echo "  提案上線：https://service.e-life-ai.com/demo/$HASH/"
echo "  此案統計：https://service.e-life-ai.com/stats/?p=$HASH"
echo "  全部總覽：https://service.e-life-ai.com/stats/"
echo "════════════════════════════════════════════"
