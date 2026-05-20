/**
 * ToggleIcon 컴포넌트 (Control/Toggle Icon)
 *
 * 아이콘으로 활성화 여부를 제어할 때 사용합니다.
 * 단일 영역에서 두 가지 상태(켜짐/꺼짐) 간 전환을 제공합니다.
 *
 * Props:
 *  icon        — 표시할 아이콘 (ReactNode)                        필수
 *  activeIcon  — active=true일 때 표시할 아이콘 (없으면 icon 공용) 기본: null
 *  active      — 활성(켜짐) 상태                                  기본: false
 *  color       — inactive 상태 아이콘 색상 (CSS 변수 문자열)      기본: 'var(--color-label-assistive)'
 *  activeColor — active 상태 아이콘 색상 (CSS 변수 문자열)        기본: 'var(--color-primary-normal)'
 *  disabled    — 비활성화 여부                                    기본: false
 *  onClick     — 클릭 핸들러
 *  aria-label  — 스크린리더용 레이블 (필수)
 *  className   — 추가 클래스
 *
 * 사용 예:
 *  <ToggleIcon icon={<HeartIcon />} aria-label="좋아요" onClick={handleToggle} />
 *  <ToggleIcon
 *    icon={<BookmarkOutlineIcon />}
 *    activeIcon={<BookmarkFilledIcon />}
 *    active={isBookmarked}
 *    aria-label="북마크"
 *    onClick={handleBookmark}
 *  />
 *  <ToggleIcon icon={<StarIcon />} active color="var(--color-label-normal)" aria-label="즐겨찾기" />
 */

import { useState } from 'react'

/* ── 인터랙션 오버레이 opacity ───────────────────────────────── */
const OVERLAY_OPACITY = { hovered: 0.05, focused: 0.08, pressed: 0.12 }

export default function ToggleIcon({
  icon,
  activeIcon  = null,
  active      = false,
  color       = 'var(--color-label-assistive)',
  activeColor = 'var(--color-primary-normal)',
  disabled    = false,
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
  const overlayColor = active
    ? 'var(--color-primary-normal)'
    : 'var(--color-label-normal)'

  const currentColor = active ? activeColor : color
  const currentIcon  = (active && activeIcon) ? activeIcon : icon

  const buttonStyle = {
    display:         'inline-flex',
    alignItems:      'center',
    justifyContent:  'center',
    position:        'relative',
    overflow:        'hidden',
    padding:         'var(--spacing-4)',
    backgroundColor: 'transparent',
    border:          'none',
    borderRadius:    '50%',
    cursor:          disabled ? 'not-allowed' : 'pointer',
    opacity:         disabled ? 0.32 : 1,
    color:           currentColor,
    flexShrink:      0,
    boxSizing:       'border-box',
    transition:      'color 0.15s ease, opacity 0.15s ease',
    outline:         'none',
    userSelect:      'none',
  }

  const overlayStyle = {
    position:        'absolute',
    inset:           0,
    backgroundColor: `color-mix(in srgb, ${overlayColor} ${Math.round(overlayOpacity * 100)}%, transparent)`,
    pointerEvents:   'none',
    transition:      'background-color 0.15s ease',
  }

  const iconWrapStyle = {
    display:    'flex',
    alignItems: 'center',
    width:      'var(--spacing-24)',
    height:     'var(--spacing-24)',
    flexShrink: 0,
  }

  return (
    <button
      type="button"
      className={className}
      style={buttonStyle}
      disabled={disabled}
      onClick={!disabled ? onClick : undefined}
      aria-pressed={active}
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
        {currentIcon}
      </span>
    </button>
  )
}
