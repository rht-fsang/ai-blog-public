import { db } from '@/db';
import { chunks } from '@/db/schema/rag';
import { sql, desc } from 'drizzle-orm';
import { generateEmbedding } from '@/lib/embedding';

export async function searchKnowledge(query: string, limit: number = 3) {
  // 1. 生成查询的向量
  const queryEmbedding = await generateEmbedding(query);

  // 2. 使用正确的向量格式进行检索
  // 将数组转换为 PostgreSQL 向量字符串格式
  const vectorStr = `[${queryEmbedding.join(',')}]`;

  // 3. 向量检索 (使用 raw SQL)
  const results = await db.execute(sql`
    SELECT content, 1 - (embedding <=> ${vectorStr}::vector) as similarity
    FROM chunks
    WHERE 1 - (embedding <=> ${vectorStr}::vector) > 0.3
    ORDER BY similarity DESC
    LIMIT ${limit}
  `);

  return results.rows as unknown as { content: string; similarity: number }[];
}
