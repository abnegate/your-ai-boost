import { resolve } from 'node:path';

const distDir = resolve(import.meta.dir, '..', 'dist');
const port = Number(process.env.PORT ?? 4173);

const server = Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);
    const candidate = url.pathname === '/' ? '/index.html' : url.pathname;
    const file = Bun.file(resolve(distDir, `.${candidate}`));
    if (await file.exists()) return new Response(file);
    const fallback = Bun.file(resolve(distDir, 'index.html'));
    return new Response(fallback, { headers: { 'content-type': 'text/html' } });
  },
});

console.log(`▲ preview: ${server.url.toString()}`);
