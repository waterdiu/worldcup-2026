import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

declare const process: {
  env: Record<string, string | undefined>;
};

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base = process.env.VITE_GITHUB_PAGES === 'true' && repositoryName ? `/${repositoryName}/` : '/';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const footballDataPlatformApiDir = path.resolve(__dirname, '..', '..', 'football-data-platform', 'data', 'public', 'api');

function worldCupRuntimeApiDevServer(): Plugin {
  return {
    name: 'worldcup-runtime-api-dev-server',
    configureServer(server) {
      server.middlewares.use('/api', (request, response, next) => {
        const requestPath = decodeURIComponent((request.url ?? '').split('?')[0] ?? '');
        const filePath = path.normalize(path.join(footballDataPlatformApiDir, requestPath));

        if (!filePath.startsWith(footballDataPlatformApiDir) || !filePath.endsWith('.json')) {
          next();
          return;
        }

        if (!fs.existsSync(filePath)) {
          response.statusCode = 404;
          response.end('Not found');
          return;
        }

        response.setHeader('content-type', 'application/json; charset=utf-8');
        response.setHeader('cache-control', 'no-store');
        response.end(fs.readFileSync(filePath, 'utf8'));
      });
    }
  };
}

export default defineConfig({
  base,
  plugins: [react(), worldCupRuntimeApiDevServer()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true
  },
  preview: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts'
  }
});
