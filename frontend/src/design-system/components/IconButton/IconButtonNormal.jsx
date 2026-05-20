/**
 * IconButtonNormal 컴포넌트 (Button/Icon/Normal)
 *
 * 가장 기본적인 형태로, 아이콘을 버튼으로 사용하여 간단한 상호작용을 제공합니다.
 * 배경·테두리 없이 아이콘만 표시됩니다. 색상을 자유롭게 변경할 수 있습니다.
 * 필요한 경우 우측 상단에 Push Badge를 표시할 수 있습니다.
 *
 * Props:
 *  icon       — 표시할 아이콘 (ReactNode)                         필수
 *  color      — 아이콘 색상 (CSS 변수 문자열)                     기본: 'var(--color-label-normal)'
 *  badge      — Push Badge 표시 여부                              기본: false
 *  disabled   — 비활성화 여부                                     기본: false
 *  onClick    — 클릭 핸들러
 *  aria-label — 스크린리더용 레이블 (아이콘 전용 버튼 필수)
 *  className  — 추가 클래스
 *
 * 사용 예:
 *  <IconButtonNormal icon={<SearchIcon />} aria-label="검색" />
 *  <IconButtonNormal icon={<BellIcon />} color="var(--color-primary-normal)" badge aria-label="알림" />
 *  <IconButtonNormal icon={<CloseIcon />} disabled aria-label="닫기" />
 */

import { useState } from 'react'

/* ── 인터랙션 오버레이 opacity ───────────────────────────────── */
const OVERLAY_OPACITY = { hovered: 0.05, focused: 0.08, pressed: 0.12 }

export default function IconButtonNormal({
  icon,
  color     = 'var(--color-label-normal)',
  badge     = false,
  disabled  = false,
  onClick,
  className,
  ...props
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const overlayOpacity = disabled    ? 0
    : isPressed                      ? OVERLAY_OPACITY.pressed
    : isFocused                      ? OVERLAY_OPACITY.focused
    : isHovered                      ? OVERLAY_OPACITY.hovered
    : 0

  const buttonStyle = {
    display:         'inline-flex',
    alignItems:      'center',
    justifyContent:  'center',
    position:        'relative',
    overflow:        'hidden',
    padding:         'var(--spacing-8)',
    backgroundColor: 'transparent',
    border:          'none',
    borderRadius:    '50%',
    cursor:          disabled ? 'not-allowed' : 'pointer',
    opacity:         disabled ? 0.32 : 1,
    color,
    flexShrink:      0,
    boxSizing:       'border-box',
    transition:      'opacity 0.15s ease',
    outline:         'none',
    userSelect:      'none',
  }

  const iconWrapStyle = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    width:          'var(--spacing-24)',
    height:         'var(--spacing-24)',
    flexShrink:     0,
  }

  const overlayStyle = {
    position:        'absolute',
    inset:           0,
    backgroundColor: `color-mix(in srgb, var(--color-label-normal) ${Math.round(overlayOpacity * 100)}%, transparent)`,
    pointerEvents:   'none',
    transition:      'background-color 0.15s ease',
  }

  const badgeStyle = {
    position:        'absolute',
    top:             'var(--spacing-6)',
    right:           'var(--spacing-6)',
    width:           'var(--spacing-8)',
    height:          'var(--spacing-8)',
    borderRadius:    '50%',
    backgroundColor: 'var(--color-status-negative)',
    border:          '1.5px solid var(--color-bg-normal)',
    boxSizing:       'border-box',
    pointerEvents:   'none',
  }

  return (
    <button
      type="button"
      className={className}
      style={buttonStyle}
      disabled={disabled}
      onClick={!disabled ? onClick : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false) }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => { setIsFocused(false); setIsPressed(false) }}
      {...props}
    >
      <div style={overlayStyle} aria-hidden="true" />

      <span style={iconWrapStyle} aria-hidden="true">
        {icon}
      </span>

      {badge && (
        <span style={badgeStyle} aria-label="알림" role="status" />
      )}
    </button>
  )
}
