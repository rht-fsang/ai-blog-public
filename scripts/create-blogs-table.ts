import { db } from '../db';
import { sql } from 'drizzle-orm';

async function createBlogsTable() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS blogs (
        id SERIAL PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        tags TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log('blogs table created successfully');
  } catch (error) {
    console.error('Error creating blogs table:', error);
  }
  process.exit(0);
}

createBlogsTable();
