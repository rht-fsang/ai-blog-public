import { db } from '@/db';
import { documents, chunks } from '@/db/schema/rag';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const documentId = parseInt(id);

  if (isNaN(documentId)) {
    notFound();
  }

  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId));

  if (!document) {
    notFound();
  }

  const documentChunks = await db
    .select()
    .from(chunks)
    .where(eq(chunks.documentId, documentId));

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/knowledge"
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← 返回知识库
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {document.title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          创建于 {new Date(document.createdAt).toLocaleString('zh-CN')}
        </p>

        <div className="border-t dark:border-gray-700 pt-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            文档片段 ({documentChunks.length})
          </h2>
          <div className="space-y-4">
            {documentChunks.map((chunk, index) => (
              <div
                key={chunk.id}
                className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  片段 #{index + 1}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {chunk.content}
                </p>
              </div>
            ))}
            {documentChunks.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                暂无内容片段
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
