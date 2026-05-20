/**
 * Radio 컴포넌트
 *
 * Props:
 *  checked          — true | false                기본: false
 *  size             — 'medium' | 'small'          기본: 'medium'
 *                     medium: 박스 20×20px (터치 영역 24×24px)
 *                     small:  박스 16×16px (터치 영역 20×20px)
 *  tight            — true | false  좌우 padding 축소  기본: false
 *  disabled         — true | false                기본: false
 *  label            — 라벨 텍스트. 없으면 숨김
 *  forceInteraction — 'normal' | 'hovered' | 'focused' | 'pressed'
 *                     쇼케이스용 강제 인터랙션 상태. 미설정 시 실제 이벤트로 결정.
 *  onChange         — 클릭/변경 핸들러 () => void
 *  className        — 추가 클래스
 *
 * 사용 예:
 *  <Radio label="옵션 A" onChange={() => setSelected('A')} />
 *  <Radio checked label="선택된 옵션" />
 *  <Radio size="small" label="소형 라디오" />
 *  <Radio disabled label="비활성" />
 *
 * 그룹 사용 예:
 *  {options.map(opt => (
 *    <Radio
 *      key={opt.value}
 *      checked={selected === opt.value}
 *      label={opt.label}
 *      onChange={() => setSelected(opt.value)}
 *    />
 *  ))}
 */

import { useState } from 'react'

const BOX_SIZE = {
  medium: 20,
  small:  16,
}

const DOT_SIZE = {
  medium: 8,
  small:  6,
}

const OVERLAY_OPACITY = {
  normal:  0,
  hovered: 0.05,
  focused: 0.08,
  pressed: 0.12,
}

export default function Radio({
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

  const boxPx = BOX_SIZE[size]
  const dotPx = DOT_SIZE[size]

  const padV = '2px'
  const padH = size === 'small'
    ? (tight ? '0px' : '2px')
    : (tight ? '1px' : '2px')

  const wrapperStyle = {
    display:    'flex',
    gap:        'var(--spacing-8)',
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
    padding:        `${padV} ${padH}`,
    position:       'relative',
    flexShrink:     0,
  }

  const boxStyle = {
    width:           `${boxPx}px`,
    height:          `${boxPx}px`,
    borderRadius:    'var(--radius-full)',
    border:          `1.5px solid ${checked ? 'var(--color-primary-normal)' : 'var(--color-line-normal)'}`,
    backgroundColor: checked ? 'var(--color-primary-normal)' : 'transparent',
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
    boxSizing:       'border-box',
    padding:         checked ? '2px' : 0,
  }

  const dotStyle = {
    width:           `${dotPx}px`,
    height:          `${dotPx}px`,
    borderRadius:    'var(--radius-full)',
    backgroundColor: 'var(--color-static-white)',
    flexShrink:      0,
  }

  const overlayStyle = {
    position:        'absolute',
    top:             tight ? '-5px' : '-4px',
    right:           tight ? '-7px' : '-4px',
    bottom:          tight ? '-5px' : '-4px',
    left:            tight ? '-7px' : '-4px',
    borderRadius:    'var(--radius-full)',
    backgroundColor: 'var(--color-label-normal)',
    opacity:         OVERLAY_OPACITY[effectiveInteraction] ?? 0,
    pointerEvents:   'none',
  }

  const labelStyle = {
    flex:          '1 0 0',
    fontSize:      'var(--font-size-body-2)',
    fontWeight:    'var(--font-weight-regular)',
    lineHeight:    'var(--line-height-body-2-normal)',
    letterSpacing: 'var(--letter-spacing-body-2)',
    color:         'var(--color-label-normal)',
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
      role="radio"
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
        <div style={boxStyle}>
          {checked && <div style={dotStyle} />}
        </div>
        <div style={overlayStyle} />
      </div>

      {label && (
        <div style={{ flex: '1 0 0', display: 'flex', alignItems: 'flex-start', minWidth: 0 }}>
          <span style={labelStyle}>{label}</span>
        </div>
      )}
    </div>
  )
}
