// 인증 라우트 가드 — 토큰이 없으면 /login 으로 보낸다 (봇 데이터가 서버 저장으로 전환됨에 따라 필수).

import { Navigate, Outlet } from 'react-router-dom'
import { isAuthenticated } from '../lib/auth.js'

export default function RequireAuth() {
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  return <Outlet />
}
