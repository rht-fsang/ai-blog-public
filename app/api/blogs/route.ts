import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogs } from '@/db/schema';
import { documents, chunks } from '@/db/schema/rag';
import { processDocument } from '@/lib/rag/process';
import { eq } from 'drizzle-orm';

// 获取博客列表
export async function GET() {
  try {
    const allBlogs = await db.select().from(blogs).orderBy(blogs.createdAt);
    return NextResponse.json(allBlogs);
  } catch (error) {
    console.error('Get blogs error:', error);
    return NextResponse.json({ error: '获取博客失败' }, { status: 500 });
  }
}

// 创建博客（自动同步到向量库）
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, slug, excerpt, tags } = body;

    if (!title || !content || !slug) {
      return NextResponse.json({ error: '标题、内容和 slug 都是必填项' }, { status: 400 });
    }

    // 检查 slug 是否已存在
    const existing = await db.select().from(blogs).where(eq(blogs.slug, slug));
    if (existing.length > 0) {
      return NextResponse.json({ error: '该 slug 已存在' }, { status: 400 });
    }

    const [blog] = await db.insert(blogs).values({
      title,
      content,
      slug,
      excerpt: excerpt || content.slice(0, 150),
      tags: tags || '',
    }).returning();

    // 同步到向量库（异步执行，不阻塞响应）
    syncBlogToRAG(blog.id, blog.title, blog.slug, blog.content).catch(e => 
      console.error('Failed to sync blog to RAG:', e)
    );

    return NextResponse.json({ success: true, blog });
  } catch (error) {
    console.error('Create blog error:', error);
    return NextResponse.json({ error: '创建博客失败' }, { status: 500 });
  }
}

// 删除博客（同时删除向量库数据）
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少博客 ID' }, { status: 400 });
    }

    // 获取博客信息
    const [blog] = await db.select().from(blogs).where(eq(blogs.id, parseInt(id)));
    
    // 删除博客
    await db.delete(blogs).where(eq(blogs.id, parseInt(id)));

    // 从向量库删除（异步执行）
    if (blog) {
      deleteBlogFromRAG(blog.id, blog.slug).catch(e => 
        console.error('Failed to delete blog from RAG:', e)
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete blog error:', error);
    return NextResponse.json({ error: '删除博客失败' }, { status: 500 });
  }
}

// 同步博客到向量库
async function syncBlogToRAG(blogId: number, title: string, slug: string, content: string) {
  try {
    // 创建文档记录
    const [doc] = await db.insert(documents).values({
      title: `blog:${blogId}:${slug}`,
    }).returning();

    // 处理博客内容（分块 + 向量化）
    const fullContent = `# ${title}\n\n${content}`;
    await processDocument(doc.id, fullContent);
    
    console.log(`Blog ${blogId} synced to RAG successfully`);
  } catch (e) {
    console.error(`Failed to sync blog ${blogId} to RAG:`, e);
  }
}

// 从向量库删除博客
async function deleteBlogFromRAG(blogId: number, slug: string) {
  try {
    // 查找对应的文档
    const docTitle = `blog:${blogId}:${slug}`;
    const existingDocs = await db.select().from(documents).where(eq(documents.title, docTitle));
    
    if (existingDocs.length > 0) {
      // 删除文档（chunks 会通过外键级联删除）
      await db.delete(documents).where(eq(documents.id, existingDocs[0].id));
      console.log(`Blog ${blogId} removed from RAG successfully`);
    }
  } catch (e) {
    console.error(`Failed to delete blog ${blogId} from RAG:`, e);
  }
}
