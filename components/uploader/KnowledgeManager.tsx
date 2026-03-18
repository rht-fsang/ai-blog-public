'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Document {
  id: number;
  title: string;
  createdAt: Date;
}

interface KnowledgeManagerProps {
  initialDocuments: Document[];
}

export default function KnowledgeManager({ initialDocuments }: KnowledgeManagerProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        alert('上传并处理成功！');
        window.location.reload();
      } else {
        const error = await res.json();
        alert(`上传失败: ${error.error}`);
      }
    } catch (err) {
      alert('上传发生错误');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: number) => {
    if (!confirm('确定要删除这个文档吗？此操作不可恢复。')) {
      return;
    }

    setDeleting(documentId);
    try {
      const res = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setDocuments(documents.filter((doc) => doc.id !== documentId));
      } else {
        const error = await res.json();
        alert(`删除失败: ${error.error}`);
      }
    } catch (err) {
      alert('删除发生错误');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 上传区域 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
        <h2 className="text-lg font-semibold mb-4">添加文档</h2>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept=".pdf,.txt,.md"
            onChange={handleUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              dark:file:bg-blue-900 dark:file:text-blue-200"
          />
          {uploading && <span className="text-blue-500 animate-pulse">正在处理...</span>}
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          支持 PDF, TXT, MD 格式，文档将自动分块并向量化存储
        </p>
      </div>

      {/* 文档列表 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
        <h2 className="text-lg font-semibold mb-4">
          已有文档 ({documents.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  标题
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    <Link
                      href={`/documents/${doc.id}`}
                      className="hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {doc.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(doc.createdAt).toLocaleString('zh-CN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                    <Link
                      href={`/documents/${doc.id}`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      查看
                    </Link>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={deleting === doc.id}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                    >
                      {deleting === doc.id ? '删除中...' : '删除'}
                    </button>
                  </td>
                </tr>
              ))}
              {documents.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    暂无文档，请上传文档开始构建知识库
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
