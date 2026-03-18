/**
 * Embedding 服务 - 使用 TokenPoney API (qwen3-embedding-8b)
 */

export async function generateEmbedding(text: string): Promise<number[]> {
  const apiUrl = process.env.TOKENPONEY_API_URL || 'https://api.tokenpony.cn/v1';
  const apiKey = process.env.TOKENPONEY_API_KEY;

  if (!apiKey) {
    throw new Error('TOKENPONEY_API_KEY is not configured');
  }

  const response = await fetch(`${apiUrl}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'qwen3-embedding-8b',
      input: text,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Embedding API Error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  
  // OpenAI 兼容格式: data.data[0].embedding
  if (data.data && data.data[0] && data.data[0].embedding) {
    return data.data[0].embedding;
  }

  throw new Error(`Unexpected embedding response format: ${JSON.stringify(data)}`);
}

/**
 * 获取 embedding 维度
 */
export function getEmbeddingDimension(): number {
  return 4096; // qwen3-embedding-8b 输出维度
}
