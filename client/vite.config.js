import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // 可选：代理避免跨域（但后端已配置CORS，非必需）
  }
})