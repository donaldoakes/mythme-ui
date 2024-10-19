import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  envDir: 'envs',
  base: '/mythme',
  plugins: [vue()],
  build: { chunkSizeWarningLimit: 1024 },
  resolve: {}
})
