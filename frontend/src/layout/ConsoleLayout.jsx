// 콘솔 공통 레이아웃 — 상단 헤더(테마 토글 + 계정) + 좌측 사이드바 + 본문.
// 사이드바는 평면 + 부모/자식(접고 펼치기) 두 패턴을 동시에 지원.
import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import Avatar from '../design-system/components/Avatar/Avatar.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import IconButtonOutlined from '../design-system/components/IconButton/IconButtonOutlined.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import { useTheme } from '../lib/useTheme.js'
import { getCurrentUser, logout } from '../lib/auth.js'
import { resetWorkspaceCache } from '../lib/botApi.js'
import './ConsoleLayout.css'

// children 이 있는 항목은 클릭 시 펼침/접힘. 부모 자체는 라우트 이동을 하지 않는다.
const NAV_ITEMS = [
  { key: 'dashboard', to: '/app/dashboard', label: '대시보드', icon: 'home', disabled: true },
  { key: 'bots', to: '/app/bots', label: '챗봇 빌더', icon: 'agent' },
  // 챗봇 디자인 — 단일 항목. 클릭 시 챗봇 디자인 목록으로. (런처/대화방은 디자인 에디터 내부 탭)
  { key: 'chatbot-ui', to: '/app/chatbot-ui/launcher', label: '챗봇 설정', icon: 'tune' },
  { key: 'channels', to: '/app/chatbot-channels', label: '챗봇 채널', icon: 'globe' },
  { key: 'analytics', to: '/app/analytics', label: '분석', icon: 'column', disabled: true },
  { key: 'knowledge', to: '/app/assets/knowledge', label: '지식베이스', icon: 'book', disabled: true },
  { key: 'settings', to: '/app/settings', label: '설정', icon: 'setting', disabled: true },
]

/** 일반(leaf) 항목 한 줄 */
function NavLeaf({ item, isChild = false }) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        [
          'console-nav__item',
          isChild && 'console-nav__item--child',
          isActive && 'console-nav__item--active',
          item.disabled && 'console-nav__item--disabled',
        ]
          .filter(Boolean)
          .join(' ')
      }
      onClick={(e) => item.disabled && e.preventDefault()}
    >
      <Icon name={item.icon} size={isChild ? 16 : 18} />
      <Typography variant="label-1-normal" weight="medium" as="span">
        {item.label}
      </Typography>
    </NavLink>
  )
}

export default function ConsoleLayout() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'
  const navigate = useNavigate()
  // 로그인 상태 — 콘솔 라우트는 RequireAuth 가드 하위라 항상 로그인 상태로 진입한다
  const [user, setUser] = useState(() => getCurrentUser())

  const handleLogout = () => {
    logout()
    resetWorkspaceCache()
    setUser(null)
    navigate('/login')
  }

  return (
    <div className="console-layout">
      <header className="console-header">
        <div className="console-header__brand">
          <img
            className="console-header__logo"
            src={isDark ? '/Infobank_Logo_Color_RGB_White.png' : '/Infobank_Logo_Color_RGB_Black.png'}
            alt="Infobank"
          />
        </div>
        <div className="console-header__actions">
          <IconButtonOutlined
            icon={<Icon name={isDark ? 'sun' : 'moon'} size={18} />}
            size="small"
            onClick={toggle}
            aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
          />
          {user ? (
            <div className="console-header__account">
              <Typography variant="label-1-normal" weight="medium" as="span">
                {user.name}
              </Typography>
              <button type="button" className="console-header__logout" onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          ) : (
            <button type="button" className="console-header__login" onClick={() => navigate('/login')}>
              로그인
            </button>
          )}
          <Avatar variant="person" size="small" interaction onClick={() => {}} />
        </div>
      </header>

      <div className="console-body">
        <aside className="console-sidebar">
          <nav className="console-nav">
            {NAV_ITEMS.map((item) => (
              <NavLeaf key={item.key} item={item} />
            ))}
          </nav>
        </aside>

        <main className="console-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
