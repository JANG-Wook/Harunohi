// Vite 설정 — React + SVG 컴포넌트 import + 개발 서버 포트 5178
// + 학습용 가짜 API (SSO 로그인 + 회원 정보 + 토큰 인증) — src/mocks/mockApiPlugin.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import mockApiPlugin from './src/mocks/mockApiPlugin.js'

export default defineConfig({
  plugins: [svgr(), react(), mockApiPlugin()],
  server: { port: 5178 },
})
