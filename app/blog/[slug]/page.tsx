import { db } from '@/db';
import { blogs } from '@/db/schema/blog';
import { eq } from 'drizzle-orm';
import { marked } from 'marked';

// 后备博客内容
const fallbackPosts: Record<string, { title: string; date: string; content: string }> = {
  'rag-architecture': {
    title: 'RAG 架构详解：让 AI 拥有知识库',
    date: '2024-03-15',
    content: `
## 什么是 RAG？

RAG（Retrieval-Augmented Generation）是一种结合检索和生成的 AI 架构。它让大语言模型能够基于外部知识库回答问题，而不仅仅依赖训练时的数据。

## 核心流程

1. **文档处理**：将文档分块并向量化存储
2. **语义检索**：根据用户问题检索最相关的文档片段
3. **增强生成**：将检索结果作为上下文，让 AI 生成更准确的回答

## 技术实现

\`\`\`typescript
// 1. 文档向量化
const embedding = await generateEmbedding(text);

// 2. 语义检索
const results = await db.execute(sql\`
  SELECT content, 1 - (embedding <=> query) as similarity
  FROM chunks
  ORDER BY similarity DESC
  LIMIT 3
\`);

// 3. 构建提示词
const prompt = \`根据以下资料回答问题：
\${context}

问题：\${query}\`;
\`\`\`

## 总结

RAG 架构让 AI 应用更加智能和实用，是企业级 AI 应用的关键技术之一。
    `,
  },
  'pgvector-guide': {
    title: 'PostgreSQL pgvector 入门指南',
    date: '2024-03-10',
    content: `
## 什么是 pgvector？

pgvector 是 PostgreSQL 的扩展，用于存储和检索向量数据。它支持多种距离度量方式，如余弦距离、欧几里得距离等。

## 安装

\`\`\`sql
CREATE EXTENSION vector;
\`\`\`

## 创建向量表

\`\`\`sql
CREATE TABLE embeddings (
  id bigserial PRIMARY KEY,
  content text,
  embedding vector(1536)
);
\`\`\`

## 插入和查询

\`\`\`sql
-- 插入向量
INSERT INTO embeddings (content, embedding)
VALUES ('Hello world', '[0.1, 0.2, ...]');

-- 余弦相似度检索
SELECT content, 1 - (embedding <=> '[0.1, 0.2, ...]') as similarity
FROM embeddings
ORDER BY embedding <=> '[0.1, 0.2, ...]'
LIMIT 5;
\`\`\`

## 总结

pgvector 让 PostgreSQL 成为优秀的向量数据库，适合中小规模的 AI 应用。
    `,
  },
  'nextjs-ai-chat': {
    title: '使用 Next.js 构建智能聊天应用',
    date: '2024-03-05',
    content: `
## 项目搭建

使用 Next.js 15+ 和 App Router 构建现代 AI 聊天应用。

\`\`\`bash
npx create-next-app@latest ai-chat
cd ai-chat
pnpm add ai
\`\`\`

## 流式响应

使用 Vercel AI SDK 实现流式响应：

\`\`\`typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const result = streamText({
    model: openai('gpt-4'),
    messages,
  });
  
  return result.toDataStreamResponse();
}
\`\`\`

## 前端实现

\`\`\`tsx
'use client';

import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleSubmit } = useChat();
  
  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>{m.content}</div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={e => setInput(e.target.value)} />
      </form>
    </div>
  );
}
\`\`\`

## 总结

Next.js + AI SDK 让构建 AI 应用变得简单高效。
    `,
  },
};

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  let post: { title: string; date: string; content: string } | null = null;

  try {
    const dbBlog = await db.select().from(blogs).where(eq(blogs.slug, slug));

    if (dbBlog.length > 0) {
      post = {
        title: dbBlog[0].title,
        date: dbBlog[0].createdAt.toISOString().split('T')[0],
        content: dbBlog[0].content,
      };
    } else {
      post = fallbackPosts[slug] || null;
    }
  } catch {
    post = fallbackPosts[slug] || null;
  }

  if (!post) {
    return (
      <main className="container mx-auto p-4 max-w-3xl py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">文章不存在</h1>
          <a href="/blog" className="text-blue-600 hover:underline">返回博客列表</a>
        </div>
      </main>
    );
  }

  // 渲染 Markdown
  const htmlContent = await marked(post.content);

  return (
    <main className="container mx-auto p-4 max-w-3xl py-8 md:py-12">
      <article className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 md:p-8">
        <header className="mb-6 md:mb-8">
          <a href="/blog" className="text-blue-600 hover:underline text-sm mb-4 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回列表
          </a>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {post.title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm md:text-base">{post.date}</p>
        </header>
        <div 
          className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </article>
    </main>
  );
}
