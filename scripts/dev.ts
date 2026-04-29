import { resolve } from 'node:path';
import index from '../index.html';

const root = resolve(import.meta.dir, '..');
const publicDir = resolve(root, 'public');

// Spawn Tailwind in watch mode so /public/style.css stays current.
const tailwind = Bun.spawn({
  cmd: [
    'bun',
    'x',
    '@tailwindcss/cli',
    '--input',
    resolve(root, 'src/styles/global.css'),
    '--output',
    resolve(publicDir, 'style.css'),
    '--watch',
  ],
  stdout: 'inherit',
  stderr: 'inherit',
  cwd: root,
});

const port = Number(process.env.PORT ?? 5173);

const server = Bun.serve({
  port,
  development: true,
  routes: {
    '/*': index,
  },
  async fetch(request) {
    const url = new URL(request.url);
    const file = Bun.file(resolve(publicDir, `.${url.pathname}`));
    if (await file.exists()) return new Response(file);
    return new Response('Not found', { status: 404 });
  },
});

console.log(`▲ dev server: ${server.url.toString()}`);

const shutdown = async () => {
  tailwind.kill();
  await server.stop(true);
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
