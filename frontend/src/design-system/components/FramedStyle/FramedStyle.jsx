import { useState } from 'react'

const OVERLAY_OPACITY = { hovered: 0.05, focused: 0.08, pressed: 0.12 }

const FRAME_SIZE = {
  medium: { radius: 'var(--spacing-14)', paddingH: 'var(--spacing-16)', paddingV: 'var(--spacing-4)' },
  small:  { radius: 'var(--spacing-12)', paddingH: 'var(--spacing-12)', paddingV: 'var(--spacing-4)' },
  large:  { radius: 'var(--spacing-16)', paddingH: 'var(--spacing-20)', paddingV: 'var(--spacing-4)' },
  xlarge: { radius: 'var(--spacing-20)', paddingH: 'var(--spacing-24)', paddingV: 'var(--spacing-8)' },
}

const SHADOW_TOKEN = {
  xsmall: 'var(--shadow-normal-xsmall)',
  small:  'var(--shadow-normal-small)',
  medium: 'var(--shadow-normal-medium)',
  large:  'var(--shadow-normal-large)',
  xlarge: 'var(--shadow-normal-xlarge)',
  none:   'none',
}

export default function FramedStyle({
  selected      = false,
  status        = 'normal',
  disabled      = false,
  onClick       = null,
  className     = '',
  frame         = 'medium',
  shadow        = 'xsmall',
  forceHovered  = false,
  forceFocused  = false,
  children,
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const isClickable = !!onClick && !disabled
  const isNegative  = status === 'negative'

  const hovered = isHovered || forceHovered
  const focused  = isFocused || forceFocused

  const overlayOpacity = !isClickable ? 0
    : isPressed ? OVERLAY_OPACITY.pressed
    : focused   ? OVERLAY_OPACITY.focused
    : hovered   ? OVERLAY_OPACITY.hovered
    : 0

  const showRing  = selected && !disabled
  const ringColor = isNegative
    ? 'var(--color-status-negative)'
    : 'var(--color-primary-normal)'

  const { radius, paddingH, paddingV } = FRAME_SIZE[frame] ?? FRAME_SIZE.medium
  const boxShadow = SHADOW_TOKEN[shadow] ?? SHADOW_TOKEN.xsmall

  const outerStyle = {
    position:   'relative',
    isolation:  'isolate',
    display:    'flex',
    alignItems: 'center',
  }

  const containerStyle = {
    flex:            '1 0 0',
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: disabled
      ? 'var(--color-interaction-disable)'
      : 'var(--color-bg-normal)',
    borderRadius:    radius,
    overflow:        'hidden',
    paddingTop:      paddingV,
    paddingBottom:   paddingV,
    paddingLeft:     paddingH,
    paddingRight:    paddingH,
    boxShadow,
    position:        'relative',
    zIndex:          1,
    cursor:          disabled ? 'not-allowed' : (onClick ? 'pointer' : 'default'),
    userSelect:      'none',
  }

  const innerBorderStyle = {
    position:      'absolute',
    inset:         0,
    borderRadius:  radius,
    border:        isNegative && !selected
      ? '1px solid color-mix(in srgb, var(--color-status-negative) 28%, transparent)'
      : '1px solid var(--color-line-neutral)',
    pointerEvents: 'none',
  }

  const ringBaseStyle = {
    position:      'absolute',
    inset:         0,
    borderRadius:  radius,
    border:        '2px solid var(--color-bg-normal)',
    pointerEvents: 'none',
  }

  const ringStyle = {
    position:      'absolute',
    inset:         0,
    borderRadius:  radius,
    border:        `2px solid ${ringColor}`,
    opacity:       0.43,
    pointerEvents: 'none',
  }

  const contentStyle = {
    flex:     '1 0 0',
    position: 'relative',
    minWidth: 0,
  }

  const handleClick = () => {
    if (!disabled && onClick) onClick()
  }

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <div style={outerStyle} className={className}>
      <div
        style={containerStyle}
        role={onClick ? 'button' : undefined}
        aria-pressed={onClick ? selected : undefined}
        aria-disabled={disabled}
        tabIndex={onClick && !disabled ? 0 : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setIsPressed(false) }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => { setIsFocused(false); setIsPressed(false) }}
      >
        {/* 인터랙션 오버레이 */}
        <div
          aria-hidden="true"
          style={{
            position:        'absolute',
            inset:           0,
            backgroundColor: `color-mix(in srgb, var(--color-label-normal) ${Math.round(overlayOpacity * 100)}%, transparent)`,
            pointerEvents:   'none',
            transition:      'background-color 0.15s ease',
            zIndex:          2,
          }}
        />

        {/* 내부 테두리 */}
        <div aria-hidden="true" style={innerBorderStyle} />

        {/* 선택 링 — Base (흰색 gap) */}
        {showRing && <div aria-hidden="true" style={ringBaseStyle} />}

        {/* 선택 링 — Ring (primary / negative, opacity 43%) */}
        {showRing && <div aria-hidden="true" style={ringStyle} />}

        {/* 콘텐츠 슬롯 */}
        <div style={contentStyle}>
          {children}
        </div>
      </div>
    </div>
  )
}
