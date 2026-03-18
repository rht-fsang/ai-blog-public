'use client';

import Link from 'next/link';

export default function ToolsPage() {
  const tools = [
    {
      title: 'AI 聊天',
      description: '基于 RAG 的智能对话系统，可以回答知识库中的问题',
      href: '/chat',
      icon: '💬',
      status: 'online',
    },
    {
      title: 'JSON 格式化',
      description: '在线 JSON 格式化、压缩、校验工具',
      href: '#',
      icon: '📝',
      status: 'coming',
    },
    {
      title: 'Base64 编解码',
      description: '文本和图片的 Base64 编码解码工具',
      href: '#',
      icon: '🔐',
      status: 'coming',
    },
    {
      title: '正则测试',
      description: '实时正则表达式测试和匹配工具',
      href: '#',
      icon: '🔍',
      status: 'coming',
    },
    {
      title: '时间戳转换',
      description: '时间戳与日期格式互相转换',
      href: '#',
      icon: '⏰',
      status: 'coming',
    },
    {
      title: '颜色选择器',
      description: 'RGB、HEX、HSL 颜色转换和取色',
      href: '#',
      icon: '🎨',
      status: 'coming',
    },
  ];

  return (
    <main className="container mx-auto p-4 max-w-6xl py-8 md:py-12">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">开发工具</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1 md:mt-2 text-sm md:text-base">
          常用在线开发工具集合，提升开发效率
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.title}
            href={tool.href}
            className={`p-4 md:p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors ${
              tool.status === 'online'
                ? 'hover:border-blue-500 dark:hover:border-blue-500 group'
                : 'opacity-60 cursor-not-allowed'
            }`}
            onClick={(e) => tool.status === 'coming' && e.preventDefault()}
          >
            <div className="flex items-start justify-between mb-2 md:mb-3">
              <div className="text-2xl md:text-3xl">{tool.icon}</div>
              {tool.status === 'coming' && (
                <span className="px-2 py-0.5 md:py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded">
                  即将上线
                </span>
              )}
            </div>
            <h3 className={`text-base md:text-lg font-semibold mb-1.5 md:mb-2 ${
              tool.status === 'online'
                ? 'text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
                : 'text-gray-900 dark:text-white'
            }`}>
              {tool.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">
              {tool.description}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
