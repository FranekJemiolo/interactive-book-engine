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
    copyPublicDir: false
  },
  server: {
    port: 3000,
    open: true,
    fs: {
      strict: false
    }
  },
  assetsInclude: ['**/*.yaml']
})
