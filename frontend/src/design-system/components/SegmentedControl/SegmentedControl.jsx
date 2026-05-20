/**
 * SegmentedControl 컴포넌트
 *
 * 여러 옵션 중 하나를 선택할 수 있으며, 선택된 항목을 화면에 표시합니다.
 *
 * Props:
 *  variant   — 'solid' | 'outlined'           기본: 'solid'
 *              solid:    채워진 배경 트랙, 활성 세그먼트는 흰 카드 knob
 *              outlined: 테두리 트랙, 활성 세그먼트는 primary 색조 하이라이트
 *  size      — 'large' | 'medium' | 'small'   기본: 'large'
 *              large:  트랙 48px, track-radius 12px
 *              medium: 트랙 40px, track-radius 10px
 *              small:  트랙 32px, track-radius 8px
 *  items     — Array<{ label: string, icon?: string }>   2~6개
 *  value     — 활성 세그먼트 인덱스 (0-based)
 *  onChange  — (index: number) => void
 *  className — 추가 클래스
 *
 * 사용 예:
 *  <SegmentedControl
 *    items={[{ label: '전체' }, { label: '진행 중' }, { label: '완료' }]}
 *    value={selected}
 *    onChange={setSelected}
 *  />
 *  <SegmentedControl variant="outlined" size="medium" items={[...]} value={0} onChange={fn} />
 *  <SegmentedControl items={[{ label: '홈', icon: 'home' }, { label: '검색', icon: 'search' }]} value={0} onChange={fn} />
 */

import { useState } from 'react'
import Icon from '../Icon/Icon'

const SIZES = {
  large: {
    trackH:      48,
    trackPad:    3,
    trackRadius: 12,
    knobRadius:  10,
    segPad:      9,
    iconSize:    20,
    fontSize:      'var(--font-size-headline-2)',
    fontWeight:    'var(--font-weight-medium)',
    lineHeight:    'var(--line-height-headline-2)',
    letterSpacing: 'var(--letter-spacing-headline-2)',
  },
  medium: {
    trackH:      40,
    trackPad:    2,
    trackRadius: 10,
    knobRadius:  8,
    segPad:      9,
    iconSize:    18,
    fontSize:      'var(--font-size-body-2)',
    fontWeight:    'var(--font-weight-medium)',
    lineHeight:    'var(--line-height-body-2-normal)',
    letterSpacing: 'var(--letter-spacing-body-2)',
  },
  small: {
    trackH:      32,
    trackPad:    2,
    trackRadius: 8,
    knobRadius:  6,
    segPad:      9,
    iconSize:    16,
    fontSize:      'var(--font-size-label-2)',
    fontWeight:    'var(--font-weight-medium)',
    lineHeight:    'var(--line-height-label-2)',
    letterSpacing: 'var(--letter-spacing-label-2)',
  },
}

/* ── 인터랙션 오버레이 opacity ───────────────────────────────── */
const OVERLAY_OPACITY = { hovered: 0.05, focused: 0.08, pressed: 0.12 }

/* ── 개별 세그먼트 아이템 ────────────────────────────────────── */
function SegmentItem({
  item, idx, isActive, isFirst, isLast,
  isSolid, isOutlined,
  trackRadius, knobRadius, segPad, iconSize,
  fontSize, fontWeight, lineHeight, letterSpacing,
  onChange,
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const overlayOpacity = isPressed ? OVERLAY_OPACITY.pressed
    : isFocused                    ? OVERLAY_OPACITY.focused
    : isHovered                    ? OVERLAY_OPACITY.hovered
    : 0
  const overlayColor = (isOutlined && isActive)
    ? 'var(--color-primary-normal)'
    : 'var(--color-label-normal)'

  const handleClick = () => onChange?.(idx)
  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleClick()
    }
  }

  // outlined: position 기반 border-radius. container의 overflow:hidden이 외곽 클리핑 처리
  const outlinedActiveRadius = isFirst
    ? `${trackRadius}px 0 0 ${trackRadius}px`
    : isLast
    ? `0 ${trackRadius}px ${trackRadius}px 0`
    : '0'

  const segWrapStyle = {
    flex:           '1 0 0',
    height:         '100%',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    position:       'relative',
    cursor:         'pointer',
    userSelect:     'none',
    outline:        'none',
  }

  const segInnerStyle = {
    flex:           '1 0 0',
    height:         '100%',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    padding:        `${segPad}px`,
    position:       'relative',
    minWidth:       0,
  }

  const overlayStyle = {
    position:        'absolute',
    inset:           0,
    // solid: knob 모서리 맞춤 / outlined: 0으로 두고 container가 외곽 클리핑
    borderRadius:    isSolid ? `${knobRadius}px` : 0,
    backgroundColor: `color-mix(in srgb, ${overlayColor} ${Math.round(overlayOpacity * 100)}%, transparent)`,
    pointerEvents:   'none',
    transition:      'background-color 0.15s ease',
    zIndex:          2,
  }

  const textStyle = {
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
    color:        isActive
      ? (isSolid ? 'var(--color-label-normal)' : 'var(--color-primary-normal)')
      : 'var(--color-label-alternative)',
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    whiteSpace:   'nowrap',
    position:     'relative',
    zIndex:       1,
  }

  return (
    <div
      style={segWrapStyle}
      role="tab"
      aria-selected={isActive}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false) }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onFocus={(e) => setIsFocused(e.target.matches(':focus-visible'))}
      onBlur={() => { setIsFocused(false); setIsPressed(false) }}
    >
      <div style={segInnerStyle}>

        {/* ── Solid: 활성 knob 배경 ── */}
        {isSolid && isActive && (
          <div
            aria-hidden="true"
            style={{
              position:        'absolute',
              inset:           0,
              backgroundColor: 'var(--color-bg-elevated)',
              borderRadius:    `${knobRadius}px`,
              boxShadow:       'var(--shadow-segment-knob)',
              zIndex:          1,
            }}
          />
        )}

        {/* ── Outlined: 활성 하이라이트 배경 ── */}
        {isOutlined && isActive && (
          <>
            <div
              aria-hidden="true"
              style={{
                position:        'absolute',
                inset:           0,
                backgroundColor: 'var(--color-primary-normal)',
                opacity:         0.05,
                borderRadius:    outlinedActiveRadius,
                zIndex:          1,
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position:     'absolute',
                inset:        0,
                border:       '1px solid var(--color-primary-normal)',
                opacity:      0.43,
                borderRadius: outlinedActiveRadius,
                zIndex:       1,
              }}
            />
          </>
        )}

        {/* ── Outlined: 비활성 세그먼트 우측 구분선 (마지막 제외) ── */}
        {isOutlined && !isActive && !isLast && (
          <div
            aria-hidden="true"
            style={{
              position:      'absolute',
              top:           'var(--spacing-1)',
              bottom:        'var(--spacing-1)',
              right:         0,
              left:          0,
              borderRight:   '1px solid var(--color-line-normal)',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* 인터랙션 오버레이 */}
        <div style={overlayStyle} aria-hidden="true" />

        {/* ── 컨텐츠: 아이콘 + 텍스트 ── */}
        <div
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            'var(--spacing-4)',
            position:       'relative',
            zIndex:         3,
            flex:           '1 0 0',
            minWidth:       0,
            overflow:       'hidden',
          }}
        >
          {item.icon && (
            <Icon
              name={item.icon}
              size={iconSize}
              color={isActive
                ? (isSolid ? 'var(--color-label-normal)' : 'var(--color-primary-normal)')
                : 'var(--color-label-alternative)'
              }
            />
          )}
          {item.label && (
            <span style={textStyle}>{item.label}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SegmentedControl({
  variant   = 'solid',
  size      = 'large',
  items     = [],
  value     = 0,
  onChange  = null,
  className = '',
}) {
  const {
    trackH, trackPad, trackRadius, knobRadius, segPad, iconSize,
    fontSize, fontWeight, lineHeight, letterSpacing,
  } = SIZES[size] ?? SIZES.large

  const isSolid    = variant === 'solid'
  const isOutlined = variant === 'outlined'

  const trackStyle = {
    display:      'flex',
    alignItems:   'center',
    height:       `${trackH}px`,
    width:        '100%',
    boxSizing:    'border-box',
    borderRadius: `${trackRadius}px`,
    position:     'relative',
    flexShrink:   0,
    ...(isSolid && {
      backgroundColor: 'var(--color-fill-normal)',
      padding:         `${trackPad}px`,
    }),
    ...(isOutlined && {
      // border는 외부 overlay로 분리. container는 overflow:hidden만 담당
      overflow: 'hidden',
    }),
  }

  return (
    <div
      className={className}
      role="tablist"
      style={{ display: 'flex', flexDirection: 'column', width: '100%', position: 'relative' }}
    >
      {/* outlined: gray border를 overlay로 분리 → container가 full-size로 채워져 active blue border와 크기 일치 */}
      {isOutlined && (
        <div
          aria-hidden="true"
          style={{
            position:      'absolute',
            inset:         0,
            border:        '1px solid var(--color-line-normal)',
            borderRadius:  `${trackRadius}px`,
            pointerEvents: 'none',
            zIndex:        10,
          }}
        />
      )}
      <div style={trackStyle}>
        {items.map((item, idx) => (
          <SegmentItem
            key={idx}
            item={item}
            idx={idx}
            isActive={idx === value}
            isFirst={idx === 0}
            isLast={idx === items.length - 1}
            isSolid={isSolid}
            isOutlined={isOutlined}
            trackRadius={trackRadius}
            knobRadius={knobRadius}
            segPad={segPad}
            iconSize={iconSize}
            fontSize={fontSize}
            fontWeight={fontWeight}
            lineHeight={lineHeight}
            letterSpacing={letterSpacing}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  )
}
