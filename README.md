# e-life-ai — 接案形象官網

硬核工程外包形象站 · **[service.e-life-ai.com](https://service.e-life-ai.com)**

AI Agent · RAG · 程式碼圖譜 · 爬蟲 · 系統整合。

## 技術

- **Vite 8 + Vue 3 + TypeScript**（程式碼在 `app/`）
- 深色「Terminal-grade engineering」設計系統，內容集中在 `app/src/data/site.ts`
- Logo 套組在 `logo/`（horizontal / mark / light）

## 開發

```bash
cd app
pnpm install
pnpm dev      # 本機開發
pnpm build    # 產出 dist/
```

## 部署

push 到 `main` → GitHub Actions（`.github/workflows/deploy.yml`）自動 build 並部署到 GitHub Pages。

自訂網域 `service.e-life-ai.com` 由 `app/public/CNAME` 設定，DNS 走 Cloudflare（CNAME 指向 `coseto6125.github.io`）。
