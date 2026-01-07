import { env } from '@/env';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import * as schema from './schema';

const sqlite = new Database(env.DATABASE_URL.replace('file:', ''));

export const db = drizzle(sqlite, { schema });
