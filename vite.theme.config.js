import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cp, mkdir, readdir, rm } from 'node:fs/promises';

const root = fileURLToPath(new URL('.', import.meta.url));

async function copyTemplates(source, destination) {
  await mkdir(destination, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    const from = resolve(source, entry.name);
    const to = resolve(destination, entry.name);
    if (entry.isDirectory()) await copyTemplates(from, to);
    else if (entry.name.endsWith('.twig')) await cp(from, to);
  }
}

export default defineConfig({
  publicDir: false,
  base: './',
  plugins: [{
    name: 'pixelcut-theme-components',
    async buildStart() {
      const components = resolve(root, 'src/components');
      this.addWatchFile(components);
      const watch = async directory => {
        for (const entry of await readdir(directory, { withFileTypes: true })) {
          const file = resolve(directory, entry.name);
          this.addWatchFile(file);
          if (entry.isDirectory()) await watch(file);
        }
      };
      await watch(components);
      await watch(resolve(root, 'src/assets'));
    },
    async closeBundle() {
      // Only this generated directory is cleared; views and ACF JSON are sources.
      const destination = resolve(root, 'theme/components');
      if (destination !== resolve(root, 'theme', 'components')) throw new Error('Invalid destination');
      await rm(destination, { recursive: true, force: true });
      await copyTemplates(resolve(root, 'src/components'), destination);
      await cp(resolve(root, 'src/assets'), resolve(root, 'theme/assets/static'), {
        recursive: true, filter: file => !file.endsWith('.gitkeep'),
      });
    },
  }],
  build: {
    outDir: resolve(root, 'theme/assets'),
    emptyOutDir: true,
    manifest: 'manifest.json',
    rollupOptions: { input: resolve(root, 'src/js/main.js') },
  },
});
