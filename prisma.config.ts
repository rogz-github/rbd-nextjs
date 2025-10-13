import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv'

// ✅ Load .env manually (required when using prisma.config.ts)
dotenv.config()
export default defineConfig({
  schema: 'prisma/schema.prisma',
});
