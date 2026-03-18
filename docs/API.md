# API 文档

## 聊天 API

### POST /api/chat

与 AI 进行对话，支持 RAG 检索增强。

**请求体**:
```json
{
  "messages": [
    { "role": "user", "content": "你好" }
  ]
}
```

**响应**: Server-Sent Events (SSE) 流式响应

```
data: {"choices":[{"delta":{"content":"你"}}]}

data: {"choices":[{"delta":{"content":"好"}}]}

data: [DONE]
```

**工作流程**:
1. 接收用户消息
2. 使用智谱 embedding-2 生成查询向量
3. 在 chunks 表中进行向量相似度检索
4. 构建包含上下文的系统提示词
5. 调用智谱 GLM-4-flash 生成流式响应

---

## 文档上传 API

### POST /api/upload

上传文档到知识库。

**请求**: multipart/form-data
- `file`: 文件 (PDF/TXT/MD)

**响应**:
```json
{
  "success": true,
  "documentId": 1
}
```

**处理流程**:
1. 接收文件
2. 解析文本内容 (PDF/TXT/MD)
3. 保存文档元数据到 `documents` 表
4. 使用 RecursiveCharacterTextSplitter 分块 (chunkSize=500, overlap=100)
5. 为每个块生成向量 (智谱 embedding-2)
6. 保存到 `chunks` 表

---

## 文档管理 API

### DELETE /api/documents/:id

删除文档及其关联的向量数据。

**响应**:
```json
{
  "success": true
}
```

**注意**: 删除文档会级联删除所有关联的 chunks。

---

## 聊天会话 API

### GET /api/sessions

获取所有聊天会话列表。

**响应**:
```json
[
  {
    "id": 1,
    "title": "新对话",
    "createdAt": "2024-03-14T15:30:00.000Z",
    "updatedAt": "2024-03-14T15:35:00.000Z"
  }
]
```

### POST /api/sessions

创建新会话。

**请求体**:
```json
{
  "title": "关于 React 的讨论"
}
```

**响应**:
```json
{
  "id": 1,
  "title": "关于 React 的讨论",
  "createdAt": "2024-03-14T15:30:00.000Z",
  "updatedAt": "2024-03-14T15:30:00.000Z"
}
```

### GET /api/sessions/:id

获取会话详情及消息历史。

**响应**:
```json
{
  "id": 1,
  "title": "新对话",
  "createdAt": "2024-03-14T15:30:00.000Z",
  "updatedAt": "2024-03-14T15:35:00.000Z",
  "messages": [
    {
      "id": 1,
      "sessionId": 1,
      "role": "user",
      "content": "你好",
      "createdAt": "2024-03-14T15:30:00.000Z"
    },
    {
      "id": 2,
      "sessionId": 1,
      "role": "assistant",
      "content": "你好！有什么可以帮助你的吗？",
      "createdAt": "2024-03-14T15:30:05.000Z"
    }
  ]
}
```

### DELETE /api/sessions/:id

删除会话及其所有消息。

**响应**:
```json
{
  "success": true
}
```

---

## 错误响应

所有 API 在发生错误时返回：

```json
{
  "error": "错误信息描述"
}
```

HTTP 状态码：
- `400` - 请求参数错误
- `404` - 资源不存在
- `500` - 服务器内部错误

---

## 向量检索说明

### 检索算法

使用 PostgreSQL pgvector 扩展的余弦距离：

```sql
SELECT content, 1 - (embedding <=> query_vector) as similarity
FROM chunks
WHERE 1 - (embedding <=> query_vector) > 0.5
ORDER BY similarity DESC
LIMIT 3
```

### 相似度阈值

默认阈值为 `0.5`，只有相似度超过此阈值的文档片段才会被用于上下文。

### 返回数量

默认返回 Top-3 最相关的文档片段。

---

## 限流建议

生产环境建议添加限流：

- `/api/chat`: 20 次/分钟
- `/api/upload`: 10 次/分钟
- `/api/sessions`: 60 次/分钟

可使用 Upstash Rate Limit 或 Redis 实现。
