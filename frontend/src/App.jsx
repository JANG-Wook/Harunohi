// Harunohi 라우팅 정의 — 콘솔/봇 작업 화면 진입 경로
import { Routes, Route, Navigate } from 'react-router-dom'
import ConsoleLayout from './layout/ConsoleLayout.jsx'
import BotWorkspaceLayout from './layout/BotWorkspaceLayout.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import BotCanvasPage from './pages/BotCanvasPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app/bots" replace />} />

      <Route element={<ConsoleLayout />}>
        <Route path="/app/bots" element={<DashboardPage />} />
      </Route>

      <Route element={<BotWorkspaceLayout />}>
        <Route path="/app/bots/:botId/canvas" element={<BotCanvasPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/app/bots" replace />} />
    </Routes>
  )
}
