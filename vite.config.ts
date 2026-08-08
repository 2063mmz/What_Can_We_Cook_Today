import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths, so the built site works from any sub-directory —
  // a GitHub Pages project site lives at /<repo>/, not at the domain root.
  // Combined with HashRouter this needs no per-host configuration.
  base: './',
  plugins: [react()],
})
