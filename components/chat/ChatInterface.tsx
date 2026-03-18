'use client';

import { useRef, useEffect, useState, FormEvent } from 'react';
import { marked } from 'marked';

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      };

      setMessages((prev) => [...prev, assistantMessage]);

      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith('data:')) continue;
          
          const data = trimmedLine.replace(/^data:\s*/, '');
          if (data === '[DONE]') continue;
          
          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content || '';
            if (content) {
              accumulatedContent += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage.role === 'assistant') {
                  lastMessage.content = accumulatedContent;
                }
                return newMessages;
              });
            }
          } catch {
            // 忽略解析错误
          }
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '发送失败';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await sendMessage(inputValue);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-12rem)] bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-2xl overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
      
      <div className="flex-grow p-3 md:p-4 overflow-y-auto relative z-10">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse" />
              <img
                src="/header.jpg"
                alt="AI Avatar"
                className="relative w-16 h-16 md:w-20 md:h-20 rounded-full object-cover shadow-lg ring-2 ring-blue-500/50"
              />
            </div>
            <p className="text-lg md:text-xl font-medium bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              开始与 AI 对话
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-2 text-center px-4">
              基于知识库的智能问答，随时为您解答
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {['介绍一下你自己', '你有哪些技能', '最近的项目'].map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="px-3 py-1.5 text-xs md:text-sm bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-700/50 hover:border-blue-500/50 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {messages.map((m, index) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {m.role === 'assistant' && (
                  <img
                    src="/header.jpg"
                    alt="AI"
                    className="w-8 h-8 rounded-full object-cover mr-2 md:mr-3 flex-shrink-0 shadow-lg ring-2 ring-blue-500/30"
                  />
                )}
                <div
                  className={`max-w-[75%] md:max-w-[70%] p-3 md:p-4 backdrop-blur-sm ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl rounded-br-md shadow-lg shadow-blue-500/25'
                      : 'bg-gray-100 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-md border border-gray-200 dark:border-gray-700/50'
                  }`}
                >
                  <div className={`text-sm leading-relaxed break-words prose prose-sm dark:prose-invert max-w-none ${
                    m.role === 'user' ? 'text-white [&_code]:text-blue-100' : ''
                  }`}>
                    {m.role === 'assistant' ? (
                      <div dangerouslySetInnerHTML={{ __html: marked.parse(m.content) as string }} />
                    ) : (
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    )}
                    {m.role === 'assistant' && isLoading && messages[messages.length - 1].id === m.id && (
                      <span className="inline-block w-2 h-4 bg-blue-500 dark:bg-blue-400 ml-1 animate-blink" />
                    )}
                  </div>
                </div>
                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-sm ml-2 md:ml-3 flex-shrink-0 shadow-lg">
                    👤
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex justify-start animate-fade-in">
                <img
                  src="/header.jpg"
                  alt="AI"
                  className="w-8 h-8 rounded-full object-cover mr-2 md:mr-3 flex-shrink-0 shadow-lg ring-2 ring-blue-500/30"
                />
                <div className="bg-gray-100 dark:bg-gray-800/80 p-3 md:p-4 rounded-2xl rounded-bl-md border border-gray-200 dark:border-gray-700/50 backdrop-blur-sm">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-pink-500 dark:bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-500/10 border-t border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm backdrop-blur-sm">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-3 md:p-4 border-t border-gray-200 dark:border-gray-700/50 bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm relative z-10">
        <div className="flex gap-2 md:gap-3">
          <div className="flex-grow relative">
            <input
              className="w-full p-3 md:p-4 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-white text-sm md:text-base placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300"
              value={inputValue}
              placeholder="输入您的问题..."
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-500 hover:to-purple-500 disabled:from-gray-400 disabled:to-gray-500 dark:disabled:from-gray-600 dark:disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-300 font-medium text-sm md:text-base shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:shadow-none flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="hidden md:inline">发送中</span>
              </>
            ) : (
              <>
                <span>发送</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
        /* Markdown 样式 */
        :global(.prose code) {
          background: rgba(0, 0, 0, 0.1);
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
        }
        :global(.dark .prose code) {
          background: rgba(255, 255, 255, 0.1);
        }
        :global(.prose pre) {
          background: #1e293b;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
        }
        :global(.prose pre code) {
          background: transparent;
          padding: 0;
          color: #e2e8f0;
        }
      `}</style>
    </div>
  );
}
