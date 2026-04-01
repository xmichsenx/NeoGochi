import type { Config } from 'drizzle-kit';

export default {
  schema: './src/infrastructure/drizzle/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://neogochi:neogochi@localhost:5432/neogochi',
  },
} satisfies Config;
