/**
 * Chip 컴포넌트
 *
 * 상호작용을 통해 정보를 분류하거나, 상태를 표시할 때 사용됩니다.
 * 항목을 제어하거나 이동할 때 사용합니다. 낮은 시각 위계를 가집니다.
 *
 * Props:
 *  variant        — 'outlined' | 'solid'                           기본: 'outlined'
 *  size           — 'xsmall' | 'small' | 'medium' | 'large'       기본: 'medium'
 *  active         — 선택(활성) 상태                               기본: false
 *  disabled       — 비활성화 여부                                  기본: false
 *  label          — 칩 텍스트
 *  leadingContent — 텍스트 앞 콘텐츠 (ReactNode, 아이콘 등)
 *  trailingContent— 텍스트 뒤 콘텐츠 (ReactNode, 아이콘 등)
 *  onClick        — 클릭 핸들러
 *  className      — 추가 클래스
 *
 * 사용 예:
 *  <Chip label="전체" />
 *  <Chip label="선택됨" active />
 *  <Chip variant="solid" label="다크" active />
 *  <Chip size="small" label="소형" leadingContent={<Icon />} />
 *  <Chip label="비활성" disabled />
 */

import { useState } from 'react'

/* ── 사이즈 스펙 ─────────────────────────────────────────────── */
const SIZE = {
  xsmall: {
    paddingTop:    'var(--spacing-4)',
    paddingBottom: 'var(--spacing-4)',
    paddingLeft:   'var(--spacing-8)',
    paddingRight:  'var(--spacing-8)',
    borderRadius:  'var(--spacing-6)',
    fontSize:      'var(--font-size-caption-1)',
    lineHeight:    'var(--line-height-caption-1)',
    iconSize:      'var(--spacing-10)',
    gap:           'var(--spacing-2)',
  },
  small: {
    paddingTop:    'var(--spacing-6)',
    paddingBottom: 'var(--spacing-6)',
    paddingLeft:   'var(--spacing-10)',
    paddingRight:  'var(--spacing-10)',
    borderRadius:  'var(--spacing-8)',
    fontSize:      'var(--font-size-label-1)',
    lineHeight:    'var(--line-height-label-1-normal)',
    iconSize:      'var(--spacing-12)',
    gap:           'var(--spacing-4)',
  },
  medium: {
    paddingTop:    'var(--spacing-8)',
    paddingBottom: 'var(--spacing-8)',
    paddingLeft:   'var(--spacing-10)',
    paddingRight:  'var(--spacing-10)',
    borderRadius:  'var(--spacing-10)',
    fontSize:      'var(--font-size-body-2)',
    lineHeight:    'var(--line-height-body-2-normal)',
    iconSize:      'var(--spacing-14)',
    gap:           'var(--spacing-4)',
  },
  large: {
    paddingTop:    'var(--spacing-10)',
    paddingBottom: 'var(--spacing-10)',
    paddingLeft:   'var(--spacing-12)',
    paddingRight:  'var(--spacing-12)',
    borderRadius:  'var(--spacing-12)',
    fontSize:      'var(--font-size-body-2)',
    lineHeight:    'var(--line-height-body-2-normal)',
    iconSize:      'var(--spacing-16)',
    gap:           'var(--spacing-4)',
  },
}

/* ── variant × active 색상 스펙 ─────────────────────────────── */
function getColorScheme(variant, active) {
  if (variant === 'outlined') {
    if (active) {
      return {
        backgroundColor: 'color-mix(in srgb, var(--color-primary-normal) 5%, transparent)',
        border:          'none',
        boxShadow:       'inset 0 0 0 1px color-mix(in srgb, var(--color-primary-normal) 43%, transparent)',
        color:           'var(--color-primary-normal)',
      }
    }
    return {
      backgroundColor: 'transparent',
      border:          'none',
      boxShadow:       'inset 0 0 0 1px var(--color-line-neutral)',
      color:           'var(--color-label-alternative)',
    }
  }

  /* solid */
  if (active) {
    return {
      backgroundColor: 'var(--color-label-strong)',
      border:          'none',
      color:           'var(--color-inverse-label)',
    }
  }
  return {
    backgroundColor: 'var(--color-fill-alternative)',
    border:          'none',
    color:           'var(--color-label-alternative)',
  }
}

/* ── 인터랙션 오버레이 색 (variant × active) ─────────────────── */
function getOverlayColor(variant, active) {
  if (variant === 'outlined' && active) return 'var(--color-primary-normal)'
  return 'var(--color-label-normal)'
}

const OVERLAY_OPACITY = { hovered: 0.05, focused: 0.08, pressed: 0.12 }

export default function Chip({
  variant        = 'outlined',
  size           = 'medium',
  active         = false,
  disabled       = false,
  label,
  leadingContent = null,
  trailingContent= null,
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
  const overlayColor = getOverlayColor(variant, active)

  const sz     = SIZE[size] ?? SIZE.medium
  const scheme = getColorScheme(variant, active)

  const chipStyle = {
    display:         'inline-flex',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             sz.gap,
    position:        'relative',
    overflow:        'hidden',
    paddingTop:      sz.paddingTop,
    paddingBottom:   sz.paddingBottom,
    paddingLeft:     sz.paddingLeft,
    paddingRight:    sz.paddingRight,
    borderRadius:    sz.borderRadius,
    backgroundColor: scheme.backgroundColor,
    border:          scheme.border,
    boxShadow:       scheme.boxShadow,
    color:           scheme.color,
    fontSize:        sz.fontSize,
    lineHeight:      sz.lineHeight,
    fontWeight:      'var(--font-weight-medium)',
    cursor:          disabled ? 'not-allowed' : 'pointer',
    opacity:         disabled ? 0.32 : 1,
    boxSizing:       'border-box',
    whiteSpace:      'nowrap',
    userSelect:      'none',
    outline:         'none',
    fontFamily:      'inherit',
    transition:      'opacity 0.15s ease',
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
    width:      sz.iconSize,
    height:     sz.iconSize,
    flexShrink: 0,
  }

  return (
    <button
      type="button"
      className={className}
      style={chipStyle}
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

      {leadingContent && (
        <span style={iconWrapStyle} aria-hidden="true">
          {leadingContent}
        </span>
      )}

      {label && <span>{label}</span>}

      {trailingContent && (
        <span style={iconWrapStyle} aria-hidden="true">
          {trailingContent}
        </span>
      )}
    </button>
  )
}
