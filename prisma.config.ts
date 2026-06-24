import { defineConfig } from '@prisma/config';
import { loadEnvFile } from 'node:process';

if (!process.env.DATABASE_URL) {
  try {
    loadEnvFile();
  } catch {
    // .env might not exist, which is fine
  }
}

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || '',
  },
});
