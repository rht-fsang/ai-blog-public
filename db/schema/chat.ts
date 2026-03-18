import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { documents } from './rag';

// 聊天会话
export const chatSessions = pgTable('chat_sessions', {
  id: serial('id').primaryKey(),
  title: text('title').notNull().default('新对话'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 聊天消息
export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').references(() => chatSessions.id, { onDelete: 'cascade' }).notNull(),
  role: text('role', { enum: ['user', 'assistant'] }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 关联文档（用于追溯回答来源）
export const messageSources = pgTable('message_sources', {
  id: serial('id').primaryKey(),
  messageId: integer('message_id').references(() => chatMessages.id, { onDelete: 'cascade' }).notNull(),
  chunkId: integer('chunk_id').notNull(),
  similarity: text('similarity').notNull(), // 存储相似度分数
});
