/**
 * TextButton 컴포넌트
 *
 * 배경색이나 테두리가 없는 버튼으로, 텍스트만으로 구성됩니다.
 * 부가적이나 강조가 필요한 행동에 사용합니다. 낮은 시각 위계를 가집니다.
 *
 * Props:
 *  color        — 'primary' | 'assistive'                         기본: 'primary'
 *  size         — 'medium' | 'small'                              기본: 'medium'
 *  label        — 버튼 텍스트
 *  leadingIcon  — 텍스트 앞 아이콘 (ReactNode)
 *  trailingIcon — 텍스트 뒤 아이콘 (ReactNode)
 *  disabled     — 비활성화 여부                                   기본: false
 *  loading      — 로딩 상태 (스피너 표시, 클릭 차단)             기본: false
 *  onClick      — 클릭 핸들러
 *  className    — 추가 클래스
 *
 * 사용 예:
 *  <TextButton label="더 보기" />
 *  <TextButton color="assistive" label="닫기" />
 *  <TextButton size="small" leadingIcon={<Icon />} label="추가" />
 *  <TextButton loading label="처리 중" />
 *  <TextButton disabled label="비활성화" />
 */

import { useState } from 'react'
import Spinner from '../Spinner/Spinner'

/* ── 사이즈별 스펙 ────────────────────────────────────────────── */
const SIZE = {
  medium: {
    paddingTop:    'var(--spacing-4)',
    paddingBottom: 'var(--spacing-4)',
    fontSize:      'var(--font-size-body-1)',
    lineHeight:    'var(--line-height-body-1-normal)',
    iconSize:      'var(--spacing-20)',
    gap:           'var(--spacing-4)',
    spinnerSize:   16,
  },
  small: {
    paddingTop:    'var(--spacing-4)',
    paddingBottom: 'var(--spacing-4)',
    fontSize:      'var(--font-size-label-1)',
    lineHeight:    'var(--line-height-label-1-normal)',
    iconSize:      'var(--spacing-16)',
    gap:           'var(--spacing-4)',
    spinnerSize:   14,
  },
}

/* ── color별 색상 스펙 ───────────────────────────────────────── */
const COLOR_SCHEME = {
  primary: {
    color:        'var(--color-primary-normal)',
    spinnerColor: 'var(--color-primary-normal)',
  },
  assistive: {
    color:        'var(--color-label-alternative)',
    spinnerColor: 'var(--color-label-alternative)',
  },
}

/* ── 인터랙션 오버레이 opacity ───────────────────────────────── */
const OVERLAY_OPACITY = {
  primary:   { hovered: 0.05, focused: 0.08, pressed: 0.12 },
  assistive: { hovered: 0.04, focused: 0.06, pressed: 0.09 },
}

const OVERLAY_COLOR = {
  primary:   'var(--color-primary-normal)',
  assistive: 'var(--color-label-normal)',
}

export default function TextButton({
  color        = 'primary',
  size         = 'medium',
  label,
  leadingIcon  = null,
  trailingIcon = null,
  disabled     = false,
  loading      = false,
  onClick,
  className,
  ...props
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const sz     = SIZE[size]     ?? SIZE.medium
  const scheme = COLOR_SCHEME[color] ?? COLOR_SCHEME.primary

  const isDisabled = disabled || loading

  const opacityMap     = OVERLAY_OPACITY[color] ?? OVERLAY_OPACITY.primary
  const overlayOpacity = isDisabled                ? 0
    : isPressed                                    ? opacityMap.pressed
    : isFocused                                    ? opacityMap.focused
    : isHovered                                    ? opacityMap.hovered
    : 0
  const overlayColor = OVERLAY_COLOR[color] ?? OVERLAY_COLOR.primary

  const buttonStyle = {
    display:         'inline-flex',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             sz.gap,
    position:        'relative',
    paddingTop:      sz.paddingTop,
    paddingBottom:   sz.paddingBottom,
    paddingLeft:     0,
    paddingRight:    0,
    backgroundColor: 'transparent',
    border:          'none',
    color:           scheme.color,
    fontWeight:      'var(--font-weight-semibold)',
    fontSize:        sz.fontSize,
    lineHeight:      sz.lineHeight,
    cursor:          isDisabled ? 'not-allowed' : 'pointer',
    opacity:         disabled ? 0.32 : 1,
    whiteSpace:      'nowrap',
    userSelect:      'none',
    outline:         'none',
    fontFamily:      'inherit',
    boxSizing:       'border-box',
    transition:      'opacity 0.15s ease',
  }

  const iconWrapStyle = {
    display:    'flex',
    alignItems: 'center',
    width:      sz.iconSize,
    height:     sz.iconSize,
    flexShrink: 0,
  }

  /* 텍스트 영역 좌우로 8px 확장된 오버레이 */
  const overlayStyle = {
    position:        'absolute',
    top:             0,
    bottom:          0,
    left:            'calc(-1 * var(--spacing-8))',
    right:           'calc(-1 * var(--spacing-8))',
    backgroundColor: `color-mix(in srgb, ${overlayColor} ${Math.round(overlayOpacity * 100)}%, transparent)`,
    borderRadius:    'var(--spacing-6)',
    pointerEvents:   'none',
    transition:      'background-color 0.15s ease',
  }

  return (
    <button
      type="button"
      className={className}
      style={buttonStyle}
      disabled={isDisabled}
      onClick={!isDisabled ? onClick : undefined}
      aria-busy={loading || undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false) }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => { setIsFocused(false); setIsPressed(false) }}
      {...props}
    >
      <div style={overlayStyle} aria-hidden="true" />

      {loading ? (
        <Spinner
          size={sz.spinnerSize}
          color={scheme.spinnerColor}
          trackColor="transparent"
        />
      ) : (
        <>
          {leadingIcon && (
            <span style={iconWrapStyle} aria-hidden="true">
              {leadingIcon}
            </span>
          )}

          {label && <span>{label}</span>}

          {trailingIcon && (
            <span style={iconWrapStyle} aria-hidden="true">
              {trailingIcon}
            </span>
          )}
        </>
      )}
    </button>
  )
}
