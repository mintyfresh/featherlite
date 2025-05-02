import react from '@vitejs/plugin-react-swc'
import { join } from 'path'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import electron from 'vite-plugin-electron'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isElectron = mode === 'electron'

  return {
    plugins: [
      TanStackRouterVite({ target: 'react' }),
      react(),
      ...(isElectron
        ? [
            electron({
              entry: 'electron/main.ts',
              vite: {
                build: {
                  outDir: 'dist-electron',
                  rollupOptions: {
                    output: {
                      format: 'es',
                    },
                  },
                },
              },
            }),
            viteStaticCopy({
              targets: [
                {
                  src: join(__dirname, 'electron', 'preload.js'),
                  dest: 'assets',
                },
              ],
            }),
          ]
        : []),
    ],
    esbuild: {
      supported: {
        'top-level-await': true,
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
  }
})
