/**
 * Switch 컴포넌트
 *
 * Props:
 *  active    — true | false              기본: false
 *  size      — 'medium' | 'small'        기본: 'medium'
 *              medium: 트랙 52×32px, 썸 24×24px
 *              small:  트랙 39×24px, 썸 18×18px
 *  platform  — 'normal' | 'ios'          기본: 'normal'
 *  disabled  — true | false              기본: false
 *  onChange  — 토글 핸들러 () => void
 *  className — 추가 클래스
 */

const SIZES = {
  medium: { trackW: 52, trackH: 32, thumb: 24, pad: 4 },
  small:  { trackW: 39, trackH: 24, thumb: 18, pad: 3 },
}

export default function Switch({
  active    = false,
  size      = 'medium',
  platform  = 'normal',
  disabled  = false,
  onChange  = null,
  className = '',
}) {
  const { trackW, trackH, thumb, pad } = SIZES[size]

  const travel = trackW - thumb - pad * 2

  const trackStyle = {
    position:        'relative',
    width:           `${trackW}px`,
    height:          `${trackH}px`,
    borderRadius:    '100px',
    backgroundColor: active
      ? 'var(--color-primary-normal)'
      : 'var(--color-fill-strong)',
    padding:         `${pad}px`,
    boxSizing:       'border-box',
    flexShrink:      0,
    transition:      'background-color 0.2s ease',
    cursor:          disabled ? 'not-allowed' : 'pointer',
    opacity:         disabled ? 0.4 : 1,
  }

  const thumbStyle = {
    position:        'absolute',
    top:             `${pad}px`,
    left:            `${pad}px`,
    width:           `${thumb}px`,
    height:          `${thumb}px`,
    borderRadius:    'var(--radius-full)',
    backgroundColor: 'var(--color-static-white)',
    transform:       active ? `translateX(${travel}px)` : 'translateX(0)',
    transition:      'transform 0.2s ease',
    boxShadow:       platform === 'ios'
      ? 'var(--shadow-switch-ios-knob)'
      : 'var(--shadow-normal-xsmall)',
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

  return (
    <div
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      className={className}
    >
      <button
        type="button"
        role="switch"
        aria-checked={active}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        style={{
          background:     'none',
          border:         'none',
          padding:        0,
          cursor:         disabled ? 'not-allowed' : 'pointer',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
        }}
      >
        <div style={trackStyle}>
          <div style={thumbStyle} />
        </div>
      </button>
    </div>
  )
}
