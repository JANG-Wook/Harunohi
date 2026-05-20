/**
 * Toast 컴포넌트
 *
 * 피드백 메시지를 표시하는 토스트 알림입니다.
 * 유리모피즘 배경에 텍스트 + 선택적 아이콘을 표시합니다.
 *
 * Props:
 *  variant      — 'normal' | 'positive' | 'cautionary' | 'negative'   기본: 'normal'
 *  text         — 표시할 텍스트 (string)
 *  leadingIcon  — ReactNode  (normal variant에서만 표시)
 *  className    — 추가 클래스
 *
 * 사용 예:
 *  <Toast text="저장되었습니다" />
 *  <Toast variant="positive" text="성공적으로 완료되었습니다" />
 *  <Toast variant="cautionary" text="주의가 필요합니다" />
 *  <Toast variant="negative" text="오류가 발생했습니다" />
 *  <Toast variant="normal" leadingIcon={<Icon />} text="알림이 도착했습니다" />
 */

/* ── 인라인 SVG 아이콘 ─────────────────────────────────────── */

function CircleCheckFill({ color }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {/* 흰색 내부 채움 (배경 차단용) */}
      <circle cx="11" cy="11" r="7" fill="var(--color-static-white)" />
      {/* 아이콘 */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11 2C6.02944 2 2 6.02944 2 11C2 15.9706 6.02944 20 11 20C15.9706 20 20 15.9706 20 11C20 6.02944 15.9706 2 11 2ZM15.0303 9.03033C15.3232 8.73744 15.3232 8.26256 15.0303 7.96967C14.7374 7.67678 14.2626 7.67678 13.9697 7.96967L9.75 12.1893L8.03033 10.4697C7.73744 10.1768 7.26256 10.1768 6.96967 10.4697C6.67678 10.7626 6.67678 11.2374 6.96967 11.5303L9.21967 13.7803C9.51256 14.0732 9.98744 14.0732 10.2803 13.7803L15.0303 9.03033Z"
        fill={color}
      />
    </svg>
  )
}

function TriangleExclamationFill({ color }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {/* 흰색 내부 채움 (배경 차단용) */}
      <polygon points="11,4 20,18 2,18" fill="var(--color-static-white)" />
      {/* 아이콘 */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.56513 3.25882C10.2014 2.13412 11.7986 2.13412 12.4349 3.25882L20.7008 17.7647C21.3316 18.8809 20.5385 20.25 19.2659 20.25H2.73408C1.46149 20.25 0.668397 18.8809 1.29924 17.7647L9.56513 3.25882ZM11 8.25C11.4142 8.25 11.75 8.58579 11.75 9V13C11.75 13.4142 11.4142 13.75 11 13.75C10.5858 13.75 10.25 13.4142 10.25 13V9C10.25 8.58579 10.5858 8.25 11 8.25ZM11 17C11.5523 17 12 16.5523 12 16C12 15.4477 11.5523 15 11 15C10.4477 15 10 15.4477 10 16C10 16.5523 10.4477 17 11 17Z"
        fill={color}
      />
    </svg>
  )
}

function CircleExclamationFill({ color }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {/* 흰색 내부 채움 (배경 차단용) */}
      <circle cx="11" cy="11" r="7" fill="var(--color-static-white)" />
      {/* 아이콘 */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11 2C6.02944 2 2 6.02944 2 11C2 15.9706 6.02944 20 11 20C15.9706 20 20 15.9706 20 11C20 6.02944 15.9706 2 11 2ZM11 7.25C11.4142 7.25 11.75 7.58579 11.75 8V12C11.75 12.4142 11.4142 12.75 11 12.75C10.5858 12.75 10.25 12.4142 10.25 12V8C10.25 7.58579 10.5858 7.25 11 7.25ZM11 15.75C11.5523 15.75 12 15.3023 12 14.75C12 14.1977 11.5523 13.75 11 13.75C10.4477 13.75 10 14.1977 10 14.75C10 15.3023 10.4477 15.75 11 15.75Z"
        fill={color}
      />
    </svg>
  )
}

/* ── variant별 아이콘 설정 ─────────────────────────────────── */
const VARIANT_ICON = {
  positive:   { component: CircleCheckFill,       color: 'var(--color-atomic-green-60)'  },
  cautionary: { component: TriangleExclamationFill, color: 'var(--color-atomic-orange-60)' },
  negative:   { component: CircleExclamationFill, color: 'var(--color-atomic-red-60)'   },
}

/* ── 메인 컴포넌트 ──────────────────────────────────────────── */
export default function Toast({
  variant     = 'normal',
  text        = '',
  leadingIcon,
  className   = '',
}) {
  const iconSpec = VARIANT_ICON[variant]

  const outerStyle = {
    position:            'relative',
    display:             'flex',
    alignItems:          'flex-start',
    minWidth:            '335px',
    maxWidth:            '420px',
    paddingTop:          '11px',
    paddingBottom:       '11px',
    paddingLeft:         'var(--spacing-16)',
    paddingRight:        'var(--spacing-16)',
    borderRadius:        '12px',
    overflow:            'hidden',
    backdropFilter:      'blur(32px)',
    WebkitBackdropFilter: 'blur(32px)',
  }

  const containerStyle = {
    display:    'flex',
    flex:       '1 0 0',
    alignItems: 'center',
    gap:        'var(--spacing-8)',
    minHeight:  '32px',
    position:   'relative',
  }

  const messageStyle = {
    display:        'flex',
    flexDirection:  'column',
    flex:           '1 0 0',
    alignItems:     'flex-start',
    justifyContent: 'center',
    paddingTop:     'var(--spacing-5)',
    paddingBottom:  'var(--spacing-5)',
    paddingLeft:    'var(--spacing-2)',
    paddingRight:   'var(--spacing-2)',
    minWidth:       '1px',
  }

  const textStyle = {
    fontSize:            'var(--font-size-body-2)',
    lineHeight:          'var(--line-height-body-2-normal)',
    letterSpacing:       'var(--letter-spacing-body-2)',
    fontWeight:          'var(--font-weight-semibold)',
    color:               'var(--color-static-white)',
    opacity:             0.88,
    fontFeatureSettings: "'ss10' 1",
  }

  return (
    <div style={outerStyle} className={className} role="alert" aria-live="polite">
      {/* 배경 레이어 1: 역배경 기본 색 */}
      <div
        style={{
          position:        'absolute',
          inset:           0,
          backgroundColor: 'var(--color-inverse-background)',
          opacity:         0.52,
        }}
        aria-hidden="true"
      />
      {/* 배경 레이어 2: 프라이머리 오버레이 */}
      <div
        style={{
          position:        'absolute',
          inset:           0,
          backgroundColor: 'var(--color-primary-normal)',
          opacity:         0.05,
        }}
        aria-hidden="true"
      />

      <div style={containerStyle}>
        {/* Normal: 외부 leadingIcon */}
        {variant === 'normal' && leadingIcon && (
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', width: '22px', height: '22px' }}>
            {leadingIcon}
          </div>
        )}

        {/* Positive / Cautionary / Negative: 인라인 SVG 아이콘 */}
        {iconSpec && (() => {
          const Icon = iconSpec.component
          return <Icon color={iconSpec.color} />
        })()}

        <div style={messageStyle}>
          <span style={textStyle}>{text}</span>
        </div>
      </div>
    </div>
  )
}
