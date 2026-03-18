import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { db } from '@/db';
import { chunks } from '@/db/schema/rag';
import { generateEmbedding } from '@/lib/embedding';

export async function processDocument(documentId: number, content: string) {
  // 1. 文本分块
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });

  const splitDocs = await splitter.createDocuments([content]);

  console.log(`Processing document ${documentId}: ${splitDocs.length} chunks`);

  // 2. 为每个块生成向量并存储
  for (let i = 0; i < splitDocs.length; i++) {
    const doc = splitDocs[i];
    console.log(`Generating embedding for chunk ${i + 1}/${splitDocs.length}`);
    
    const embedding = await generateEmbedding(doc.pageContent);

    await db.insert(chunks).values({
      documentId,
      content: doc.pageContent,
      embedding: embedding,
    });
  }

  console.log(`Document ${documentId} processed successfully`);
}
