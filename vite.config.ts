import react from '@vitejs/plugin-react-swc'
import { join } from 'path'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const PYODIDE_EXCLUDE = [
  "!**/*.{md,html}",
  "!**/*.d.ts",
  "!**/node_modules",
]

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
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopyPyodide(),
  ],
  esbuild: {
    supported: {
      'top-level-await': true,
    },
  },
})
