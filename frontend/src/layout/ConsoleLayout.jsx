// 콘솔 공통 레이아웃 — 상단 헤더(테마 토글 + 아바타) + 좌측 사이드바 + 본문
import { Outlet, NavLink } from 'react-router-dom'
import Avatar from '../design-system/components/Avatar/Avatar.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import IconButtonOutlined from '../design-system/components/IconButton/IconButtonOutlined.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import { useTheme } from '../lib/useTheme.js'
import './ConsoleLayout.css'

const NAV_ITEMS = [
  { to: '/app/bots', label: '봇 목록', icon: 'agent' },
  { to: '/app/analytics', label: '분석', icon: 'column', disabled: true },
  { to: '/app/assets/knowledge', label: '지식베이스', icon: 'book', disabled: true },
  { to: '/app/assets/variables', label: '변수', icon: 'textVariable', disabled: true },
  { to: '/app/settings', label: '설정', icon: 'setting', disabled: true },
]

export default function ConsoleLayout() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="console-layout">
      <header className="console-header">
        <div className="console-header__brand">
          <Typography variant="headline-2" weight="semibold" as="span">
            Harunohi
          </Typography>
        </div>
        <div className="console-header__actions">
          <IconButtonOutlined
            icon={<Icon name={isDark ? 'sun' : 'moon'} size={18} />}
            size="small"
            onClick={toggle}
            aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
          />
          <Avatar variant="person" size="small" interaction onClick={() => {}} />
        </div>
      </header>

      <div className="console-body">
        <aside className="console-sidebar">
          <nav className="console-nav">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'console-nav__item',
                    isActive && 'console-nav__item--active',
                    item.disabled && 'console-nav__item--disabled',
                  ]
                    .filter(Boolean)
                    .join(' ')
                }
                onClick={(e) => item.disabled && e.preventDefault()}
              >
                <Icon name={item.icon} size={18} />
                <Typography variant="label-1-normal" weight="medium" as="span">
                  {item.label}
                </Typography>
              </NavLink>
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
