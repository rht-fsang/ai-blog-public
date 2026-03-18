import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogs } from '@/db/schema/blog';
import { documents } from '@/db/schema/rag';
import { processDocument } from '@/lib/rag/process';
import { eq } from 'drizzle-orm';

interface ParsedMarkdown {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string;
  date?: string;
}

// 解析 Markdown frontmatter
function parseMarkdown(markdown: string): ParsedMarkdown {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = markdown.match(frontmatterRegex);

  let frontmatter: Record<string, string> = {};
  let content = markdown;

  if (match) {
    const frontmatterText = match[1];
    content = match[2].trim();

    // 解析 frontmatter
    frontmatterText.split('\n').forEach((line) => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.slice(0, colonIndex).trim().toLowerCase();
        let value = line.slice(colonIndex + 1).trim();
        // 移除引号
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        frontmatter[key] = value;
      }
    });
  }

  // 生成 slug
  const slug = frontmatter.slug || frontmatter.title
    ?.toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '') || `post-${Date.now()}`;

  // 生成摘要（取前 200 字符，去掉 markdown 语法）
  const plainText = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_~>`-]/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  
  const excerpt = frontmatter.excerpt || frontmatter.description || plainText.slice(0, 200);

  return {
    title: frontmatter.title || '未命名文章',
    slug,
    content,
    excerpt,
    tags: frontmatter.tags || frontmatter.tag || '',
  };
}

// 上传 Markdown 文件
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '请选择文件' }, { status: 400 });
    }

    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
      return NextResponse.json({ error: '只支持 .md 或 .markdown 文件' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const markdown = buffer.toString('utf-8');
    const parsed = parseMarkdown(markdown);

    // 检查 slug 是否已存在
    const existing = await db.select().from(blogs).where(eq(blogs.slug, parsed.slug));
    if (existing.length > 0) {
      return NextResponse.json({ error: `Slug "${parsed.slug}" 已存在，请修改文件中的 slug 或标题` }, { status: 400 });
    }

    // 创建博客
    const [blog] = await db.insert(blogs).values({
      title: parsed.title,
      slug: parsed.slug,
      content: parsed.content,
      excerpt: parsed.excerpt,
      tags: parsed.tags,
    }).returning();

    // 同步到向量库（异步执行，不阻塞响应）
    syncBlogToRAG(blog.id, blog.title, blog.slug, blog.content).catch(e => 
      console.error('Failed to sync blog to RAG:', e)
    );

    return NextResponse.json({ 
      success: true, 
      blog,
      parsed: {
        title: parsed.title,
        slug: parsed.slug,
        excerpt: parsed.excerpt.slice(0, 100) + '...',
        tags: parsed.tags,
      }
    });
  } catch (error) {
    console.error('Upload markdown error:', error);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
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
