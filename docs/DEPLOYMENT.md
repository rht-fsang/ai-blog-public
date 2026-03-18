# 部署指南

## 部署到 Vercel

### 1. 准备工作

- GitHub 仓库
- Vercel 账号
- 智谱 AI API Key
- PostgreSQL 数据库（推荐 Supabase/Neon/PlanetScale）

### 2. 创建数据库

推荐使用支持 pgvector 的云数据库：

- **Supabase**: https://supabase.com (免费额度，内置 pgvector)
- **Neon**: https://neon.tech (免费额度，支持 pgvector)
- **Railway**: https://railway.app (支持 PostgreSQL + pgvector)

### 3. 配置环境变量

在 Vercel 项目设置中添加：

```
ZHIPU_API_KEY=your_zhipu_api_key
DATABASE_URL=your_database_url
```

### 4. 部署

1. 连接 GitHub 仓库到 Vercel
2. 自动部署

### 5. 初始化数据库

部署后，连接数据库执行：

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## 部署到自托管服务器

### Docker 部署

#### 1. 创建 Dockerfile

```dockerfile
FROM node:18-alpine AS base

# 安装依赖
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# 构建
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm run build

# 运行
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

#### 2. 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - ZHIPU_API_KEY=${ZHIPU_API_KEY}
      - DATABASE_URL=postgres://postgres:postgres@db:5432/ai_blog
    depends_on:
      - db

  db:
    image: pgvector/pgvector:pg15
    environment:
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=ai_blog
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  pgdata:
```

#### 3. 构建并运行

```bash
docker-compose up -d
```

### PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 构建
pnpm build

# 启动
pm2 start pnpm --name "ai-blog" -- start

# 保存配置
pm2 save
pm2 startup
```

## 环境变量说明

| 变量名 | 必需 | 说明 |
|--------|------|------|
| ZHIPU_API_KEY | 是 | 智谱 AI API Key |
| DATABASE_URL | 是 | PostgreSQL 连接字符串 |

## 性能优化建议

### 1. 向量索引

对于大量数据，创建向量索引：

```sql
-- IVFFlat 索引（适合中等规模数据）
CREATE INDEX ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- HNSW 索引（适合大规模数据，需要 PostgreSQL 15+）
CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
```

### 2. 连接池

在生产环境中配置连接池：

```typescript
// db/index.ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 3. 缓存

考虑添加 Redis 缓存：

- 缓存频繁查询的向量结果
- 缓存会话历史

## 监控

### 健康检查

```typescript
// app/api/health/route.ts
export async function GET() {
  // 检查数据库连接
  // 检查 AI API 连接
  return Response.json({ status: 'ok' });
}
```

### 日志

使用 Pino 或 Winston 进行日志记录。

## 备份

定期备份 PostgreSQL 数据库：

```bash
pg_dump -h localhost -U postgres ai_blog > backup.sql
```
