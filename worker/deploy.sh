#!/usr/bin/env bash
# Deploy the contact-form Worker. Reads the CF token from .env (gitignored).
set -euo pipefail
cd "$(dirname "$0")"
set -a; source .env; set +a
npx wrangler deploy "$@"
