import { NextRequest, NextResponse } from 'next/server';
import * as pdf from 'pdf-parse';
const parsePdf = (pdf as any).default || pdf;
import { db } from '@/db';
import { documents } from '@/db/schema/rag';
import { processDocument } from '@/lib/rag/process';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let content = '';

    if (file.name.endsWith('.pdf')) {
      const data = await parsePdf(buffer);
      content = data.text;
    } else if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      content = buffer.toString('utf-8');
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    // 1. 保存文档元数据
    const [doc] = await db.insert(documents).values({
      title: file.name,
    }).returning();

    // 2. 异步处理分块和向量化
    // 注意：在实际生产环境中，建议使用任务队列（如 BullMQ）来处理
    await processDocument(doc.id, content);

    return NextResponse.json({ success: true, documentId: doc.id });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
