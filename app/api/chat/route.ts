import { NextRequest } from 'next/server';
import { searchKnowledge } from '@/services/ragService/search';
import { getAISystemPrompt } from '@/lib/config';

// 使用 Node runtime 以支持数据库操作
// export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: any[] = body.messages ?? [];
    const currentMessageContent = messages[messages.length - 1]?.content;

    // 1. 检索相关知识
    let contextText = '';
    try {
      const contextResults = await searchKnowledge(currentMessageContent);
      contextText = contextResults.map((r: any) => r.content).join('\n\n');
    } catch (e) {
      console.error('RAG Search Error:', e);
    }

    // 2. 构造增强后的消息
    const hasContext = !!contextText;
    const systemPrompt = getAISystemPrompt(hasContext);
    const finalSystemPrompt = hasContext
      ? systemPrompt.replace('{context}', contextText)
      : systemPrompt;

    const zhipuMessages = [
      { role: 'system', content: finalSystemPrompt },
      ...messages.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: currentMessageContent },
    ];

    // 3. 调用智谱 AI
    const zhipuResponse = await fetch(
      'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.ZHIPU_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'glm-4-flash',
          messages: zhipuMessages,
          stream: true,
          max_tokens: 65536,
          temperature: 1.0,
        }),
      }
    );

    const stream = zhipuResponse.body;

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
