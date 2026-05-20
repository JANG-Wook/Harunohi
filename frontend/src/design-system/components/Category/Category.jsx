/**
 * Category 컴포넌트
 *
 * 정보를 특정 주제나 그룹으로 나누어 구분하고 접근할 수 있는 칩 네비게이션입니다.
 *
 * Props:
 *  items            — Array<{ label: string, icon?: ReactNode }>  칩 항목
 *  value            — 활성 칩 인덱스                              기본: 0
 *  onChange         — (index: number) => void
 *  variant          — 'normal' | 'alternative'                    기본: 'normal'
 *                     normal:      활성 칩 검정 배경
 *                     alternative: 활성 칩 primary 컬러
 *  size             — 'small' | 'medium' | 'large' | 'xlarge'     기본: 'medium'
 *                     small=24px, medium=32px, large=36px, xlarge=40px
 *  scroll           — true | false  가로 스크롤 활성화             기본: false
 *  horizontalPadding — true | false  좌우 20px 패딩               기본: false
 *  verticalPadding  — true | false  상하 8px 스페이서             기본: false
 *  trailingContent  — ReactNode  우측 고정 영역
 *  className        — 추가 클래스
 *
 * 사용 예:
 *  <Category items={[{label:'전체'},{label:'인기'}]} value={0} onChange={setTab} />
 *  <Category items={tabs} value={tab} onChange={setTab} variant="alternative" size="large" />
 *  <Category items={tabs} value={tab} onChange={setTab} scroll horizontalPadding />
 */

import { useState } from 'react'
import './Category.css'

const CHIP_PADDING_Y = {
  small:  'var(--spacing-2)',
  medium: 'var(--spacing-6)',
  large:  'var(--spacing-8)',
  xlarge: 'var(--spacing-10)',
}

/* ── 인터랙션 오버레이 opacity ───────────────────────────────── */
const OVERLAY_OPACITY = { hovered: 0.05, focused: 0.08, pressed: 0.12 }

function ChipItem({ label, icon, isActive, isAlternative, paddingY, onClick }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const overlayOpacity = isPressed ? OVERLAY_OPACITY.pressed
    : isFocused                    ? OVERLAY_OPACITY.focused
    : isHovered                    ? OVERLAY_OPACITY.hovered
    : 0
  const overlayColor = (isActive && isAlternative)
    ? 'var(--color-primary-normal)'
    : 'var(--color-label-normal)'

  const chipStyle = {
    position:      'relative',
    overflow:      'clip',
    display:       'flex',
    alignItems:    'center',
    gap:           'var(--spacing-2)',
    paddingTop:    paddingY,
    paddingBottom: paddingY,
    paddingLeft:   'var(--spacing-8)',
    paddingRight:  'var(--spacing-8)',
    borderRadius:  'var(--spacing-8)',
    flexShrink:    0,
    cursor:        onClick ? 'pointer' : 'default',
    background:    'none',
    border:        'none',
    boxSizing:     'border-box',
    userSelect:    'none',
    outline:       'none',
    WebkitTapHighlightColor: 'transparent',
  }

  const overlayStyle = {
    position:        'absolute',
    inset:           0,
    backgroundColor: `color-mix(in srgb, ${overlayColor} ${Math.round(overlayOpacity * 100)}%, transparent)`,
    pointerEvents:   'none',
    transition:      'background-color 0.15s ease',
    zIndex:          2,
  }

  const labelStyle = {
    fontSize:            'var(--font-size-label-1)',
    lineHeight:          'var(--line-height-label-1-normal)',
    fontWeight:          'var(--font-weight-medium)',
    letterSpacing:       'var(--letter-spacing-label-1)',
    whiteSpace:          'nowrap',
    position:            'relative',
    zIndex:              1,
    fontFeatureSettings: "'ss10' 1",
    color: isActive
      ? (isAlternative ? 'var(--color-primary-normal)' : 'var(--color-inverse-label)')
      : 'var(--color-label-alternative)',
  }

  return (
    <button
      style={chipStyle}
      onClick={onClick}
      aria-pressed={isActive}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false) }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => { setIsFocused(false); setIsPressed(false) }}
    >
      {/* 활성 배경 레이어 */}
      {isActive && !isAlternative && (
        <div style={{
          position:        'absolute',
          inset:           0,
          borderRadius:    'var(--spacing-8)',
          backgroundColor: 'var(--color-label-strong)',
        }} aria-hidden="true" />
      )}
      {isActive && isAlternative && (
        <>
          <div style={{
            position:        'absolute',
            inset:           0,
            borderRadius:    'var(--spacing-8)',
            backgroundColor: 'var(--color-primary-normal)',
            opacity:         0.05,
          }} aria-hidden="true" />
          <div style={{
            position:     'absolute',
            inset:        0,
            borderRadius: 'var(--spacing-8)',
            border:       '1px solid var(--color-primary-normal)',
            opacity:      0.43,
            boxSizing:    'border-box',
          }} aria-hidden="true" />
        </>
      )}

      {/* 비활성 테두리 */}
      {!isActive && (
        <div style={{
          position:     'absolute',
          inset:        0,
          borderRadius: 'var(--spacing-8)',
          border:       '1px solid var(--color-line-neutral)',
          boxSizing:    'border-box',
        }} aria-hidden="true" />
      )}

      {/* 인터랙션 오버레이 */}
      <div style={overlayStyle} aria-hidden="true" />

      {icon && (
        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, position: 'relative', zIndex: 1 }}>
          {icon}
        </span>
      )}
      <span style={labelStyle}>{label}</span>
    </button>
  )
}

export default function Category({
  items             = [],
  value             = 0,
  onChange,
  variant           = 'normal',
  size              = 'medium',
  scroll            = false,
  horizontalPadding = false,
  verticalPadding   = false,
  trailingContent,
  className         = '',
}) {
  const isAlternative = variant === 'alternative'
  const paddingY      = CHIP_PADDING_Y[size] ?? 'var(--spacing-6)'

  const outerStyle = {
    display:       'flex',
    flexDirection: 'row',
    alignItems:    'center',
    overflow:      'clip',
    width:         '100%',
    paddingLeft:   horizontalPadding ? 'var(--spacing-20)' : undefined,
    paddingRight:  horizontalPadding ? 'var(--spacing-20)' : undefined,
    boxSizing:     'border-box',
    gap:           'var(--spacing-20)',
  }

  const leadingStyle = {
    display:       'flex',
    flexDirection: 'row',
    alignItems:    'center',
    flex:          '1 0 0',
    minWidth:      0,
    overflowX:     scroll ? 'auto' : undefined,
    overflowY:     scroll ? 'hidden' : undefined,
    overflow:      scroll ? undefined : 'clip',
  }

  const wrapperStyle = {
    display:       'flex',
    flexDirection: 'row',
    alignItems:    'center',
    gap:           'var(--spacing-6)',
    flexShrink:    0,
    paddingTop:    verticalPadding ? 'var(--spacing-8)' : undefined,
    paddingBottom: verticalPadding ? 'var(--spacing-8)' : undefined,
  }

  return (
    <div style={outerStyle} className={className}>
      <div style={leadingStyle} className={scroll ? 'ax-category-scroll' : undefined}>
        <div style={wrapperStyle}>
          {items.map((item, index) => (
            <ChipItem
              key={index}
              label={item.label}
              icon={item.icon}
              isActive={index === value}
              isAlternative={isAlternative}
              paddingY={paddingY}
              onClick={() => onChange?.(index)}
            />
          ))}
        </div>
      </div>

      {trailingContent && (
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {trailingContent}
        </div>
      )}
    </div>
  )
}
