import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogs } from '@/db/schema/blog';
import { documents, chunks } from '@/db/schema/rag';
import { processDocument } from '@/lib/rag/process';
import { eq } from 'drizzle-orm';

// 同步博客文章到 RAG 知识库
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const blogId = body.blogId; // 可选：只同步指定博客

    // 获取要同步的博客
    const blogList = blogId
      ? await db.select().from(blogs).where(eq(blogs.id, blogId))
      : await db.select().from(blogs);

    const results = [];

    for (const blog of blogList) {
      try {
        // 检查是否已存在该博客的文档记录（通过 title 匹配）
        const existingDocs = await db.select().from(documents);
        const existingDoc = existingDocs.find(d => d.title === `blog:${blog.id}:${blog.slug}`);

        let documentId: number;

        if (existingDoc) {
          // 已存在，删除旧的 chunks
          documentId = existingDoc.id;
          // 注意：由于外键级联删除，需要先删除旧的文档记录
          await db.delete(documents).where(eq(documents.id, documentId));
        }

        // 创建新的文档记录
        const [newDoc] = await db.insert(documents).values({
          title: `blog:${blog.id}:${blog.slug}`,
        }).returning();
        documentId = newDoc.id;

        // 处理博客内容
        const fullContent = `# ${blog.title}\n\n${blog.content}`;
        await processDocument(documentId, fullContent);

        results.push({
          blogId: blog.id,
          title: blog.title,
          status: 'success',
          documentId,
        });
      } catch (e: any) {
        results.push({
          blogId: blog.id,
          title: blog.title,
          status: 'error',
          error: e.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      total: blogList.length,
      results,
    });
  } catch (error: any) {
    console.error('Sync blog to RAG error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
