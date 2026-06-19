#!/usr/bin/env bash
# 登記一份提案到瀏覽統計，使其在 /stats/ 總覽顯示（即使尚未被開啟，顯示 0 次）。
# 用法：./register-proposal.sh <hash> "<案件編號或客戶名>"
# 例：  ./register-proposal.sh fdfaa060df90 "訂單抽取案 TK26061711IBDEQ89"
set -euo pipefail

HASH="${1:?需要提案 hash（12 位 hex）}"
LABEL="${2:?需要標籤（案件編號或客戶名）}"
BASE="https://elife-ai-contact.digital-oasis-tw.workers.dev"

ENC=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$LABEL")
curl -s "$BASE/track/register?p=$HASH&label=$ENC" -H "Origin: https://service.e-life-ai.com"
echo
echo "→ 已登記。總覽：https://service.e-life-ai.com/stats/"
