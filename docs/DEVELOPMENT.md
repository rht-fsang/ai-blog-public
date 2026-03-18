# 开发指南

## 环境要求

- Node.js 18+
- pnpm 7+
- PostgreSQL 15+ (需安装 pgvector 扩展)
- Docker (可选，用于本地数据库)

## 快速开始

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

创建 `.env.local` 文件：

```bash
ZHIPU_API_KEY=your_zhipu_api_key
DATABASE_URL=postgres://postgres:postgres@localhost:5432/ai_blog
```

### 4. 启动数据库

```bash
docker-compose up -d
```

### 5. 初始化数据库

```bash
# 连接数据库并安装 pgvector 扩展
psql -h localhost -U postgres -d ai_blog -c "CREATE EXTENSION IF NOT EXISTS vector;"

# 运行数据库迁移
pnpm drizzle-kit push
```

### 6. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

## 数据库管理

### 查看数据库 Schema

```bash
pnpm drizzle-kit studio
```

### 生成迁移文件

```bash
pnpm drizzle-kit generate
```

### 应用迁移

```bash
pnpm drizzle-kit push
```

## 项目结构

```
ai-blog/
├── app/                 # Next.js App Router 页面
│   ├── api/            # API 路由
│   ├── chat/           # 聊天页面
│   ├── knowledge/      # 知识库页面
│   └── documents/      # 文档详情页面
├── components/         # React 组件
│   ├── chat/          # 聊天相关组件
│   ├── layout/        # 布局组件
│   └── uploader/      # 上传组件
├── db/                 # 数据库配置
│   ├── schema/        # Drizzle Schema
│   └── migrations/    # 迁移文件
├── lib/                # 工具库
│   └── rag/           # RAG 处理逻辑
├── services/           # 服务层
│   └── ragService/    # RAG 服务
└── docs/               # 文档
```

## 常见问题

### Q: 向量检索返回空结果？

确保：
1. 已上传文档并成功处理
2. pgvector 扩展已安装
3. chunks 表中有数据

检查数据库：
```sql
SELECT COUNT(*) FROM chunks;
SELECT COUNT(*) FROM chunks WHERE embedding IS NOT NULL;
```

### Q: 文件上传失败？

检查：
1. 文件格式是否支持（PDF/TXT/MD）
2. 文件大小是否合理
3. 服务器日志中的错误信息

### Q: AI 响应很慢？

可能原因：
1. 智谱 API 响应延迟
2. 文档片段过多，上下文构建慢
3. 网络问题

## 调试技巧

### 查看 API 请求

使用浏览器开发者工具查看 Network 请求。

### 查看数据库查询

在 `db/index.ts` 中启用日志：

```typescript
export const db = drizzle(pool, {
  schema,
  logger: true,
});
```

### 测试向量检索

```typescript
import { searchKnowledge } from '@/services/ragService/search';

const results = await searchKnowledge('测试查询');
console.log(results);
```
