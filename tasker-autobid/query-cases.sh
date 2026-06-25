#!/usr/bin/env bash
# 從本機查 OCI 上的 autobid.db（真實來源），唯讀、不留本地副本、永遠查最新。
#
# autobid.db 在 .gitignore、OCI cron 常態在寫，本機這份隨時可能過時；要查「現在
# 投了哪些案、某案判定如何」時，直接讀 OCI 那份最準。SQLite 無連線 server，所以用
# ssh 到 OCI 跑 sqlite3，把結果帶回。
#
# 用法：
#   query-cases.sh                       總覽（各 status 筆數）
#   query-cases.sh ls [status]           列出全部，或只列某 status（如 submitted）
#   query-cases.sh find <關鍵字>          標題/理由模糊搜尋
#   query-cases.sh show <TK案號>          單一案件所有欄位
#   query-cases.sh sql "<SQL>"           自訂唯讀 SQL（限 SELECT）
set -euo pipefail

OCI=enoract-168
SSH_KEY="$HOME/.ssh/oci_enoract"
OCI_DB='~/tasker-autobid/autobid.db'

# sqlite3 在 OCI 上以唯讀模式開檔，避免干擾正在寫的 cron。
q() { ssh -i "$SSH_KEY" "$OCI" "sqlite3 -readonly -header -column $OCI_DB \"$1\""; }

cmd="${1:-summary}"
case "$cmd" in
  summary)
    q "SELECT status, count(*) AS n FROM cases GROUP BY status ORDER BY n DESC;"
    q "SELECT count(*) AS total, max(datetime(ts,'unixepoch','localtime')) AS latest FROM cases;"
    ;;
  ls)
    where=""
    [ "${2:-}" ] && where="WHERE status='$2'"
    q "SELECT tk_no, status, budget, substr(title,1,32) AS title FROM cases $where ORDER BY ts DESC;"
    ;;
  find)
    kw="${2:?用法：query-cases.sh find <關鍵字>}"
    q "SELECT tk_no, status, substr(title,1,30) AS title, substr(reason,1,40) AS reason
       FROM cases WHERE title LIKE '%$kw%' OR reason LIKE '%$kw%' ORDER BY ts DESC;"
    ;;
  show)
    tk="${2:?用法：query-cases.sh show <TK案號>}"
    ssh -i "$SSH_KEY" "$OCI" "sqlite3 -readonly -line $OCI_DB \"SELECT * FROM cases WHERE tk_no='$tk';\""
    ;;
  sql)
    sql="${2:?用法：query-cases.sh sql \"<SELECT ...>\"}"
    case "$sql" in
      [Ss][Ee][Ll][Ee][Cc][Tt]*) q "$sql" ;;
      *) echo "✘ 只允許 SELECT 查詢" >&2; exit 1 ;;
    esac
    ;;
  *)
    grep -E '^#( |$)' "$0" | sed 's/^# \{0,1\}//'
    ;;
esac
