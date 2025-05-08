import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react-swc'
import { join } from 'path'
import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isElectron = mode === 'electron'

  return {
    resolve: {
      alias: {
        '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
      },
    },
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
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
  }
})
