import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogs } from '@/db/schema';
import { eq } from 'drizzle-orm';

// 获取单个博客
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const blog = await db.select().from(blogs).where(eq(blogs.id, parseInt(id)));

    if (blog.length === 0) {
      return NextResponse.json({ error: '博客不存在' }, { status: 404 });
    }

    return NextResponse.json(blog[0]);
  } catch (error) {
    return NextResponse.json({ error: '获取博客失败' }, { status: 500 });
  }
}

// 更新博客
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, content, slug, excerpt, tags } = body;

    const [updated] = await db
      .update(blogs)
      .set({
        title,
        content,
        slug,
        excerpt: excerpt || content?.slice(0, 150),
        tags,
        updatedAt: new Date(),
      })
      .where(eq(blogs.id, parseInt(id)))
      .returning();

    return NextResponse.json({ success: true, blog: updated });
  } catch (error) {
    console.error('Update blog error:', error);
    return NextResponse.json({ error: '更新博客失败' }, { status: 500 });
  }
}

// 删除博客
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(blogs).where(eq(blogs.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: '删除博客失败' }, { status: 500 });
  }
}
