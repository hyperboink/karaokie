import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { transform } from 'esbuild'
import type { Plugin } from 'vite'

/**
 * Reads public/preload.js, minifies it with esbuild, and injects it as an
 * inline <script> into the built HTML — no separate network request, no
 * readable source in the output.
 */
function inlinePreload(): Plugin {
  return {
    name: 'inline-preload',
    async transformIndexHtml(html) {
      const src = readFileSync(resolve(__dirname, 'src/preload.js'), 'utf-8')
      const { code } = await transform(src, { minify: true, target: 'es2015' })
      return html.replace(
        '<!-- preload injected by vite plugin -->',
        `<script>${code.trim()}</script>`,
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), inlinePreload()],
})
