import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const blogs = pgTable('blogs', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  tags: text('tags'), // 逗号分隔的标签
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
