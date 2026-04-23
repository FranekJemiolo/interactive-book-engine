import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: './index.html'
      }
    },
    copyPublicDir: true
  },
  server: {
    port: 3000,
    open: true,
    fs: {
      strict: false
    }
  },
  publicDir: 'content'
})
