import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// 配置连接池以避免 Supabase 连接中断
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // 最大连接数
  idleTimeoutMillis: 30000, // 空闲超时
  connectionTimeoutMillis: 10000, // 连接超时
  // SSL 配置 (Supabase 需要)
  ssl: {
    rejectUnauthorized: false,
  },
});

// 错误处理
pool.on('error', (err) => {
  console.error('Database pool error:', err);
});

export const db = drizzle(pool, { schema });
