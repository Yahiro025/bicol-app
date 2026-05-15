import { defineConfig } from '@prisma/config';
import { loadEnvFile } from 'node:process';

try {
  loadEnvFile();
} catch (e) {
  // .env might not exist in some environments, which is fine
}

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
