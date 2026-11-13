import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Routes API servies en local (en production, Vercel les sert depuis /api)
const API_ROUTES: Record<string, string> = {
  '/api/admin/create-user': './api/admin/create-user.js',
  '/api/admin/reset-password': './api/admin/reset-password.js',
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'local-api-handler',
        configureServer(server) {
          server.middlewares.use(async (req: any, res: any, next) => {
            const route = req.url ? API_ROUTES[req.url.split('?')[0]] : undefined;
            if (!route || req.method !== 'POST') return next();

            let bodyStr = '';
            req.on('data', (chunk: Buffer) => {
              bodyStr += chunk;
            });
            req.on('end', async () => {
              try {
                try {
                  req.body = bodyStr ? JSON.parse(bodyStr) : {};
                } catch {
                  req.body = {};
                }

                for (const key of ['VITE_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']) {
                  if (env[key]) process.env[key] = env[key];
                }

                const { default: handler } = await import(/* @vite-ignore */ pathToFileURL(path.resolve(process.cwd(), route)).href);

                res.status = (code: number) => {
                  res.statusCode = code;
                  return res;
                };
                res.json = (data: unknown) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                  return res;
                };

                await handler(req, res);
              } catch (e: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message }));
              }
            });
          });
        },
      },
    ],
    server: {
      host: '0.0.0.0',
      port: 5174,
      allowedHosts: true,
    },
  };
});
