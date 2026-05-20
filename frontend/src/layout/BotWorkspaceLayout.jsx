// 봇 작업 화면 레이아웃 — 탑바(뒤로가기, 봇명, 액션 버튼) + 본문
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import Button from '../design-system/components/Button/Button.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import IconButtonNormal from '../design-system/components/IconButton/IconButtonNormal.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import './BotWorkspaceLayout.css'

export default function BotWorkspaceLayout() {
  const navigate = useNavigate()
  const { botId } = useParams()

  return (
    <div className="bot-workspace">
      <header className="bot-workspace__topbar">
        <div className="bot-workspace__left">
          <IconButtonNormal
            icon={<Icon name="chevronLeft" size={20} />}
            onClick={() => navigate('/app/bots')}
            aria-label="뒤로가기"
          />
          <Typography variant="heading-2" weight="semibold" as="span">
            {decodeURIComponent(botId ?? '')}
          </Typography>
        </div>

        <div className="bot-workspace__actions">
          <Button variant="outlined" color="assistive" size="small" label="저장" />
          <Button
            variant="outlined"
            color="assistive"
            size="small"
            leadingIcon={<Icon name="play" size={16} />}
            label="시뮬레이터"
          />
          <Button variant="solid" color="primary" size="small" label="발행" />
        </div>
      </header>

      <main className="bot-workspace__body">
        <Outlet />
      </main>
    </div>
  )
}
