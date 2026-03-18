import { db } from '@/db';
import { documents } from '@/db/schema/rag';
import { blogs } from '@/db/schema/blog';
import KnowledgeAuth from '@/components/auth/KnowledgeAuth';
import { cookies } from 'next/headers';
import ClientKnowledgePage from './ClientKnowledgePage';

export const dynamic = 'force-dynamic';

export default async function KnowledgePage() {
  // 检查是否已验证
  const cookieStore = await cookies();
  const isAuth = cookieStore.get('knowledge_auth')?.value === 'true';

  if (!isAuth) {
    return <KnowledgeAuth />;
  }

  const allDocuments = await db.select().from(documents);
  const sortedDocuments = allDocuments
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((doc) => ({
      id: doc.id,
      title: doc.title,
      createdAt: doc.createdAt.toISOString(),
    }));

  // 尝试获取博客，如果表不存在则返回空数组
  let serializedBlogs: Array<{
    id: number;
    slug: string;
    title: string;
    excerpt: string | null;
    tags: string | null;
    createdAt: string;
  }> = [];

  try {
    const allBlogs = await db.select().from(blogs);
    serializedBlogs = allBlogs.map((blog) => ({
      id: blog.id,
      slug: blog.slug,
      title: blog.title,
      excerpt: blog.excerpt,
      tags: blog.tags,
      createdAt: blog.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Failed to fetch blogs:', error);
    // 表可能不存在，返回空数组
  }

  return <ClientKnowledgePage initialDocuments={sortedDocuments} initialBlogs={serializedBlogs} />;
}
