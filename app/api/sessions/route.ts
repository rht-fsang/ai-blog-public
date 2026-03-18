import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatSessions, chatMessages } from '@/db/schema/chat';
import { desc, eq } from 'drizzle-orm';

// 获取所有会话列表
export async function GET() {
  try {
    const sessions = await db
      .select()
      .from(chatSessions)
      .orderBy(desc(chatSessions.updatedAt));

    return NextResponse.json(sessions);
  } catch (error: any) {
    console.error('Get sessions error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 创建新会话
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title = body.title || '新对话';

    const [session] = await db
      .insert(chatSessions)
      .values({ title })
      .returning();

    return NextResponse.json(session);
  } catch (error: any) {
    console.error('Create session error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
