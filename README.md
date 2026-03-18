# AI Blog - 智能知识库问答系统

基于 RAG（检索增强生成）架构的智能知识库系统，支持上传文档、自动向量化、智能问答。

## ✨ 特性

- 📄 **文档上传** - 支持 PDF、TXT、MD 格式
- 🔍 **向量检索** - 基于 pgvector 的语义相似度搜索
- 💬 **智能问答** - AI 基于知识库内容回答问题
- 🎨 **可配置** - 通过环境变量自定义站点信息
- 🌙 **暗色模式** - 自动适配系统主题

## 🛠 技术栈

- **前端**: Next.js 14, React 18, Tailwind CSS 4
- **后端**: Next.js API Routes, Drizzle ORM
- **数据库**: PostgreSQL + pgvector
- **AI**: 智谱 AI GLM-4-flash, qwen3-embedding-8b
- **文档处理**: pdf-parse, @langchain/textsplitters

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/ai-blog.git
cd ai-blog
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

复制示例文件并填入实际值：

```bash
cp .env.example .env.local
```

**必需配置：**

| 变量 | 说明 |
|------|------|
| `ZHIPU_API_KEY` | 智谱 AI API Key（[获取地址](https://open.bigmodel.cn/)） |
| `TOKENPONEY_API_KEY` | TokenPoney API Key（用于向量嵌入） |
| `DATABASE_URL` | PostgreSQL 连接字符串 |

**可选配置（站点个性化）：**

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `SITE_NAME` | 站点名称 | AI Blog |
| `SITE_OWNER_NAME` | 站主姓名 | Your Name |
| `SITE_OWNER_NICKNAME` | 站主昵称 | Nickname |
| `SITE_OWNER_TITLE` | 职位/身份 | 全栈工程师 / AI 探索者 |
| `SITE_OWNER_AVATAR` | 头像路径 | /header.jpg |
| `SITE_OWNER_BIO_1/2/3` | 个人简介（3段） | 默认简介文本 |
| `SITE_SKILLS` | 技术栈（逗号分隔） | TypeScript,React,... |
| `SITE_CONTACT_WECHAT` | 微信号 | - |
| `SITE_CONTACT_EMAIL` | 邮箱 | - |
| `SITE_CONTACT_GITHUB` | GitHub 主页 | - |
| `SITE_CONTACT_TWITTER` | Twitter 主页 | - |

### 4. 启动数据库

```bash
docker-compose up -d
```

### 5. 初始化数据库

```bash
# 安装 pgvector 扩展
psql -h localhost -U postgres -d ai_blog -c "CREATE EXTENSION IF NOT EXISTS vector;"

# 运行迁移
pnpm drizzle-kit push
```

### 6. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

## 📚 文档

- [技术架构](./docs/TECHNICAL_ARCHITECTURE.md)
- [开发指南](./docs/DEVELOPMENT.md)
- [API 文档](./docs/API.md)
- [部署指南](./docs/DEPLOYMENT.md)

## 📁 项目结构

```
ai-blog/
├── app/              # 页面和 API
├── components/       # React 组件
├── db/               # 数据库 Schema
├── lib/              # 工具函数和配置
│   └── config.ts     # 站点配置
├── services/         # 服务层
└── docs/             # 项目文档
```

## 🔧 常用命令

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
pnpm lint         # 代码检查
pnpm drizzle-kit studio  # 数据库管理界面
```

## 🚢 部署

### 使用部署脚本

```bash
# 在项目目录执行
./deploy.sh

# 或指定项目目录
./deploy.sh /path/to/ai-blog
```

### 手动部署

```bash
pnpm install
pnpm build
pm2 start pnpm --name ai-blog -- start
```

## 📄 License

MIT
