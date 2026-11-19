import { createRequire } from 'node:module';
import path from 'node:path';
import type { Plugin } from 'vite';

type Handler = (event: {
  httpMethod: string;
  queryStringParameters: Record<string, string>;
  body: string;
}) => Promise<{ statusCode: number; headers?: Record<string, string>; body: string }>;

/**
 * Dev only: serve the listed Netlify functions from ../netlify/functions so a
 * local change can be tried before it is deployed. Everything else still goes
 * through the production proxy in vite.config.ts. Opt in with
 * LOCAL_FUNCTIONS=availability-building (comma-separated names).
 */
export function localFunctions(names: string[]): Plugin {
  const require = createRequire(import.meta.url);
  const root = path.resolve(__dirname, '../netlify/functions');
  return {
    name: 'local-netlify-functions',
    apply: 'serve',
    configureServer(server) {
      for (const name of names) {
        const file = path.join(root, `${name}.js`);
        server.middlewares.use(`/.netlify/functions/${name}`, (req, res) => {
          const chunks: Buffer[] = [];
          req.on('data', (chunk: Buffer) => chunks.push(chunk));
          req.on('end', async () => {
            try {
              delete require.cache[require.resolve(file)];
              const { handler } = require(file) as { handler: Handler };
              const url = new URL(req.url || '', 'http://localhost');
              const result = await handler({
                httpMethod: req.method || 'GET',
                queryStringParameters: Object.fromEntries(url.searchParams),
                body: Buffer.concat(chunks).toString('utf8'),
              });
              res.statusCode = result.statusCode;
              for (const [key, value] of Object.entries(result.headers || {})) res.setHeader(key, value);
              res.end(result.body);
            } catch (error) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: String(error) }));
            }
          });
        });
      }
    },
  };
}
