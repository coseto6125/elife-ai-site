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
  bonus?: boolean // value-add service, rendered as a full-width highlighted card
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

export interface Showcase {
  id: string
  no: string
  title: string
  clientType: string
  slug: string
  href: string // public deployed path, e.g. /showcase/<slug>/
  accent?: string // optional accent CSS var for per-card variety
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
    summary: '從架站、網域、前端介面到後端服務完整一條龍，好看、好用，而且撐得住量。',
    bullets: [
      'Vue 3 / React / Next.js / TypeScript 前端，響應式、體驗流暢',
      'FastAPI / Sanic 非同步後端，PostgreSQL / pgvector 資料層',
      '雲端部署：AWS（Lambda / ECS Fargate）、GCP、Docker 容器化',
      'CI/CD 自動化，從開發到上線一條龍',
    ],
    stack: ['Vue 3', 'React', 'Next.js', 'TypeScript', 'FastAPI', 'AWS', 'GCP', 'Docker'],
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
    summary: '效能熱點、協定逆向、程式碼圖譜，交給真的能下到底層的人。',
    bullets: [
      '14 種語言的程式碼結構圖譜與影響面分析（tree-sitter + Rust）',
      '協定層逆向與訊息送達驗證（Frida hook、記憶體解密）',
      '不可信輸入硬化：解壓縮炸彈、OOM、資料競爭防護',
      '對抗式測試找出並修復生產環境的隱性 bug',
    ],
    stack: ['Rust', 'tree-sitter', 'tokio', 'Frida', 'SQLCipher', 'Cypher'],
  },
  {
    id: 'cost',
    index: 'BONUS',
    title: '維運成本最佳化',
    bonus: true,
    summary: '無論硬體或軟體，用最小的花費撐起長期穩定運作，讓系統上線後養得起、跑得久。',
    bullets: [
      '架構選型直接砍掉冗餘雲端帳單，善用免費額度與自架資源',
      '程式層省成本：in-process 零 IPC、快取與非同步壓低運算開銷',
      'LLM 用量最佳化，token 消耗可省 70–90%，月費有感下降',
      '可觀測性與告警把關，異常即時發現，避免燒錢空轉',
    ],
    stack: ['GCP', 'OCI', 'Docker', 'cachebox', 'msgspec', 'Cloudflare', 'systemd'],
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
    id: 'enoract',
    name: 'Enoract — 多租戶 Agent 平台',
    kind: 'AI / 資料圖譜',
    blurb:
      'fork-first 多租戶 LLM agent 平台，零拷貝商品圖譜 + 圖像搜尋，知識擷取準確率 99.7%。',
    highlights: [
      'rkyv 二進位格式上的 Cypher 查詢，零拷貝抽取',
      '以圖搜圖（ONNX，免 PyO3）+ CJK 模糊比對',
      'free-threaded Python 3.14、import-linter 強制模組邊界',
    ],
    stack: ['Python 3.14', 'Sanic', 'psqlpy', 'polars', 'ONNX'],
    metric: { value: '99.7%', label: '知識擷取準確率' },
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
    metric: { value: 'OS 層', label: '送達驗證，杜絕假成功' },
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
    metric: { value: '10×', label: '快過無頭瀏覽器' },
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
    metric: { value: '4.8×', label: '符號查詢快過 CodeGraph' },
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
    desc: '小步快跑、每個里程碑可驗收。每次迭代都附完整測試覆蓋舊有場景，即便日後換人接手，也不會改 A 壞 B。',
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
  { value: '20+', label: '生產級專案上線' },
  { value: '60%+', label: 'AI 客服回應加速' },
  { value: '99.7%', label: '知識擷取準確率' },
  { value: '7×24', label: '穩定維運不斷線' },
]

export const techStack = [
  // languages
  'Rust',
  'Python 3.14',
  'Go',
  'TypeScript',
  // frontend
  'Vue 3',
  'React',
  'Next.js',
  'TanStack Router',
  'TanStack Query',
  'Tailwind CSS',
  'Zustand',
  'Vite',
  // backend frameworks
  'FastAPI',
  'Sanic',
  'tokio',
  'tree-sitter',
  // AI / LLM
  'LangChain',
  'LangGraph',
  'MCP',
  'Anthropic',
  'OpenAI',
  'Gemini',
  'Ollama',
  'NVIDIA NIM',
  'llama.cpp',
  'bge-m3',
  'Langfuse',
  // data / retrieval
  'PostgreSQL',
  'pgvector',
  'FAISS',
  'tantivy',
  'polars',
  'msgspec',
  'ONNX',
  'Redis',
  'rkyv',
  'Cypher',
  // scraping
  'never-primp',
  'patchright',
  // cloud / infra
  'AWS',
  'GCP',
  'OCI',
  'Cloudflare',
  'Docker',
  'systemd',
  'GitHub Actions',
  // systems / reverse engineering
  'Frida',
  'GDB',
  'SQLCipher',
]

/**
 * Interactive design templates (front-end only, mock data) showcasing design
 * range. Each lives at /showcase/<slug>/. Accents
 * alternate within the brand palette (mint / indigo) for visual variety.
 */
export const showcases: Showcase[] = [
  { id: 'saas-landing', no: '01', title: 'SaaS 產品著陸頁', clientType: 'B2B 軟體新創', slug: '01-saas-landing', href: '/showcase/01-saas-landing/', accent: 'var(--accent)' },
  { id: 'ecommerce', no: '02', title: '電商商品頁', clientType: '零售 / DTC 品牌', slug: '02-ecommerce', href: '/showcase/02-ecommerce/', accent: 'var(--accent-2)' },
  { id: 'restaurant', no: '03', title: '餐廳訂位與菜單', clientType: '餐飲', slug: '03-restaurant', href: '/showcase/03-restaurant/', accent: 'var(--accent)' },
  { id: 'portfolio', no: '04', title: '創意作品集', clientType: '設計師 / 攝影師', slug: '04-portfolio', href: '/showcase/04-portfolio/', accent: 'var(--accent-2)' },
  { id: 'corporate', no: '05', title: '企業形象官網', clientType: '傳產 / B2B', slug: '05-corporate', href: '/showcase/05-corporate/', accent: 'var(--accent)' },
  { id: 'editorial', no: '06', title: '編輯雜誌媒體', clientType: '媒體 / 內容品牌', slug: '06-editorial', href: '/showcase/06-editorial/', accent: 'var(--accent-2)' },
  { id: 'ai-chat', no: '07', title: 'AI 對話介面', clientType: 'AI 產品', slug: '07-ai-chat', href: '/showcase/07-ai-chat/', accent: 'var(--accent)' },
  { id: 'dashboard', no: '08', title: '數據分析儀表板', clientType: 'SaaS 後台', slug: '08-dashboard', href: '/showcase/08-dashboard/', accent: 'var(--accent-2)' },
  { id: 'event', no: '09', title: '活動 / 研討會', clientType: '活動主辦', slug: '09-event', href: '/showcase/09-event/', accent: 'var(--accent)' },
  { id: 'personal-brand', no: '10', title: '個人品牌 / 講者', clientType: '講師 / KOL', slug: '10-personal-brand', href: '/showcase/10-personal-brand/', accent: 'var(--accent-2)' },
  { id: 'real-estate', no: '11', title: '房地產建案展示', clientType: '建商 / 仲介', slug: '11-real-estate', href: '/showcase/11-real-estate/', accent: 'var(--accent)' },
  { id: 'clinic', no: '12', title: '醫療診所', clientType: '診所 / 醫美', slug: '12-clinic', href: '/showcase/12-clinic/', accent: 'var(--accent-2)' },
  { id: 'fitness', no: '13', title: '健身工作室', clientType: '健身 / 運動品牌', slug: '13-fitness', href: '/showcase/13-fitness/', accent: 'var(--accent)' },
  { id: 'course', no: '14', title: '線上課程平台', clientType: '教育 / 線上課程', slug: '14-course', href: '/showcase/14-course/', accent: 'var(--accent-2)' },
  { id: 'web3', no: '15', title: 'Web3 / 加密產品', clientType: '區塊鏈 / Web3', slug: '15-web3', href: '/showcase/15-web3/', accent: 'var(--accent)' },
  { id: 'travel', no: '16', title: '旅遊行程', clientType: '旅行社', slug: '16-travel', href: '/showcase/16-travel/', accent: 'var(--accent-2)' },
  { id: 'nonprofit', no: '17', title: '非營利募資', clientType: 'NGO / 公益', slug: '17-nonprofit', href: '/showcase/17-nonprofit/', accent: 'var(--accent)' },
  { id: 'app-landing', no: '18', title: 'App 下載著陸頁', clientType: '行動 App', slug: '18-app-landing', href: '/showcase/18-app-landing/', accent: 'var(--accent-2)' },
  { id: 'architecture', no: '19', title: '建築 / 室內設計事務所', clientType: '建築事務所', slug: '19-architecture', href: '/showcase/19-architecture/', accent: 'var(--accent)' },
  { id: 'game', no: '20', title: '遊戲 / 娛樂', clientType: '遊戲工作室', slug: '20-game', href: '/showcase/20-game/', accent: 'var(--accent-2)' },
  { id: 'coffee-roastery', no: '21', title: '獨立咖啡烘焙', clientType: '精品咖啡 / 烘焙', slug: 'coffee-roastery', href: '/showcase/coffee-roastery/', accent: 'var(--accent)' },
  { id: 'elearning-platform', no: '22', title: '線上課程平台', clientType: '教育 / 線上學習', slug: 'elearning-platform', href: '/showcase/elearning-platform/', accent: 'var(--accent-2)' },
  { id: 'fitness-studio', no: '23', title: '健身工作室', clientType: '健身 / 運動品牌', slug: 'fitness-studio', href: '/showcase/fitness-studio/', accent: 'var(--accent)' },
  { id: 'travel-hotel', no: '24', title: '旅宿品牌', clientType: '旅宿 / 觀光', slug: 'travel-hotel', href: '/showcase/travel-hotel/', accent: 'var(--accent-2)' },
  { id: 'law-firm', no: '25', title: '法律事務所', clientType: '法律 / 專業服務', slug: 'law-firm', href: '/showcase/law-firm/', accent: 'var(--accent)' },
  { id: 'music-artist', no: '26', title: '音樂藝人', clientType: '音樂 / 娛樂', slug: 'music-artist', href: '/showcase/music-artist/', accent: 'var(--accent-2)' },
  { id: 'wedding-event', no: '27', title: '婚禮邀請', clientType: '婚禮 / 活動', slug: 'wedding-event', href: '/showcase/wedding-event/', accent: 'var(--accent)' },
  { id: 'nonprofit-mission', no: '28', title: '非營利組織', clientType: 'NGO / 公益', slug: 'nonprofit', href: '/showcase/nonprofit/', accent: 'var(--accent-2)' },
  { id: 'ai-startup', no: '29', title: 'AI 新創產品', clientType: 'AI 新創', slug: 'ai-startup', href: '/showcase/ai-startup/', accent: 'var(--accent)' },
  { id: 'fashion-brand', no: '30', title: '時尚服飾品牌', clientType: '時尚 / 精品', slug: 'fashion-brand', href: '/showcase/fashion-brand/', accent: 'var(--accent-2)' },
  { id: 'game-esports', no: '31', title: '遊戲電競', clientType: '遊戲 / 電競', slug: 'game-esports', href: '/showcase/game-esports/', accent: 'var(--accent)' },
  { id: 'beauty-skincare', no: '32', title: '美妝保養品牌', clientType: '美妝 / 保養', slug: 'beauty-skincare', href: '/showcase/beauty-skincare/', accent: 'var(--accent-2)' },
  { id: 'architecture-studio', no: '33', title: '建築室內設計', clientType: '建築事務所', slug: 'architecture-studio', href: '/showcase/architecture-studio/', accent: 'var(--accent)' },
  { id: 'food-delivery', no: '34', title: '餐飲外送連鎖', clientType: '餐飲 / 外送', slug: 'food-delivery', href: '/showcase/food-delivery/', accent: 'var(--accent-2)' },
  { id: 'magazine', no: '35', title: '數位雜誌', clientType: '媒體 / 內容品牌', slug: 'magazine', href: '/showcase/magazine/', accent: 'var(--accent)' },
  { id: 'automotive', no: '36', title: '汽車載具', clientType: '汽車 / 載具', slug: 'automotive', href: '/showcase/automotive/', accent: 'var(--accent-2)' },
  { id: 'farm-organic', no: '37', title: '農產永續品牌', clientType: '農業 / 永續', slug: 'farm-organic', href: '/showcase/farm-organic/', accent: 'var(--accent)' },
  { id: 'photographer', no: '38', title: '攝影影像工作室', clientType: '攝影 / 影像', slug: 'photographer', href: '/showcase/photographer/', accent: 'var(--accent-2)' },
  { id: 'pet-service', no: '39', title: '寵物生活服務', clientType: '寵物 / 生活', slug: 'pet-service', href: '/showcase/pet-service/', accent: 'var(--accent)' },
  { id: 'conference', no: '40', title: '研討會活動', clientType: '活動主辦', slug: 'conference', href: '/showcase/conference/', accent: 'var(--accent-2)' },
  { id: 'artdeco-jewelry', no: '41', title: '高級珠寶世家 (Art Deco)', clientType: '精品 / 珠寶', slug: '41-artdeco-jewelry', href: '/showcase/41-artdeco-jewelry/', accent: 'var(--accent)' },
  { id: 'brutalist-streetwear', no: '42', title: '潮牌電商 (Neo-Brutalist)', clientType: '潮流 / 電商', slug: '42-brutalist-streetwear', href: '/showcase/42-brutalist-streetwear/', accent: 'var(--accent-2)' },
  { id: 'editorial-finedining', no: '43', title: '精緻餐飲 (Editorial)', clientType: '餐飲 / Fine Dining', slug: '43-editorial-finedining', href: '/showcase/43-editorial-finedining/', accent: 'var(--accent)' },
  { id: 'futuristic-ai-lab', no: '61', title: '未來主義 AI 實驗室', clientType: 'AI 研究 / 深科技', slug: '61-futuristic-ai-lab', href: '/showcase/61-futuristic-ai-lab/', accent: 'var(--accent-2)' },
  { id: 'luxury-jewelry', no: '62', title: '奢華精品珠寶', clientType: '精品 / 珠寶', slug: '62-luxury-jewelry', href: '/showcase/62-luxury-jewelry/', accent: 'var(--accent)' },
  { id: 'japanese-editorial', no: '63', title: '日系極簡雜誌', clientType: '設計 / 生活', slug: '63-japanese-editorial', href: '/showcase/63-japanese-editorial/', accent: 'var(--accent-2)' },
  { id: 'brutalist-portfolio', no: '64', title: '野獸派作品集', clientType: '設計工作室', slug: '64-brutalist-portfolio', href: '/showcase/64-brutalist-portfolio/', accent: 'var(--accent)' },
  { id: 'retro-arcade', no: '65', title: '復古街機遊戲', clientType: '遊戲工作室', slug: '65-retro-arcade', href: '/showcase/65-retro-arcade/', accent: 'var(--accent-2)' },
  { id: 'organic-eco', no: '66', title: '有機自然永續', clientType: '有機 / 保養', slug: '66-organic-eco', href: '/showcase/66-organic-eco/', accent: 'var(--accent)' },
  { id: 'fintech-dashboard', no: '67', title: '金融科技儀表板', clientType: '金融科技', slug: '67-fintech-dashboard', href: '/showcase/67-fintech-dashboard/', accent: 'var(--accent-2)' },
  { id: 'specialty-coffee', no: '68', title: '精品咖啡烘焙', clientType: '精品咖啡', slug: '68-specialty-coffee', href: '/showcase/68-specialty-coffee/', accent: 'var(--accent)' },
  { id: 'startup-saas', no: '69', title: '新創 SaaS 募資頁', clientType: 'SaaS 新創', slug: '69-startup-saas', href: '/showcase/69-startup-saas/', accent: 'var(--accent-2)' },
  { id: 'immersive-travel', no: '70', title: '沉浸式旅遊行程', clientType: '旅遊 / 體驗', slug: '70-immersive-travel', href: '/showcase/70-immersive-travel/', accent: 'var(--accent)' },
  { id: 'fitness-energetic', no: '71', title: '健身運動高能', clientType: '健身 / 運動', slug: '71-fitness-energetic', href: '/showcase/71-fitness-energetic/', accent: 'var(--accent-2)' },
  { id: 'fashion-ecommerce', no: '72', title: '時尚電商品牌', clientType: '時尚 / 電商', slug: '72-fashion-ecommerce', href: '/showcase/72-fashion-ecommerce/', accent: 'var(--accent)' },
  { id: 'medical-clinic', no: '73', title: '醫療診所信賴', clientType: '診所 / 醫療', slug: '73-medical-clinic', href: '/showcase/73-medical-clinic/', accent: 'var(--accent-2)' },
  { id: 'music-festival', no: '74', title: '音樂節活動', clientType: '活動 / 音樂', slug: '74-music-festival', href: '/showcase/74-music-festival/', accent: 'var(--accent)' },
  { id: 'architecture-studio-genline', no: '75', title: '建築工作室', clientType: '建築事務所', slug: '75-architecture-studio', href: '/showcase/75-architecture-studio/', accent: 'var(--accent-2)' },
  { id: 'edtech-platform', no: '76', title: '教育課程平台', clientType: '教育 / 線上學習', slug: '76-edtech-platform', href: '/showcase/76-edtech-platform/', accent: 'var(--accent)' },
  { id: 'web3-cyberpunk', no: '77', title: 'Web3 賽博龐克', clientType: '區塊鏈 / Web3', slug: '77-web3-cyberpunk', href: '/showcase/77-web3-cyberpunk/', accent: 'var(--accent-2)' },
  { id: 'artisan-craft', no: '78', title: '手作工藝品牌', clientType: '手作 / 工藝', slug: '78-artisan-craft', href: '/showcase/78-artisan-craft/', accent: 'var(--accent)' },
  { id: 'news-editorial', no: '79', title: '新聞編輯媒體', clientType: '媒體 / 新聞', slug: '79-news-editorial', href: '/showcase/79-news-editorial/', accent: 'var(--accent-2)' },
  { id: 'personal-kol', no: '80', title: '個人 KOL 品牌', clientType: '創作者 / KOL', slug: '80-personal-kol', href: '/showcase/80-personal-kol/', accent: 'var(--accent)' },
]
