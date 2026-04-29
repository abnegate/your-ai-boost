import { rm, cp, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dir, '..');
const outDir = resolve(root, 'dist');
const publicDir = resolve(root, 'public');

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

// Step 1: compile Tailwind → public/style.css (referenced by index.html)
const tailwindResult = Bun.spawnSync({
  cmd: [
    'bun',
    'x',
    '@tailwindcss/cli',
    '--input',
    resolve(root, 'src/styles/global.css'),
    '--output',
    resolve(publicDir, 'style.css'),
    '--minify',
  ],
  stdout: 'inherit',
  stderr: 'inherit',
  cwd: root,
});
if (tailwindResult.exitCode !== 0) {
  console.error('Tailwind compile failed');
  process.exit(tailwindResult.exitCode ?? 1);
}

// Step 2: bundle JS / HTML / CSS via Bun
const define: Record<string, string> = {
  'process.env.NODE_ENV': JSON.stringify('production'),
  'process.env.PUBLIC_APPWRITE_ENDPOINT': JSON.stringify(
    process.env.PUBLIC_APPWRITE_ENDPOINT ?? '',
  ),
  'process.env.PUBLIC_APPWRITE_PROJECT_ID': JSON.stringify(
    process.env.PUBLIC_APPWRITE_PROJECT_ID ?? '',
  ),
};

const result = await Bun.build({
  entrypoints: [resolve(root, 'index.html')],
  outdir: outDir,
  target: 'browser',
  minify: true,
  sourcemap: 'linked',
  splitting: true,
  naming: {
    entry: '[dir]/[name].[ext]',
    chunk: 'assets/[name]-[hash].[ext]',
    asset: 'assets/[name]-[hash].[ext]',
  },
  define,
});

if (!result.success) {
  for (const message of result.logs) console.error(message);
  process.exit(1);
}

// Copy any non-bundled public assets the bundler didn't already inline
if (existsSync(publicDir)) {
  await cp(publicDir, outDir, { recursive: true });
}

const totalKb = result.outputs.reduce((sum, output) => sum + output.size, 0) / 1024;
console.log(`✓ built ${result.outputs.length} files (${totalKb.toFixed(1)} kB) → dist/`);
for (const output of result.outputs) {
  const rel = output.path.replace(`${outDir}/`, '');
  console.log(`  ${rel.padEnd(40)} ${(output.size / 1024).toFixed(2)} kB`);
}
