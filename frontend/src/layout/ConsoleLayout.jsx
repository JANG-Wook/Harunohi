// 콘솔 공통 레이아웃 — 상단 헤더(테마 토글 + 아바타) + 좌측 사이드바 + 본문.
// 사이드바는 평면 + 부모/자식(접고 펼치기) 두 패턴을 동시에 지원.
import { Outlet, NavLink } from 'react-router-dom'
import Avatar from '../design-system/components/Avatar/Avatar.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import IconButtonOutlined from '../design-system/components/IconButton/IconButtonOutlined.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import { useTheme } from '../lib/useTheme.js'
import ForsythiaLogo from './ForsythiaLogo.jsx'
import './ConsoleLayout.css'

// children 이 있는 항목은 클릭 시 펼침/접힘. 부모 자체는 라우트 이동을 하지 않는다.
const NAV_ITEMS = [
  { key: 'dashboard', to: '/app/dashboard', label: '대시보드', icon: 'home', disabled: true },
  { key: 'bots', to: '/app/bots', label: '챗봇', icon: 'agent' },
  // 챗봇 디자인 설정 — 단일 항목. 클릭 시 챗봇 디자인 목록으로. (런처/대화방은 디자인 에디터 내부 탭)
  { key: 'chatbot-ui', to: '/app/chatbot-ui/launcher', label: '챗봇 디자인 설정', icon: 'palette' },
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

  return (
    <div className="console-layout">
      <header className="console-header">
        <div className="console-header__brand">
          <ForsythiaLogo size={28} />
          <Typography variant="headline-2" weight="bold" color="var(--color-label-neutral)" as="span">
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
