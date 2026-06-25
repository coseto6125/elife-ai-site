#!/usr/bin/env bash
# 本機手動發提案 + 與 OCI 共用單一真實來源的 autobid.db。
#
# 為什麼需要這支：autobid.db 在 .gitignore，本機與 OCI 各有一份。OCI cron 常態
# 在寫，本機偶爾手動發也要寫，兩份會 diverge。OCI 那份是真實來源，所以本機發提案
# 前先把 OCI 的 db 拉下來（取得最新「已判過」狀態，避免重判），發完只把本機這輪
# 新增/變動的列 upsert 回 OCI（不整檔覆蓋，才不會蓋掉拉取後 OCI cron 又寫的列）。
#
# 用法：
#   tasker-autobid/propose-local.sh            # 真送 + 真寄（AUTOBID_DRY_RUN=0）
#   AUTOBID_DRY_RUN=1 tasker-autobid/propose-local.sh   # 只預覽不送
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

OCI=enoract-168
SSH_KEY="$HOME/.ssh/oci_enoract"
OCI_DB='~/tasker-autobid/autobid.db'
LOCAL_DB="$DIR/autobid.db"

ssh_oci() { ssh -i "$SSH_KEY" "$OCI" "$@"; }

echo "▸ 1/3 拉 OCI autobid.db（真實來源）→ 本機"
rsync -az -e "ssh -i $SSH_KEY" "$OCI:$OCI_DB" "$LOCAL_DB"

echo "▸ 2/3 本機跑 autobid.py"
export TASKER_BEARER_TOKEN="${TASKER_BEARER_TOKEN:?需先 export TASKER_BEARER_TOKEN（Tasker cookie bearerToken）}"
export RESEND_API_KEY="${RESEND_API_KEY:-$(grep -E '^RESEND_API_KEY=' ../worker/.env | cut -d= -f2)}"
export AUTOBID_DRY_RUN="${AUTOBID_DRY_RUN:-0}"
uv run autobid.py

echo "▸ 3/3 把本機這輪的列 upsert 回 OCI（INSERT OR REPLACE，不覆蓋 OCI 其他列）"
# 本機 record() 用 INSERT OR REPLACE，這裡用同一語意把本機 cases 推回 OCI：
# 期間 OCI cron 若寫了本機沒碰的案，那些列原樣保留；只有本機這輪動到的 tk_no 被覆蓋。
sqlite3 "$LOCAL_DB" \
  ".mode insert cases" \
  "SELECT * FROM cases;" \
  | sed 's/^INSERT INTO/INSERT OR REPLACE INTO/' \
  | ssh_oci "sqlite3 $OCI_DB"

echo "✓ 完成：本機已發提案，OCI autobid.db 已同步本機這輪變動"
