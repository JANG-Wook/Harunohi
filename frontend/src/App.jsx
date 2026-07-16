// Harunohi 라우팅 정의 — 콘솔/봇 작업 화면 진입 경로
import { Routes, Route, Navigate } from 'react-router-dom'
import ConsoleLayout from './layout/ConsoleLayout.jsx'
import BotWorkspaceLayout from './layout/BotWorkspaceLayout.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import BotCanvasPage from './pages/BotCanvasPage.jsx'
import LauncherListPage from './settings/LauncherListPage.jsx'
import LauncherSettingsPage from './settings/LauncherSettingsPage.jsx'
import ChannelListPage from './pages/ChannelListPage.jsx'
import ConversationLogPage from './pages/ConversationLogPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import PublicChatPage from './pages/PublicChatPage.jsx'
import RequireAuth from './components/RequireAuth.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app/bots" replace />} />
      <Route path="/login" element={<LoginPage />} />
      {/* 공개 대화방 — 무인증(위젯이 여는 화면). botPublicId 기반(채널 서버화 전까지 직결) */}
      <Route path="/c/:botId" element={<PublicChatPage />} />

      {/* 콘솔 전체는 로그인 필수 — 봇 데이터가 서버 저장으로 전환됨 */}
      <Route element={<RequireAuth />}>
        <Route element={<ConsoleLayout />}>
          <Route path="/app/bots" element={<DashboardPage />} />
          <Route path="/app/chatbot-ui/launcher" element={<LauncherListPage />} />
          <Route path="/app/chatbot-channels" element={<ChannelListPage />} />
          <Route path="/app/bots/:botId/logs" element={<ConversationLogPage />} />
        </Route>

        <Route element={<BotWorkspaceLayout />}>
          <Route path="/app/bots/:botId/canvas" element={<BotCanvasPage />} />
        </Route>

        {/* 챗봇 디자인 에디터 — LNB 없는 독립 풀스크린 (LNB 이탈 방지) */}
        <Route path="/app/chatbot-ui/launcher/:launcherId" element={<LauncherSettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/app/bots" replace />} />
    </Routes>
  )
}
