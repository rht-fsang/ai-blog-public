'use client';

import { useState, useRef } from 'react';

interface Blog {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  tags: string | null;
  createdAt: Date;
}

interface BlogManagerProps {
  initialBlogs: Blog[];
}

export default function BlogManager({ initialBlogs }: BlogManagerProps) {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    tags: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      tags: '',
    });
    setEditingBlog(null);
  };

  // 上传 MD 文件
  const handleUploadMd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/blogs/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert(`上传成功！\n标题: ${data.parsed.title}\nSlug: ${data.parsed.slug}\n标签: ${data.parsed.tags || '无'}`);
        window.location.reload();
      } else {
        alert(`上传失败: ${data.error}`);
      }
    } catch {
      alert('上传发生错误');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      content: '', // 需要从 API 获取完整内容
      excerpt: blog.excerpt || '',
      tags: blog.tags || '',
    });
    setShowForm(true);
    // 获取完整内容
    fetch(`/api/blogs/${blog.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.content) {
          setFormData((prev) => ({ ...prev, content: data.content }));
        }
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingBlog) {
        // 更新博客
        const res = await fetch(`/api/blogs/${editingBlog.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          alert('更新成功！');
          window.location.reload();
        } else {
          const error = await res.json();
          alert(`更新失败: ${error.error}`);
        }
      } else {
        // 创建博客
        const res = await fetch('/api/blogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          alert('创建成功！');
          window.location.reload();
        } else {
          const error = await res.json();
          alert(`创建失败: ${error.error}`);
        }
      }
    } catch {
      alert('操作失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这篇博客吗？')) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/blogs?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBlogs(blogs.filter((b) => b.id !== id));
      } else {
        alert('删除失败');
      }
    } catch {
      alert('删除失败');
    } finally {
      setDeleting(null);
    }
  };

  // 自动生成 slug
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  return (
    <div className="space-y-6">
      {/* 操作按钮 */}
      {!showForm && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            + 新建博客
          </button>
          <label className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors cursor-pointer">
            📄 上传 Markdown
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown"
              onChange={handleUploadMd}
              disabled={uploading}
              className="hidden"
            />
          </label>
          {uploading && <span className="text-blue-500 animate-pulse self-center">上传中...</span>}
        </div>
      )}

      {/* MD 文件格式说明 */}
      {!showForm && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg text-sm">
          <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">📝 Markdown 文件格式示例：</p>
          <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-xs overflow-x-auto text-gray-600 dark:text-gray-400">
{`---
title: 文章标题
slug: article-url-slug
tags: RAG, AI, PostgreSQL
excerpt: 文章摘要（可选）
---

# 正文开始

这里是文章内容...`}
          </pre>
        </div>
      )}

      {/* 表单 */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            {editingBlog ? '编辑博客' : '新建博客'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                标题 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    title,
                    slug: prev.slug || generateSlug(title),
                  }));
                }}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Slug（URL 路径）*
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                内容 *（支持 Markdown）
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                rows={10}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                摘要
              </label>
              <input
                type="text"
                value={formData.excerpt}
                onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="可选，不填会自动截取内容前150字"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                标签（逗号分隔）
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="RAG, AI, PostgreSQL"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 博客列表 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
        <h2 className="text-lg font-semibold mb-4">
          已有博客 ({blogs.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  标题
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  创建时间
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {blogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    <a
                      href={`/blog/${blog.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {blog.title}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {blog.slug}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {blog.createdAt.toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-4 py-3 text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(blog)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(blog.id)}
                      disabled={deleting === blog.id}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 disabled:opacity-50"
                    >
                      {deleting === blog.id ? '删除中...' : '删除'}
                    </button>
                  </td>
                </tr>
              ))}
              {blogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    暂无博客，点击上方按钮创建
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
