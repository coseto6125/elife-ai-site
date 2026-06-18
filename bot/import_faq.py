"""
One-off: import e-life-ai 接案客服 FAQ into the bot's QA knowledge set.

Runs the real KnowledgePipeline.start_qa_set (embeds via Cloudflare bge-m3,
writes chunks, rebuilds the bm25 replica) so retrieval works end-to-end.

Run ON the OCI host where DATABASE_URL points at prod and the Cloudflare
embedder env (CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_AUTH_TOKEN) is set:

    cd ~/enoract && python -m scripts.import_elife_faq /path/to/faq.json

faq.json: list of {category, question, answer}.
"""

from __future__ import annotations

import asyncio
import json
import os
import sys
from pathlib import Path

from enoract.bootloader import logger
from enoract.shared.client.base.db import BaseDBPool
from enoract.shared.client.chunks_store import ChunksStore
from enoract.shared.client.embedder import create_embedder
from enoract.console.knowledge.pipeline import KnowledgePipeline

BOT_SLUG = "e-life-ai"
ORG_ID = 2
ORG_SLUG = "enoract"
EMBEDDING_MODEL = "@cf/baai/bge-m3"  # must match existing prod chunks (dim 1024)
CACHE_ROOT = Path(os.environ.get("ENORACT_CACHE_ROOT", "/tmp/enoract-cache"))


async def main() -> None:
    if len(sys.argv) < 2:
        logger.error("usage: python -m scripts.import_elife_faq <faq.json>")
        sys.exit(1)
    faq_path = Path(sys.argv[1])
    rows = json.loads(faq_path.read_text(encoding="utf-8"))
    pairs = [(r["question"], r["answer"], r.get("category")) for r in rows]
    logger.info("loaded %d FAQ pairs from %s", len(pairs), faq_path)

    dsn = os.environ.get("DATABASE_URL")
    if not dsn:
        logger.error("DATABASE_URL must be set (point at prod)")
        sys.exit(1)

    pool = BaseDBPool(dsn)
    embedder = create_embedder()  # cloudflare bge-m3 from env
    pipeline = KnowledgePipeline(
        chunks_store=ChunksStore(pool),
        embedder=embedder,
        cache_root=CACHE_ROOT,
        embedding_model=EMBEDDING_MODEL,
        pool=pool,
    )
    try:
        job_id = pipeline.start_qa_set(
            bot_slug=BOT_SLUG, pairs=pairs, org_id=ORG_ID, org_slug=ORG_SLUG
        )
        logger.info("queued QA import job %s — waiting…", job_id)
        await pipeline.drain()
        status = await pipeline.get_status(job_id)
        logger.info(
            "done: state=%s built=%s embedded=%s",
            getattr(status, "state", "?"),
            getattr(status, "chunks_built", "?"),
            getattr(status, "chunks_embedded", "?"),
        )
    finally:
        pool.close()


if __name__ == "__main__":
    asyncio.run(main())
