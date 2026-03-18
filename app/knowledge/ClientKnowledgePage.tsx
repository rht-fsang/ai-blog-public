'use client';

import { useState } from 'react';
import KnowledgeManager from '@/components/uploader/KnowledgeManager';
import BlogManager from '@/components/uploader/BlogManager';

interface ClientKnowledgePageProps {
  initialDocuments: Array<{
    id: number;
    title: string;
    createdAt: string;
  }>;
  initialBlogs: Array<{
    id: number;
    slug: string;
    title: string;
    excerpt: string | null;
    tags: string | null;
    createdAt: string;
  }>;
}

export default function ClientKnowledgePage({ initialDocuments, initialBlogs }: ClientKnowledgePageProps) {
  const [activeTab, setActiveTab] = useState<'knowledge' | 'blog'>('knowledge');
  
  // 转换日期格式供 KnowledgeManager 使用
  const documents = initialDocuments.map((doc) => ({
    ...doc,
    createdAt: new Date(doc.createdAt),
  }));

  const blogs = initialBlogs.map((blog) => ({
    ...blog,
    createdAt: new Date(blog.createdAt),
  }));

  return (
    <main className="container mx-auto p-4 max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">内容管理</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          管理知识库文档和博客文章
        </p>
      </div>

      {/* 标签切换 */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'knowledge'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          知识库
        </button>
        <button
          onClick={() => setActiveTab('blog')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'blog'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          博客管理
        </button>
      </div>

      {/* 内容区域 */}
      {activeTab === 'knowledge' ? (
        <KnowledgeManager initialDocuments={documents} />
      ) : (
        <BlogManager initialBlogs={blogs} />
      )}
    </main>
  );
}
