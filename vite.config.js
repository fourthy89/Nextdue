import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this repo at https://fourthy89.github.io/Nextdue/,
  // not at the domain root — every built asset path needs this prefix or
  // the deployed site loads a blank page (CSS/JS 404s against the wrong path).
  base: '/Nextdue/',
  plugins: [react(), tailwindcss()],
})
