/**
 * Button 컴포넌트
 *
 * 중요한 행동에 사용합니다. 가장 높은 시각 위계를 가집니다.
 * 아이콘과 함께 사용할 수 있습니다.
 *
 * Props:
 *  variant      — 'solid' | 'outlined'                            기본: 'solid'
 *  color        — 'primary' | 'assistive'                         기본: 'primary'
 *  size         — 'large' | 'medium' | 'small'                    기본: 'large'
 *  label        — 버튼 텍스트 (iconOnly=true면 aria-label로 사용)
 *  leadingIcon  — 텍스트 앞 아이콘 (ReactNode)
 *  trailingIcon — 텍스트 뒤 아이콘 (ReactNode)
 *  iconOnly     — true: 정사각형 아이콘 전용 버튼               기본: false
 *  disabled     — 비활성화 여부                                   기본: false
 *  loading      — 로딩 상태 (스피너 표시, 클릭 차단)             기본: false
 *  onClick      — 클릭 핸들러
 *  className    — 추가 클래스
 *
 * 사용 예:
 *  <Button label="확인" />
 *  <Button variant="outlined" color="assistive" size="medium" label="취소" />
 *  <Button leadingIcon={<MyIcon />} label="업로드" />
 *  <Button iconOnly leadingIcon={<SearchIcon />} label="검색" size="small" />
 *  <Button loading label="저장 중" />
 *  <Button disabled label="비활성화" />
 */

import { useState } from 'react'
import Spinner from '../Spinner/Spinner'

/* ── 사이즈별 스펙 ────────────────────────────────────────────── */
const SIZE = {
  large: {
    paddingTop:    'var(--spacing-12)',
    paddingBottom: 'var(--spacing-12)',
    paddingLeft:   'var(--spacing-24)',
    paddingRight:  'var(--spacing-24)',
    fontSize:      'var(--font-size-body-1)',
    lineHeight:    'var(--line-height-body-1-normal)',
    iconSize:      'var(--spacing-20)',
    gap:           'var(--spacing-6)',
    spinnerSize:   20,
  },
  medium: {
    paddingTop:    'var(--spacing-10)',
    paddingBottom: 'var(--spacing-10)',
    paddingLeft:   'var(--spacing-20)',
    paddingRight:  'var(--spacing-20)',
    fontSize:      'var(--font-size-label-1)',
    lineHeight:    'var(--line-height-label-1-normal)',
    iconSize:      'var(--spacing-16)',
    gap:           'var(--spacing-6)',
    spinnerSize:   16,
  },
  small: {
    paddingTop:    'var(--spacing-8)',
    paddingBottom: 'var(--spacing-8)',
    paddingLeft:   'var(--spacing-16)',
    paddingRight:  'var(--spacing-16)',
    fontSize:      'var(--font-size-caption-1)',
    lineHeight:    'var(--line-height-caption-1)',
    iconSize:      'var(--spacing-14)',
    gap:           'var(--spacing-4)',
    spinnerSize:   14,
  },
}

/* ── variant × color 색상 스펙 ──────────────────────────────── */
const COLOR_SCHEME = {
  solid: {
    primary: {
      backgroundColor: 'var(--color-primary-normal)',
      color:           'var(--color-static-white)',
      border:          'none',
      boxShadow:       'none',
      fontWeight:      'var(--font-weight-semibold)',
      backdropFilter:  'none',
      spinnerColor:    'var(--color-static-white)',
    },
    assistive: {
      backgroundColor: 'var(--color-fill-normal)',
      color:           'var(--color-label-neutral)',
      border:          'none',
      boxShadow:       'none',
      fontWeight:      'var(--font-weight-medium)',
      backdropFilter:  'blur(32px)',
      spinnerColor:    'var(--color-label-neutral)',
    },
  },
  outlined: {
    primary: {
      backgroundColor: 'transparent',
      color:           'var(--color-primary-normal)',
      border:          'none',
      boxShadow:       'inset 0 0 0 1px var(--color-line-neutral)',
      fontWeight:      'var(--font-weight-semibold)',
      backdropFilter:  'none',
      spinnerColor:    'var(--color-primary-normal)',
    },
    assistive: {
      backgroundColor: 'transparent',
      color:           'var(--color-label-normal)',
      border:          'none',
      boxShadow:       'inset 0 0 0 1px var(--color-line-neutral)',
      fontWeight:      'var(--font-weight-medium)',
      backdropFilter:  'none',
      spinnerColor:    'var(--color-label-normal)',
    },
  },
}

/* ── 인터랙션 오버레이 opacity (variant × color) ─────────────── */
const OVERLAY_OPACITY = {
  solid: {
    primary:   { hovered: 0.08, focused: 0.12, pressed: 0.18 },
    assistive: { hovered: 0.05, focused: 0.08, pressed: 0.12 },
  },
  outlined: {
    primary:   { hovered: 0.04, focused: 0.06, pressed: 0.09 },
    assistive: { hovered: 0.04, focused: 0.06, pressed: 0.09 },
  },
}

/* ── iconOnly일 때 정사각형 패딩 ────────────────────────────── */
function iconOnlyPadding(size) {
  if (size === 'large')  return 'var(--spacing-14)'
  if (size === 'medium') return 'var(--spacing-12)'
  return 'var(--spacing-10)'
}

export default function Button({
  variant      = 'solid',
  color        = 'primary',
  size         = 'large',
  label,
  leadingIcon  = null,
  trailingIcon = null,
  iconOnly     = false,
  disabled     = false,
  loading      = false,
  onClick,
  className,
  ...props
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const sz     = SIZE[size]     ?? SIZE.large
  const scheme = COLOR_SCHEME[variant]?.[color] ?? COLOR_SCHEME.solid.primary

  const isDisabled = disabled || loading

  const opacityMap     = OVERLAY_OPACITY[variant]?.[color] ?? OVERLAY_OPACITY.solid.primary
  const overlayOpacity = isDisabled  ? 0
    : isPressed                      ? opacityMap.pressed
    : isFocused                      ? opacityMap.focused
    : isHovered                      ? opacityMap.hovered
    : 0

  const iconOnlyPad = iconOnly ? iconOnlyPadding(size) : null

  const buttonStyle = {
    display:         'inline-flex',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             iconOnly ? 0 : sz.gap,
    position:        'relative',
    overflow:        'hidden',
    borderRadius:    'var(--spacing-12)',
    paddingTop:      iconOnly ? iconOnlyPad : sz.paddingTop,
    paddingBottom:   iconOnly ? iconOnlyPad : sz.paddingBottom,
    paddingLeft:     iconOnly ? iconOnlyPad : sz.paddingLeft,
    paddingRight:    iconOnly ? iconOnlyPad : sz.paddingRight,
    backgroundColor: scheme.backgroundColor,
    color:           scheme.color,
    border:          scheme.border,
    boxShadow:       scheme.boxShadow,
    fontWeight:      scheme.fontWeight,
    backdropFilter:  scheme.backdropFilter,
    fontSize:        sz.fontSize,
    lineHeight:      sz.lineHeight,
    cursor:          isDisabled ? 'not-allowed' : 'pointer',
    opacity:         disabled ? 0.32 : 1,
    boxSizing:       'border-box',
    whiteSpace:      'nowrap',
    transition:      'opacity 0.15s ease',
    userSelect:      'none',
    outline:         'none',
    fontFamily:      'inherit',
  }

  /* 아이콘 래퍼 크기 */
  const iconWrapStyle = {
    display:    'flex',
    alignItems: 'center',
    width:      sz.iconSize,
    height:     sz.iconSize,
    flexShrink: 0,
  }

  /* 인터랙션 오버레이 */
  const overlayStyle = {
    position:        'absolute',
    inset:           0,
    backgroundColor: `color-mix(in srgb, var(--color-label-normal) ${Math.round(overlayOpacity * 100)}%, transparent)`,
    pointerEvents:   'none',
    transition:      'background-color 0.15s ease',
  }

  /* 로딩 중 텍스트/아이콘 숨김 */
  const contentStyle = {
    display:    'contents',
    visibility: loading ? 'hidden' : 'visible',
  }

  return (
    <button
      type="button"
      className={className}
      style={buttonStyle}
      disabled={isDisabled}
      onClick={!isDisabled ? onClick : undefined}
      aria-label={iconOnly ? label : undefined}
      aria-busy={loading || undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false) }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => { setIsFocused(false); setIsPressed(false) }}
      {...props}
    >
      {/* 인터랙션 오버레이 */}
      <div style={overlayStyle} aria-hidden="true" />

      {/* 로딩 스피너 — 절대 중앙 */}
      {loading && (
        <span style={{
          position:       'absolute',
          inset:          0,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
        }}>
          <Spinner
            size={sz.spinnerSize}
            color={scheme.spinnerColor}
            trackColor="transparent"
          />
        </span>
      )}

      {/* 본문 콘텐츠 */}
      <span style={contentStyle}>
        {!iconOnly && leadingIcon && (
          <span style={iconWrapStyle} aria-hidden="true">
            {leadingIcon}
          </span>
        )}

        {iconOnly
          ? (leadingIcon ?? trailingIcon)
          : label && <span style={{ visibility: loading ? 'hidden' : 'visible' }}>{label}</span>
        }

        {!iconOnly && trailingIcon && (
          <span style={iconWrapStyle} aria-hidden="true">
            {trailingIcon}
          </span>
        )}
      </span>
    </button>
  )
}
