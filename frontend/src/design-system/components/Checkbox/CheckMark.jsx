/**
 * CheckMark 컴포넌트
 *
 * Props:
 *  checked          — true | false                기본: false
 *  size             — 'medium' | 'small'          기본: 'medium'
 *                     medium: 체크 아이콘 24px
 *                     small:  체크 아이콘 20px
 *  tight            — true | false  좌우 클리핑 축소  기본: false
 *  disabled         — true | false                기본: false
 *  label            — 라벨 텍스트. 없으면 숨김
 *  forceInteraction — 'normal' | 'hovered' | 'focused' | 'pressed'
 *                     쇼케이스용 강제 인터랙션 상태. 미설정 시 실제 이벤트로 결정.
 *  onChange         — 클릭/변경 핸들러 () => void
 *  className        — 추가 클래스
 *
 * 사용 예:
 *  <CheckMark label="하위 항목" onChange={toggle} />
 *  <CheckMark checked label="선택된 하위 항목" />
 *  <CheckMark size="small" label="소형" />
 */

import { useState } from 'react'
import Icon from '../Icon/Icon'

const ICON_SIZE = {
  medium: 24,
  small:  20,
}

const TIGHT_ICON_WIDTH = {
  medium: 20,
  small:  16,
}

const OVERLAY_OPACITY = {
  normal:  0,
  hovered: 0.05,
  focused: 0.08,
  pressed: 0.12,
}

export default function CheckMark({
  checked          = false,
  size             = 'medium',
  tight            = false,
  disabled         = false,
  label            = '',
  forceInteraction = undefined,
  onChange         = null,
  className        = '',
}) {
  const [interactionState, setInteractionState] = useState('normal')

  const effectiveInteraction = disabled ? 'normal' : (forceInteraction ?? interactionState)

  const iconPx = ICON_SIZE[size]

  const wrapperStyle = {
    display:    'flex',
    gap:        'var(--spacing-4)',
    alignItems: 'flex-start',
    cursor:     disabled ? 'not-allowed' : 'pointer',
    opacity:    disabled ? 0.4 : 1,
    userSelect: 'none',
  }

  const controlStyle = {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    position:       'relative',
    flexShrink:     0,
    ...(tight && {
      width:    `${TIGHT_ICON_WIDTH[size]}px`,
      overflow: 'hidden',
    }),
  }

  const overlayStyle = {
    position:        'absolute',
    top:             '-4px',
    bottom:          '-4px',
    left:            tight ? '-6px' : '-4px',
    right:           tight ? '-6px' : '-4px',
    borderRadius:    'var(--radius-full)',
    backgroundColor: 'var(--color-label-normal)',
    opacity:         OVERLAY_OPACITY[effectiveInteraction] ?? 0,
    pointerEvents:   'none',
  }

  const labelStyle = {
    fontSize:      size === 'small' ? 'var(--font-size-label-1)'          : 'var(--font-size-body-2)',
    lineHeight:    size === 'small' ? 'var(--line-height-label-1-normal)'  : 'var(--line-height-body-2-normal)',
    letterSpacing: size === 'small' ? 'var(--letter-spacing-label-1)'     : 'var(--letter-spacing-body-2)',
    fontWeight:    'var(--font-weight-regular)',
    color:         (!disabled && checked)
      ? 'var(--color-label-normal)'
      : 'var(--color-label-alternative)',
    whiteSpace:    'pre-line',
    paddingTop:    '1px',
    paddingBottom: '1px',
  }

  const handleClick = () => {
    if (!disabled && onChange) onChange()
  }

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleClick()
    }
  }

  const handleMouseEnter = () => { if (!disabled) setInteractionState('hovered') }
  const handleMouseLeave = () => { if (!disabled) setInteractionState('normal') }
  const handleFocus      = () => { if (!disabled) setInteractionState('focused') }
  const handleBlur       = () => { if (!disabled) setInteractionState('normal') }
  const handleMouseDown  = () => { if (!disabled) setInteractionState('pressed') }
  const handleMouseUp    = () => { if (!disabled) setInteractionState('hovered') }

  return (
    <div
      style={wrapperStyle}
      className={className}
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div style={controlStyle}>
        <Icon
          name="check"
          size={iconPx}
          color={checked
            ? 'var(--color-primary-normal)'
            : 'var(--color-label-assistive)'
          }
        />
        <div style={overlayStyle} />
      </div>

      {label && (
        <span style={labelStyle}>{label}</span>
      )}
    </div>
  )
}
