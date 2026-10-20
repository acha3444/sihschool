import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'local-api-handler',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/admin/create-user' && req.method === 'POST') {
              try {
                let bodyStr = '';
                req.on('data', (chunk) => {
                  bodyStr += chunk;
                });
                req.on('end', async () => {
                  try {
                    req.body = bodyStr ? JSON.parse(bodyStr) : {};
                  } catch {
                    req.body = {};
                  }

                  // Copier les variables d'environnement pour le handler
                  process.env.VITE_SUPABASE_URL = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
                  process.env.SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

                  const { default: handler } = await import('./api/admin/create-user.js');

                  // Adapter l'objet res pour Express/Vercel compatibilité
                  res.status = (code) => {
                    res.statusCode = code;
                    return res;
                  };
                  res.json = (data) => {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                    return res;
                  };

                  await handler(req, res);
                });
              } catch (e) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message }));
              }
              return;
            }
            next();
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
