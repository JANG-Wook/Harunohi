/**
 * Tab 컴포넌트
 *
 * 탭 네비게이션 바입니다.
 *
 * Props:
 *  items            — Array<{ label: string, icon?: ReactNode }>  탭 항목
 *  value            — 활성 탭 인덱스                              기본: 0
 *  onChange         — (index: number) => void
 *  size             — 'small' | 'medium' | 'large'                기본: 'medium'
 *                     small=40px, medium=48px, large=56px
 *  resize           — 'hug' | 'fill'                              기본: 'hug'
 *                     hug: 탭 자연 너비, fill: 탭 균등 분할
 *  horizontalPadding — true | false  좌우 패딩 추가               기본: false
 *  trailingContent  — ReactNode  우측 고정 영역
 *  scroll           — true | false  가로 스크롤                     기본: false
 *  className        — 추가 클래스
 *
 * 사용 예:
 *  <Tab items={[{label:'홈'},{label:'탐색'}]} value={0} onChange={setTab} />
 *  <Tab items={tabs} value={tab} onChange={setTab} size="large" resize="fill" />
 *  <Tab items={tabs} value={tab} onChange={setTab} horizontalPadding trailingContent={<Icon />} />
 *  <Tab items={tabs} value={tab} onChange={setTab} scroll />
 */

import { useState } from 'react'
import './Tab.css'

const SIZE_HEIGHT = {
  small:  40,
  medium: 48,
  large:  56,
}

/* ── 인터랙션 오버레이 opacity ───────────────────────────────── */
const OVERLAY_OPACITY = { hovered: 0.05, pressed: 0.12 }

/* ── 사이즈별 오버레이 border-radius (SegmentedControl knobRadius 기준) ── */
const KNOB_RADIUS = {
  small:  'var(--spacing-6)',
  medium: 'var(--spacing-8)',
  large:  'var(--spacing-10)',
}

const SIZE_FONT = {
  small:  { fontSize: 'var(--font-size-body-2)',     lineHeight: 'var(--line-height-body-2-normal)',   letterSpacing: 'var(--letter-spacing-body-2)'    },
  medium: { fontSize: 'var(--font-size-headline-2)', lineHeight: 'var(--line-height-headline-2)',      letterSpacing: 'var(--letter-spacing-headline-2)' },
  large:  { fontSize: 'var(--font-size-heading-2)',  lineHeight: 'var(--line-height-heading-2)',       letterSpacing: 'var(--letter-spacing-heading-2)'  },
}

/* ── 개별 탭 아이템 (독립적인 인터랙션 상태) ─────────────────── */
function TabItem({ item, isActive, size, resize, onChange }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const overlayOpacity = isPressed ? OVERLAY_OPACITY.pressed
    : isHovered                    ? OVERLAY_OPACITY.hovered
    : 0

  const tabStyle = {
    position:       'relative',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            'var(--spacing-10)',
    height:         '100%',
    minWidth:       'var(--spacing-32)',
    flex:           resize === 'fill' ? 1 : undefined,
    cursor:         onChange ? 'pointer' : 'default',
    background:     'none',
    border:         'none',
    padding:        `var(--spacing-12) var(--spacing-8)`,
    boxSizing:      'border-box',
    userSelect:     'none',
    outline:        'none',
    WebkitTapHighlightColor: 'transparent',
  }

  const overlayStyle = {
    position:        'absolute',
    top:             'var(--spacing-4)',
    bottom:          'var(--spacing-4)',
    left:            0,
    right:           0,
    borderRadius:    KNOB_RADIUS[size] ?? KNOB_RADIUS.medium,
    backgroundColor: `color-mix(in srgb, var(--color-label-normal) ${Math.round(overlayOpacity * 100)}%, transparent)`,
    pointerEvents:   'none',
    transition:      'background-color 0.15s ease',
  }

  const labelStyle = {
    ...SIZE_FONT[size] ?? SIZE_FONT.medium,
    fontWeight:          'var(--font-weight-semibold)',
    fontFeatureSettings: "'ss10' 1",
    color:               isActive
      ? 'var(--color-label-strong)'
      : 'var(--color-label-assistive)',
    whiteSpace:          'nowrap',
  }

  const indicatorStyle = {
    position:        'absolute',
    left:            0,
    right:           0,
    bottom:          0,
    height:          'var(--spacing-2)',
    backgroundColor: 'var(--color-label-strong)',
    zIndex:          1,
  }

  return (
    <button
      role="tab"
      aria-selected={isActive}
      style={tabStyle}
      onClick={() => onChange?.(item._index)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false) }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onBlur={() => setIsPressed(false)}
    >
      <div style={overlayStyle} aria-hidden="true" />

      {item.icon && (
        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, position: 'relative' }}>
          {item.icon}
        </span>
      )}
      <span style={{ ...labelStyle, position: 'relative' }}>{item.label}</span>

      {isActive && <div style={indicatorStyle} aria-hidden="true" />}
    </button>
  )
}

export default function Tab({
  items            = [],
  value            = 0,
  onChange,
  size             = 'medium',
  resize           = 'hug',
  horizontalPadding = false,
  trailingContent,
  scroll           = false,
  className        = '',
}) {
  const height = SIZE_HEIGHT[size] ?? 48

  const outerStyle = {
    position:     'relative',
    display:      'flex',
    flexDirection:'row',
    alignItems:   'stretch',
    width:        '100%',
    height:       `${height}px`,
    overflow:     scroll ? undefined : 'hidden',
    paddingLeft:  horizontalPadding ? 'var(--spacing-20)' : undefined,
    paddingRight: horizontalPadding ? 'var(--spacing-20)' : undefined,
    boxSizing:    'border-box',
  }

  const dividerStyle = {
    position:        'absolute',
    left:            0,
    right:           0,
    bottom:          0,
    height:          'var(--spacing-1)',
    backgroundColor: 'var(--color-line-alternative)',
  }

  const listStyle = {
    display:          'flex',
    flexDirection:    'row',
    alignItems:       'stretch',
    flex:             1,
    minWidth:         0,
    gap:              resize === 'fill' ? 0 : 'var(--spacing-24)',
    overflowX:        scroll ? 'auto' : undefined,
    scrollbarWidth:   scroll ? 'none' : undefined,
    msOverflowStyle:  scroll ? 'none' : undefined,
  }

  return (
    <div style={outerStyle} className={className} role="tablist">
      <div style={dividerStyle} aria-hidden="true" />

      <div style={listStyle} className={scroll ? 'ax-tab-scroll' : undefined}>
        {items.map((item, index) => (
          <TabItem
            key={index}
            item={{ ...item, _index: index }}
            isActive={index === value}
            size={size}
            resize={resize}
            onChange={onChange}
          />
        ))}
      </div>

      {trailingContent && (
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {trailingContent}
        </div>
      )}
    </div>
  )
}
