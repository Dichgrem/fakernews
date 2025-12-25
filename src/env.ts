import { config } from "dotenv";
import { z } from "zod";

config({ quiet: true });

const EnvSchema = z.object({
  NODE_ENV: z.enum(["dev", "production"]).default("dev"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.url().default("file:fakernews.db"),
});

export type Env = z.infer<typeof EnvSchema>;

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid env:", parsed.error.message);
  process.exit(1);
}

export const env: Env = parsed.data;
