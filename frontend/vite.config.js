// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  
  plugins: [react()],
  server: {
    proxy: {
      
    },
  },
  css: {
    postcss: './postcss.config.cjs',
  },
})
