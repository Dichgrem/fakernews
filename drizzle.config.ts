import { env } from '@/env';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './src/db/drizzle',
  schema: './src/db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
