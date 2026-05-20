// Vite 설정 — React + SVG 컴포넌트 import + 개발 서버 포트 5178
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [svgr(), react()],
  server: { port: 5178 },
})
