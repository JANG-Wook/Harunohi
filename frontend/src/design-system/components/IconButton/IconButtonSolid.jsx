/**
 * IconButtonSolid 컴포넌트 (Button/Icon/Solid)
 *
 * 아이콘을 통해 강조되어야 할 주요 액션에 사용합니다.
 * 높은 시각 위계를 가집니다. 배경색과 아이콘 색상을 자유롭게 변경할 수 있습니다.
 *
 * Props:
 *  icon            — 표시할 아이콘 (ReactNode)                   필수
 *  size            — 'medium' | 'small' | 'custom'               기본: 'medium'
 *  customSize      — size='custom'일 때 버튼 전체 크기 (px 숫자) 기본: 28
 *  color           — 아이콘 색상 (CSS 변수 문자열)               기본: 'var(--color-static-white)'
 *  backgroundColor — 배경 색상 (CSS 변수 문자열)                 기본: 'var(--color-primary-normal)'
 *  disabled        — 비활성화 여부                               기본: false
 *  onClick         — 클릭 핸들러
 *  aria-label      — 스크린리더용 레이블 (필수)
 *  className       — 추가 클래스
 *
 * 사용 예:
 *  <IconButtonSolid icon={<PlusIcon />} aria-label="추가" />
 *  <IconButtonSolid icon={<EditIcon />} size="small" aria-label="편집" />
 *  <IconButtonSolid
 *    icon={<HeartIcon />}
 *    size="custom"
 *    customSize={36}
 *    backgroundColor="var(--color-status-negative)"
 *    aria-label="좋아요"
 *  />
 */

import { useState } from 'react'

/* ── 사이즈 프리셋 (Outlined와 동일) ────────────────────────── */
const SIZE_PRESET = {
  medium: {
    buttonSize: 'var(--spacing-40)',
    padding:    'var(--spacing-10)',
  },
  small: {
    buttonSize: 'var(--spacing-32)',
    padding:    'var(--spacing-8)',
  },
}

/* ── 인터랙션 오버레이 opacity ───────────────────────────────── */
const OVERLAY_OPACITY = { hovered: 0.05, focused: 0.08, pressed: 0.12 }

export default function IconButtonSolid({
  icon,
  size            = 'medium',
  customSize      = 28,
  color           = 'var(--color-static-white)',
  backgroundColor = 'var(--color-primary-normal)',
  disabled        = false,
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

  const isCustom = size === 'custom'

  const resolvedButtonSize = isCustom
    ? `${customSize}px`
    : SIZE_PRESET[size]?.buttonSize ?? SIZE_PRESET.medium.buttonSize

  const resolvedPadding = isCustom
    ? `${Math.round(customSize * 0.2)}px`
    : SIZE_PRESET[size]?.padding ?? SIZE_PRESET.medium.padding

  const buttonStyle = {
    display:         'inline-flex',
    alignItems:      'center',
    justifyContent:  'center',
    position:        'relative',
    overflow:        'hidden',
    width:           resolvedButtonSize,
    height:          resolvedButtonSize,
    padding:         resolvedPadding,
    backgroundColor,
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

  const overlayStyle = {
    position:        'absolute',
    inset:           0,
    backgroundColor: `color-mix(in srgb, var(--color-label-normal) ${Math.round(overlayOpacity * 100)}%, transparent)`,
    pointerEvents:   'none',
    transition:      'background-color 0.15s ease',
  }

  const iconWrapStyle = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    width:          '100%',
    height:         '100%',
    flexShrink:     0,
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
    </button>
  )
}
