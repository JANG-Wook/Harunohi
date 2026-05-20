/**
 * IconButtonBackground 컴포넌트 (Button/Icon/Background)
 *
 * 하위 레이어와 구분이 필요할 때 아이콘 뒤에 원형 배경을 표시하는 버튼입니다.
 * alternative prop으로 frosted glass / dark solid 배경을 선택합니다.
 *
 * Props:
 *  icon        — 표시할 아이콘 (ReactNode)                       필수
 *  alternative — false: frosted glass / true: dark solid          기본: false
 *  color       — 아이콘 색상 (CSS 변수 문자열)                   기본: 'var(--color-label-normal)'
 *  disabled    — 비활성화 여부                                   기본: false
 *  onClick     — 클릭 핸들러
 *  aria-label  — 스크린리더용 레이블 (필수)
 *  className   — 추가 클래스
 *
 * 사용 예:
 *  <IconButtonBackground icon={<CloseIcon />} aria-label="닫기" />
 *  <IconButtonBackground icon={<CloseIcon />} alternative aria-label="닫기" />
 *  <IconButtonBackground icon={<SearchIcon />} color="var(--color-static-white)" aria-label="검색" />
 */

import { useState } from 'react'

/* ── 인터랙션 오버레이 opacity ───────────────────────────────── */
const OVERLAY_OPACITY = { hovered: 0.05, focused: 0.08, pressed: 0.12 }

export default function IconButtonBackground({
  icon,
  alternative = false,
  color       = 'var(--color-label-normal)',
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

  /* ── 아이콘 영역 24×24, 내부 아이콘 20×20 (padding 2px) ── */
  const buttonStyle = {
    display:         'inline-flex',
    alignItems:      'center',
    justifyContent:  'center',
    position:        'relative',
    width:           'var(--spacing-24)',
    height:          'var(--spacing-24)',
    padding:         'var(--spacing-2)',
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

  /* ── 배경 원: 아이콘 영역 밖으로 4px 확장 → 32×32px ── */
  const bgBaseStyle = {
    position:      'absolute',
    top:           'calc(var(--spacing-4) * -1)',
    left:          'calc(var(--spacing-4) * -1)',
    width:         'calc(var(--spacing-24) + var(--spacing-8))',
    height:        'calc(var(--spacing-24) + var(--spacing-8))',
    borderRadius:  '50%',
    pointerEvents: 'none',
  }

  /* 오버레이도 배경 원과 동일한 32×32 영역에 적용 */
  const overlayStyle = {
    ...bgBaseStyle,
    backgroundColor: `color-mix(in srgb, var(--color-label-normal) ${Math.round(overlayOpacity * 100)}%, transparent)`,
    transition:      'background-color 0.15s ease',
    zIndex:          1,
  }

  /* ── 아이콘 opacity ── */
  const iconWrapStyle = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    width:          '100%',
    height:         '100%',
    opacity:        alternative ? 0.88 : 0.61,
    position:       'relative',
    zIndex:     2,
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
      {/* alternative=false: frosted glass (white + black overlay + blur) */}
      {!alternative && (
        <>
          <span
            style={{
              ...bgBaseStyle,
              backdropFilter: 'blur(32px)',
              background:     'color-mix(in srgb, var(--color-static-white) 35%, transparent)',
            }}
            aria-hidden="true"
          />
          <span
            style={{
              ...bgBaseStyle,
              background: 'color-mix(in srgb, var(--color-static-black) 5%, transparent)',
            }}
            aria-hidden="true"
          />
        </>
      )}

      {/* alternative=true: dark solid circle */}
      {alternative && (
        <span
          style={{
            ...bgBaseStyle,
            backgroundColor: 'var(--color-cool-neutral-30)',
            opacity:         0.61,
          }}
          aria-hidden="true"
        />
      )}

      {/* 인터랙션 오버레이 */}
      <span style={overlayStyle} aria-hidden="true" />

      <span style={iconWrapStyle} aria-hidden="true">
        {icon}
      </span>
    </button>
  )
}
