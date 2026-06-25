---
name: autobid
description: Send Tasker bids manually from this machine, or query autobid case state. autobid.db lives on OCI (source of truth); these wrappers keep the local machine in sync. Use when the user says 手動投標/發提案/查案件/autobid status, or asks a specific TK case's verdict.
---

autobid runs on OCI (`enoract-168`) on a cron loop. State is one SQLite table `cases` in `tasker-autobid/autobid.db` — gitignored, **OCI copy is the single source of truth**. Both wrappers in `tasker-autobid/` ssh to OCI; never edit the local db directly.

## Send a bid from this machine

```bash
tasker-autobid/propose-local.sh                     # live send + email
AUTOBID_DRY_RUN=1 tasker-autobid/propose-local.sh   # preview only
```

Flow: pull OCI db → run `autobid.py` locally → push this round's rows back via `INSERT OR REPLACE` (not a whole-file copy, so rows OCI's cron wrote meanwhile stay intact). Needs `TASKER_BEARER_TOKEN` exported (Tasker cookie `bearerToken`, expires → 401); `RESEND_API_KEY` auto-read from `../worker/.env`.

## Query case state (read-only, no local copy)

```bash
tasker-autobid/query-cases.sh                 # summary: counts per status + total + latest ts
tasker-autobid/query-cases.sh ls [status]     # list, optionally filtered by status
tasker-autobid/query-cases.sh find <keyword>  # fuzzy match on title/reason
tasker-autobid/query-cases.sh show <TK-no>    # all columns for one case
tasker-autobid/query-cases.sh sql "<SELECT>"  # custom read-only query (SELECT only)
```

`status` ∈ {not_fit, fit_no_budget, closed, skipped, submitted, submit_failed}.

## Don't migrate to Postgres

~50 rows, single table, low-frequency writes, no concurrent writers → SQLite + sync wrapper is correct. Switch to PG only when: multiple machines write concurrently, rows reach tens of thousands needing joins, or another service must read/write this data. None hold today.
