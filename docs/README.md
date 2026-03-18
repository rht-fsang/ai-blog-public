# AI Blog 文档

欢迎查阅 AI Blog 项目文档。

## 文档目录

### 架构与设计

- [技术架构](./TECHNICAL_ARCHITECTURE.md) - 系统架构、技术栈、数据流程

### 开发指南

- [开发指南](./DEVELOPMENT.md) - 环境配置、开发流程、常见问题
- [API 文档](./API.md) - 所有 API 接口说明

### 部署运维

- [部署指南](./DEPLOYMENT.md) - Vercel/Docker/自托管部署方案

## 快速链接

| 文档 | 说明 |
|------|------|
| [技术架构](./TECHNICAL_ARCHITECTURE.md) | 了解系统整体设计 |
| [开发指南](./DEVELOPMENT.md) | 开始本地开发 |
| [API 文档](./API.md) | 查看接口说明 |
| [部署指南](./DEPLOYMENT.md) | 部署到生产环境 |

## 项目概览

AI Blog 是一个基于 RAG（检索增强生成）架构的智能知识库系统：

- 📄 上传文档自动向量化
- 🔍 智能向量检索
- 💬 基于知识库的 AI 问答
- 🚀 Next.js 16 + Turbopack
- 🗄️ PostgreSQL + pgvector

## 技术栈

- **前端**: Next.js 16, React 18, Tailwind CSS 4
- **后端**: Next.js API Routes, Drizzle ORM
- **数据库**: PostgreSQL + pgvector
- **AI**: 智谱 AI GLM-4-flash, embedding-2
- **文档处理**: pdf-parse, @langchain/textsplitters
