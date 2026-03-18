import Link from 'next/link';
import { db } from '@/db';
import { blogs } from '@/db/schema/blog';
import { desc } from 'drizzle-orm';

// 强制动态渲染，不在构建时查询数据库
export const dynamic = 'force-dynamic';

// 模拟博客数据（作为后备）
const fallbackPosts = [
  {
    slug: 'rag-architecture',
    title: 'RAG 架构详解：让 AI 拥有知识库',
    excerpt: '深入理解检索增强生成（RAG）技术，如何让大语言模型基于私有数据回答问题。',
    date: '2024-03-15',
    tags: ['RAG', 'AI', 'LLM'],
    readTime: '8 分钟',
  },
  {
    slug: 'pgvector-guide',
    title: 'PostgreSQL pgvector 入门指南',
    excerpt: '使用 pgvector 扩展在 PostgreSQL 中存储和检索向量数据，构建语义搜索应用。',
    date: '2024-03-10',
    tags: ['PostgreSQL', 'Vector', 'Database'],
    readTime: '6 分钟',
  },
  {
    slug: 'nextjs-ai-chat',
    title: '使用 Next.js 构建智能聊天应用',
    excerpt: '从零开始构建一个支持流式响应的 AI 聊天应用，包含前后端完整实现。',
    date: '2024-03-05',
    tags: ['Next.js', 'React', 'AI'],
    readTime: '10 分钟',
  },
];

export default async function BlogPage() {
  // 尝试从数据库获取博客
  let posts: Array<{
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    tags: string[];
    readTime: string;
  }> = [];

  try {
    const dbBlogs = await db.select().from(blogs).orderBy(desc(blogs.createdAt));
    
    if (dbBlogs.length > 0) {
      posts = dbBlogs.map((blog) => ({
        slug: blog.slug,
        title: blog.title,
        excerpt: blog.excerpt || blog.content.slice(0, 150),
        date: blog.createdAt.toISOString().split('T')[0],
        tags: blog.tags ? blog.tags.split(',').map((t) => t.trim()) : [],
        readTime: `${Math.ceil(blog.content.length / 500)} 分钟`,
      }));
    } else {
      posts = fallbackPosts;
    }
  } catch (e) {
    // 数据库错误时使用后备数据
    console.error('Failed to fetch blogs:', e);
    posts = fallbackPosts;
  }

  return (
    <main className="container mx-auto p-4 max-w-4xl py-8 md:py-12">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">博客</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1 md:mt-2 text-sm md:text-base">
          技术文章、学习笔记和项目分享
        </p>
      </div>

      <div className="space-y-4 md:space-y-6">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="p-4 md:p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
          >
            <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-2 md:mb-3">
              <span>{post.date}</span>
              <span>·</span>
              <span>{post.readTime}</span>
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-1.5 md:mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              <Link href={`/blog/${post.slug}`}>
                {post.title}
              </Link>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-3 md:mb-4 text-sm md:text-base line-clamp-2">
              {post.excerpt}
            </p>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 md:px-2.5 py-0.5 md:py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="mt-8 md:mt-12 p-6 md:p-8 bg-gray-100 dark:bg-gray-800 rounded-xl text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
            暂无文章，敬请期待...
          </p>
        </div>
      )}
    </main>
  );
}
