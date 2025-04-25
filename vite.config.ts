import react from '@vitejs/plugin-react-swc'
import { join } from 'path'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import electron from 'vite-plugin-electron'

const PYODIDE_EXCLUDE = ['!**/*.{md,html}', '!**/*.d.ts', '!**/node_modules']

function viteStaticCopyPyodide() {
  const pyodideDir = join(__dirname, 'deps', 'pyodide')

  return viteStaticCopy({
    targets: [
      {
        src: [join(pyodideDir, '*')].concat(PYODIDE_EXCLUDE),
        dest: 'assets',
      },
    ],
  })
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isElectron = mode === 'electron'

  return {
    plugins: [
      react(),
      viteStaticCopyPyodide(),
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
