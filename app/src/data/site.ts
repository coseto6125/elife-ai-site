/**
 * Single source of truth for site content.
 * Cases are distilled from real shipped work; client-identifying detail omitted.
 */

export interface Service {
  id: string
  index: string
  title: string
  summary: string
  bullets: string[]
  stack: string[]
}

export interface CaseStudy {
  id: string
  name: string
  kind: string
  blurb: string
  highlights: string[]
  stack: string[]
  metric?: { value: string; label: string }
}

export interface Step {
  no: string
  title: string
  desc: string
}

export interface Plan {
  id: string
  name: string
  price: string
  unit: string
  tagline: string
  features: string[]
  featured?: boolean
}

export interface Contact {
  channel: string // platform prefix, e.g. "LINE"
  label: string
  value: string
  href: string
}

export const services: Service[] = [
  {
    id: 'ai',
    index: '01',
    title: 'AI Agent 與 LLM 整合',
    summary: '從 RAG 檢索到多 Agent 編排，落地能在生產環境跑得穩的 AI 系統。',
    bullets: [
      '混合檢索（BM25 + 向量 + RRF 融合）與知識庫同步',
      '多 Agent 場景路由、人工接手、CSAT 與對話狀態偵測',
      '多模型供應商抽象（Anthropic / OpenAI / Gemini / Ollama）',
      'LLM 評測與品質打分管線（Langfuse 可觀測性）',
    ],
    stack: ['LangChain', 'LangGraph', 'FAISS', 'pgvector', 'Sanic', 'msgspec'],
  },
  {
    id: 'fullstack',
    index: '02',
    title: '全端網站與系統開發',
    summary: '從前端介面到後端服務一手包辦，好看、好用，而且撐得住量。',
    bullets: [
      'Vue 3 / Next.js / TypeScript 前端，響應式、體驗流暢',
      'FastAPI / Sanic 非同步後端，PostgreSQL / pgvector 資料層',
      '雲端部署：AWS（Lambda / ECS Fargate）、GCP、Docker 容器化',
      'CI/CD 自動化，從開發到上線一條龍',
    ],
    stack: ['Vue 3', 'Next.js', 'TypeScript', 'FastAPI', 'AWS', 'GCP', 'Docker'],
  },
  {
    id: 'data',
    index: '03',
    title: '爬蟲與資料工程',
    summary: '從反爬硬仗到 schema 化資料圖譜，把雜亂的網路資料變成可查詢的結構。',
    bullets: [
      '原生 HTTP + Rust 正則高速解析，必要時才上瀏覽器自動化',
      '電商比價 / 機票查詢跨站聚合（momo、PChome、OTA 等）',
      'schema.org 微資料 → 零拷貝知識圖譜（rkyv + Cypher 查詢）',
      '游標式輪詢、去重、抗資料庫停滯的穩定管線',
    ],
    stack: ['never-primp', 'polars', 'patchright', 'tantivy', 'Rust', 'ONNX'],
  },
  {
    id: 'systems',
    index: '04',
    title: '系統工程與技術顧問',
    summary: '效能熱點、協定逆向、程式碼圖譜，交給能下到底層的團隊。',
    bullets: [
      '14 種語言的程式碼結構圖譜與影響面分析（tree-sitter + Rust）',
      '協定層逆向與訊息送達驗證（Frida hook、記憶體解密）',
      '不可信輸入硬化：解壓縮炸彈、OOM、資料競爭防護',
      '對抗式測試找出並修復生產環境的隱性 bug',
    ],
    stack: ['Rust', 'tree-sitter', 'tokio', 'Frida', 'SQLCipher', 'Cypher'],
  },
]

export const cases: CaseStudy[] = [
  {
    id: 'raccoon',
    name: '多 Agent 客服 AI 平台',
    kind: 'AI / RAG / 生產級後端',
    blurb:
      '支援客服、訂房、商品推薦的場景式多 Agent 路由平台，並行檢索讓回應快 40–60%。',
    highlights: [
      '知識 + 商品並行檢索，混合 BM25 與向量搜尋',
      '多語言動態翻譯、人工接手工作流、Zendesk 整合',
      'ECS Fargate 部署，20+ 電商品牌串接',
    ],
    stack: ['Python', 'LangGraph', 'pgvector', 'FAISS', 'FastAPI'],
    metric: { value: '40–60%', label: '回應加速' },
  },
  {
    id: 'ecp',
    name: 'ECP — 程式碼圖譜引擎',
    kind: '系統工程 / 開發者工具',
    blurb:
      '為 AI Agent 打造的符號級程式碼圖譜，回答「誰呼叫了 X」「這次改動的影響面」，毫秒級查詢。',
    highlights: [
      '14 種語言統一 parser，單次 DFS 走訪將重建開銷降約 7%',
      'diff 驅動的影響面分析與間接派發偵測',
      '2000+ 分析器測試與 1000+ CLI 測試全綠',
    ],
    stack: ['Rust', 'tree-sitter', 'PostgreSQL', 'Cypher', 'Protobuf'],
    metric: { value: '14', label: '支援語言數' },
  },
  {
    id: 'eywa',
    name: 'Eywa — Agent 自我學習記憶引擎',
    kind: 'AI 基礎建設',
    blurb:
      '讓 AI Agent 持續累積經驗的原則記憶系統：自動捕捉工作洞見、結構化治理，在對的時機把對的原則餵回 Agent。',
    highlights: [
      'auto-capture 自動沉澱原則，category/domain 分類 + enum gate 把關品質',
      'bge-m3 向量 + tantivy 全文混合檢索，毫秒回灌',
      'MCP server 常駐，9000+ 原則上線運行',
    ],
    stack: ['Python', 'msgspec', 'bge-m3', 'tantivy', 'MCP'],
    metric: { value: '9000+', label: '常駐運行的原則數' },
  },
  {
    id: 'wechat',
    name: 'WeChat ↔ Chatwoot 橋接',
    kind: '協定逆向 / 系統整合',
    blurb:
      '即時微信訊息橋接，從 OS 層驗證送達，避免「GUI 按了但網路沒送出」的假成功。',
    highlights: [
      'Frida hook WeChat CGI 確認協定層 ACK',
      'SQLCipher 解密 + 差異讀取，游標追蹤防重複',
      '健康監控、崩潰退避、多 session 持久運行',
    ],
    stack: ['Rust', 'tokio', 'Axum', 'Frida', 'SQLCipher'],
  },
  {
    id: 'pricecompare',
    name: '台灣電商比價 / 機票查詢',
    kind: '爬蟲 / 資料聚合',
    blurb:
      '跨 momo、PChome、Coupang 等多站比價與七國機票查詢，純 API 直連端點，不靠瀏覽器渲染，MCP server 形式供 AI 自然語言調用。',
    highlights: [
      '純 API 直打資料端點，零瀏覽器、零 Playwright，比無頭瀏覽器快上一個量級',
      'Rust 正則高速解析 HTML、msgspec 結構化輸出，多站去重與價格正規化',
      'cachebox 快取層與全非同步架構，毫秒級併發查詢',
    ],
    stack: ['Python 3.13', 'FastMCP', 'never-primp', 'regex-rs', 'msgspec'],
  },
  {
    id: 'enoract',
    name: 'Enoract — 多租戶 Agent 平台',
    kind: 'AI / 資料圖譜',
    blurb:
      'fork-first 多租戶 LLM agent 平台，零拷貝商品圖譜 + DINOv2 圖像搜尋，價格抽取準確率 99.7%。',
    highlights: [
      'rkyv 二進位格式上的 Cypher 查詢，零拷貝抽取',
      'DINOv2 圖像搜尋（ONNX，免 PyO3）+ CJK 模糊比對',
      'free-threaded Python 3.14、import-linter 強制模組邊界',
    ],
    stack: ['Python 3.14', 'Sanic', 'psqlpy', 'polars', 'ONNX'],
    metric: { value: '99.7%', label: '價格抽取準確率' },
  },
]

export const steps: Step[] = [
  {
    no: '01',
    title: '需求釐清',
    desc: '一次線上對談，把模糊的想法收斂成可落地的範疇、技術選型與風險點。不收費。',
  },
  {
    no: '02',
    title: '方案與報價',
    desc: '提供架構草案、里程碑拆解與透明報價。確認後簽約，分階段付款。',
  },
  {
    no: '03',
    title: '迭代交付',
    desc: '小步快跑、每個里程碑可驗收。新功能附測試，bug 先補回歸測試再修。',
  },
  {
    no: '04',
    title: '交付與維運',
    desc: '完整文件、原始碼與部署。可選後續維運、效能調校與功能擴充。',
  },
]

export const plans: Plan[] = [
  {
    id: 'consult',
    name: '技術顧問',
    price: 'NT$2,800',
    unit: '/ 小時',
    tagline: '架構審查、選型、效能診斷、卡關救援。',
    features: ['架構與技術選型建議', '效能熱點診斷', '程式碼審查', 'AI / RAG 落地評估'],
  },
  {
    id: 'project',
    name: '專案承接',
    price: '依範疇',
    unit: '報價',
    tagline: '從 MVP 到生產級系統，里程碑式交付。',
    features: [
      '完整需求釐清與架構設計',
      '分階段交付、可驗收里程碑',
      '功能附測試、bug 附回歸測試',
      '原始碼 + 文件 + 部署',
    ],
    featured: true,
  },
  {
    id: 'retainer',
    name: '長期合作',
    price: '月約',
    unit: '保留檔期',
    tagline: '穩定維運、持續迭代、優先回應。',
    features: ['每月保留固定工時', '優先回應與維運', '持續效能調校', '功能擴充與技術升級'],
  },
]

export const contacts: Contact[] = [
  {
    channel: 'Email',
    label: '來信洽詢',
    value: 'service@e-life-ai.com',
    href: 'mailto:service@e-life-ai.com',
  },
  {
    channel: 'LINE',
    label: '官方帳號',
    value: '@936pvpoq',
    href: 'https://line.me/R/ti/p/@936pvpoq',
  },
  {
    channel: 'GitHub',
    label: '開源作品',
    value: 'github.com/coseto6125',
    href: 'https://github.com/coseto6125',
  },
]

export const stats = [
  { value: '14', label: '程式碼圖譜支援語言' },
  { value: '前+後', label: '全端一手包辦' },
  { value: '20+', label: '生產級專案上線' },
  { value: '99.7%', label: '資料抽取準確率' },
]

export const techStack = [
  'Rust',
  'Python 3.14',
  'Go',
  'TypeScript',
  'Vue 3',
  'Next.js',
  'Vite',
  'tree-sitter',
  'tokio',
  'FastAPI',
  'Sanic',
  'LangChain',
  'LangGraph',
  'PostgreSQL',
  'pgvector',
  'FAISS',
  'tantivy',
  'polars',
  'msgspec',
  'ONNX',
  'Docker',
  'AWS Lambda',
  'Frida',
]
