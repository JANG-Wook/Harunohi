/**
 * Menu 컴포넌트
 *
 * 선택 가능한 행동을 나열하는 드롭다운/컨텍스트 메뉴입니다.
 *
 * Props:
 *  items        — Array<Item>
 *                 Item: {
 *                   type?:     'item' | 'title'   기본: 'item'
 *                   label:     string
 *                   caption?:  string              보조 텍스트
 *                   active?:   boolean             활성 상태
 *                   disabled?: boolean             비활성 상태
 *                   onClick?:  () => void
 *                 }
 *  variant      — 'normal' | 'radio' | 'checkbox' 기본: 'normal'
 *  cellPadding  — '8px' | '12px'                  기본: '8px' (셀 상하 패딩)
 *  actionArea   — { leadingLabel, onLeadingAction,
 *                   trailingLabel, onTrailingAction } | null
 *  scrollable   — boolean                         기본: false
 *  className    — 추가 클래스
 *
 * 사용 예:
 *  <Menu
 *    items={[
 *      { label: '복사', onClick: handleCopy },
 *      { label: '붙여넣기', onClick: handlePaste },
 *      { label: '삭제', disabled: true },
 *    ]}
 *  />
 *  <Menu
 *    variant="checkbox"
 *    cellPadding="12px"
 *    items={[
 *      { label: '옵션 1', active: true },
 *      { label: '옵션 2', caption: '부제목' },
 *    ]}
 *    actionArea={{ leadingLabel: '초기화', onLeadingAction: fn, trailingLabel: '적용', onTrailingAction: fn }}
 *  />
 */

/* ── Checkbox 인디케이터 SVG (20×20) ────────────────────────── */
function CheckboxOff() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <rect x="1" y="1" width="18" height="18" rx="5" stroke="var(--color-line-normal)" strokeWidth="1.5" />
    </svg>
  )
}

function CheckboxOn() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <rect width="20" height="20" rx="5" fill="var(--color-primary-normal)" />
      <path d="M5 10L8.5 13.5L15 7" stroke="var(--color-static-white)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckboxDisabled({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      {active
        ? <>
            <rect width="20" height="20" rx="5" fill="var(--color-label-disable)" />
            <path d="M5 10L8.5 13.5L15 7" stroke="var(--color-static-white)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </>
        : <rect x="1" y="1" width="18" height="18" rx="5" stroke="var(--color-label-disable)" strokeWidth="1.5" />
      }
    </svg>
  )
}

/* ── Radio 인디케이터 SVG (20×20) ───────────────────────────── */
function RadioOff() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="10" cy="10" r="9" stroke="var(--color-line-normal)" strokeWidth="1.5" />
    </svg>
  )
}

function RadioOn() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="10" cy="10" r="9" stroke="var(--color-primary-normal)" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="5" fill="var(--color-primary-normal)" />
    </svg>
  )
}

function RadioDisabled({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="10" cy="10" r="9" stroke="var(--color-label-disable)" strokeWidth="1.5" />
      {active && <circle cx="10" cy="10" r="5" fill="var(--color-label-disable)" />}
    </svg>
  )
}

import { useState, useRef, useEffect } from 'react'

/* ── 인터랙션 오버레이 opacity ───────────────────────────────── */
const OVERLAY_OPACITY = { hovered: 0.05, focused: 0.08, pressed: 0.12 }

/* ── Leading 인디케이터 선택 ─────────────────────────────────── */
function LeadingIndicator({ variant, active, disabled }) {
  if (variant === 'checkbox') {
    if (disabled) return <CheckboxDisabled active={active} />
    return active ? <CheckboxOn /> : <CheckboxOff />
  }
  if (variant === 'radio') {
    if (disabled) return <RadioDisabled active={active} />
    return active ? <RadioOn /> : <RadioOff />
  }
  return null
}

/* ── 단일 셀 ─────────────────────────────────────────────────── */
function MenuItem({ item, variant, cellPadding }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const isDisabled = !!item.disabled
  const isActive   = !!item.active

  const overlayOpacity = isDisabled ? 0
    : isPressed          ? OVERLAY_OPACITY.pressed
    : isFocused          ? OVERLAY_OPACITY.focused
    : isHovered          ? OVERLAY_OPACITY.hovered
    : 0

  const labelColor = isDisabled
    ? 'var(--color-label-disable)'
    : isActive
      ? 'var(--color-primary-normal)'
      : 'var(--color-label-normal)'

  const labelWeight = (isActive && !isDisabled)
    ? 'var(--font-weight-medium)'
    : 'var(--font-weight-regular)'

  const cellStyle = {
    display:  'flex',
    width:    '100%',
    position: 'relative',
  }

  const innerStyle = {
    display:       'flex',
    flex:          '1 0 0',
    flexDirection: 'column',
    alignItems:    'flex-start',
    minWidth:      0,
    position:      'relative',
  }

  const containerStyle = {
    display:       'flex',
    alignItems:    'center',
    paddingTop:    cellPadding,
    paddingBottom: cellPadding,
    width:         '100%',
    flexShrink:    0,
    position:      'relative',
  }

  const wrapperStyle = {
    display:    'flex',
    flex:       '1 0 0',
    gap:        'var(--spacing-8)',
    alignItems: 'flex-start',
    minWidth:   0,
    position:   'relative',
  }

  const contentWrapStyle = {
    display:    'flex',
    flex:       '1 0 0',
    alignItems: 'flex-start',
    minWidth:   0,
    position:   'relative',
  }

  const contentStyle = {
    display:       'flex',
    flex:          '1 0 0',
    flexDirection: 'column',
    gap:           'var(--spacing-4)',
    alignItems:    'flex-start',
    minWidth:      0,
    overflow:      'hidden',
    position:      'relative',
  }

  const labelStyle = {
    display:       'flex',
    alignItems:    'center',
    minHeight:     'var(--spacing-24)',
    width:         '100%',
    flexShrink:    0,
    position:      'relative',
  }

  const labelTextStyle = {
    flex:                '1 0 0',
    minWidth:            0,
    margin:              0,
    fontSize:            'var(--font-size-body-1)',
    lineHeight:          'var(--line-height-body-1-normal)',
    letterSpacing:       'var(--letter-spacing-body-1)',
    fontWeight:          labelWeight,
    fontFeatureSettings: "'ss10' 1",
    color:               labelColor,
    position:            'relative',
  }

  const captionStyle = {
    fontSize:            'var(--font-size-label-2)',
    lineHeight:          'var(--line-height-label-2)',
    letterSpacing:       'var(--letter-spacing-label-2)',
    fontWeight:          'var(--font-weight-regular)',
    fontFeatureSettings: "'ss10' 1",
    color:               isDisabled ? 'var(--color-label-disable)' : 'var(--color-label-alternative)',
    margin:              0,
    width:               '100%',
    flexShrink:          0,
    overflow:            'hidden',
    textOverflow:        'ellipsis',
    whiteSpace:          'nowrap',
    position:            'relative',
  }

  return (
    <div style={cellStyle}>
      {/* 인터랙션 오버레이 — 메뉴 카드 전체 너비로 확장 (20px padding 보상) */}
      <div
        aria-hidden="true"
        style={{
          position:      'absolute',
          top:           0,
          bottom:        0,
          left:          'calc(-1 * var(--spacing-20))',
          right:         'calc(-1 * var(--spacing-20))',
          padding:       '0 var(--spacing-8)',
          pointerEvents: 'none',
        }}
      >
        <div style={{
          width:           '100%',
          height:          '100%',
          backgroundColor: `color-mix(in srgb, var(--color-label-normal) ${Math.round(overlayOpacity * 100)}%, transparent)`,
          borderRadius:    'var(--spacing-12)',
          transition:      'background-color 0.15s ease',
        }} />
      </div>

      <div style={innerStyle}>
        <button
          style={{
            background: 'none',
            border:     'none',
            padding:    0,
            width:      '100%',
            textAlign:  'left',
            cursor:     isDisabled ? 'not-allowed' : 'pointer',
            position:   'relative',
          }}
          onClick={isDisabled ? undefined : item.onClick}
          disabled={isDisabled}
          aria-pressed={variant !== 'normal' ? isActive : undefined}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => { setIsHovered(false); setIsPressed(false) }}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => { setIsFocused(false); setIsPressed(false) }}
        >
          <div style={containerStyle}>
            <div style={wrapperStyle}>
              {/* leading indicator (checkbox/radio) */}
              {variant !== 'normal' && (
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', paddingTop: 'var(--spacing-2)', paddingBottom: 'var(--spacing-2)' }}>
                  <LeadingIndicator variant={variant} active={isActive} disabled={isDisabled} />
                </div>
              )}
              <div style={contentWrapStyle}>
                <div style={contentStyle}>
                  <div style={labelStyle}>
                    <p style={labelTextStyle}>{item.label}</p>
                  </div>
                  {item.caption && (
                    <p style={captionStyle}>{item.caption}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}

/* ── 타이틀 행 ───────────────────────────────────────────────── */
function MenuTitle({ label }) {
  return (
    <div style={{
      display:       'flex',
      alignItems:    'center',
      paddingTop:    'var(--spacing-8)',
      paddingBottom: 'var(--spacing-4)',
      width:         '100%',
      flexShrink:    0,
    }}>
      <p style={{
        fontSize:            'var(--font-size-label-2)',
        lineHeight:          'var(--line-height-label-2)',
        letterSpacing:       'var(--letter-spacing-label-2)',
        fontWeight:          'var(--font-weight-medium)',
        fontFeatureSettings: "'ss10' 1",
        color:               'var(--color-label-alternative)',
        margin:              0,
        flex:                '1 0 0',
        minWidth:            0,
      }}>
        {label}
      </p>
    </div>
  )
}

/* ── 커스텀 스크롤바 ─────────────────────────────────────────── */
function CustomScrollBar({ scrollRef }) {
  const [thumbTop,    setThumbTop]    = useState(0)
  const [thumbHeight, setThumbHeight] = useState(0)
  const [visible,     setVisible]     = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      if (scrollHeight <= clientHeight) { setVisible(false); return }
      setVisible(true)
      const trackHeight   = clientHeight - 16 // 8px inset top + bottom
      const ratio         = clientHeight / scrollHeight
      const newThumbH     = Math.max(Math.round(trackHeight * ratio), 20)
      const maxTop        = trackHeight - newThumbH
      const scrollRatio   = scrollTop / (scrollHeight - clientHeight)
      setThumbHeight(newThumbH)
      setThumbTop(Math.round(scrollRatio * maxTop))
    }

    update()
    el.addEventListener('scroll', update)
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', update); ro.disconnect() }
  }, [scrollRef])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position:      'absolute',
        top:           'var(--spacing-8)',
        bottom:        'var(--spacing-8)',
        right:         'var(--spacing-4)',
        width:         '3px',
        pointerEvents: 'none',
      }}
    >
      <div style={{
        position:        'absolute',
        top:             `${thumbTop}px`,
        left:            0,
        width:           '100%',
        height:          `${thumbHeight}px`,
        backgroundColor: 'var(--color-fill-strong)',
        borderRadius:    'var(--radius-full)',
      }} />
    </div>
  )
}

/* ── Action Area ─────────────────────────────────────────────── */
function ActionArea({ leadingLabel, onLeadingAction, trailingLabel, onTrailingAction }) {
  return (
    <div style={{
      display:          'flex',
      alignItems:       'center',
      gap:              'var(--spacing-24)',
      padding:          'var(--spacing-12)',
      borderTop:        '1px solid var(--color-line-alternative)',
      backgroundColor:  'var(--color-bg-elevated)',
      flexShrink:       0,
      width:            '100%',
      boxSizing:        'border-box',
    }}>
      {/* Leading: text button */}
      <div style={{ flex: '1 0 0', display: 'flex', alignItems: 'center', minWidth: 0 }}>
        <div style={{ paddingLeft: 'var(--spacing-8)', flexShrink: 0 }}>
          <button
            style={{
              background:    'none',
              border:        'none',
              cursor:        'pointer',
              paddingTop:    'var(--spacing-4)',
              paddingBottom: 'var(--spacing-4)',
              fontSize:            'var(--font-size-label-1)',
              lineHeight:          'var(--line-height-label-1-normal)',
              letterSpacing:       'var(--letter-spacing-label-1)',
              fontWeight:          'var(--font-weight-semibold)',
              fontFeatureSettings: "'ss10' 1",
              color:               'var(--color-label-alternative)',
              whiteSpace:          'nowrap',
            }}
            onClick={onLeadingAction}
          >
            {leadingLabel}
          </button>
        </div>
      </div>

      {/* Trailing: solid button */}
      <button
        style={{
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          paddingTop:      '7px',
          paddingBottom:   '7px',
          paddingLeft:     'var(--spacing-14)',
          paddingRight:    'var(--spacing-14)',
          borderRadius:    'var(--spacing-8)',
          border:          'none',
          cursor:          'pointer',
          backgroundColor: 'var(--color-primary-normal)',
          fontSize:            'var(--font-size-label-2)',
          lineHeight:          'var(--line-height-label-2)',
          letterSpacing:       'var(--letter-spacing-label-2)',
          fontWeight:          'var(--font-weight-semibold)',
          fontFeatureSettings: "'ss10' 1",
          color:               'var(--color-static-white)',
          whiteSpace:          'nowrap',
          flexShrink:      0,
          overflow:        'hidden',
        }}
        onClick={onTrailingAction}
      >
        {trailingLabel}
      </button>
    </div>
  )
}

/* ── 메인 컴포넌트 ──────────────────────────────────────────── */
export default function Menu({
  items       = [],
  variant     = 'normal',
  cellPadding = '8px',
  actionArea  = null,
  scrollable  = false,
  className   = '',
}) {
  const scrollRef = useRef(null)

  const containerStyle = {
    display:         'flex',
    flexDirection:   'column',
    alignItems:      'flex-start',
    minWidth:        '140px',
    maxWidth:        '320px',
    position:        'relative',
  }

  const innerStyle = {
    display:         'flex',
    flexDirection:   'column',
    alignItems:      'flex-start',
    width:           '100%',
    backgroundColor: 'var(--color-bg-elevated)',
    border:          '1px solid var(--color-line-solid-neutral)',
    borderRadius:    'var(--spacing-16)',
    overflow:        'hidden',
    boxShadow:       'var(--shadow-normal-small)',
    boxSizing:       'border-box',
  }

  const scrollWrapperStyle = {
    position: 'relative',
    width:    '100%',
  }

  const scrollAreaStyle = {
    display:          'flex',
    flexDirection:    'column',
    alignItems:       'flex-start',
    width:            '100%',
    paddingLeft:      'var(--spacing-20)',
    paddingRight:     'var(--spacing-20)',
    paddingTop:       'var(--spacing-8)',
    paddingBottom:    'var(--spacing-8)',
    overflowY:        scrollable ? 'auto' : 'visible',
    maxHeight:        scrollable ? '400px' : undefined,
    boxSizing:        'border-box',
    scrollbarWidth:   scrollable ? 'none' : undefined,
    msOverflowStyle:  scrollable ? 'none' : undefined,
  }

  const contentsStyle = {
    display:       'flex',
    flexDirection: 'column',
    gap:           'var(--spacing-4)',
    alignItems:    'flex-start',
    width:         '100%',
    flexShrink:    0,
  }

  return (
    <div style={containerStyle} className={className}>
      <div style={innerStyle}>
        <div style={scrollWrapperStyle}>
          <div ref={scrollRef} style={scrollAreaStyle}>
            <div style={contentsStyle}>
              {items.map((item, i) =>
                item.type === 'title'
                  ? <MenuTitle key={i} label={item.label} />
                  : (
                    <MenuItem
                      key={i}
                      item={item}
                      variant={variant}
                      cellPadding={cellPadding}
                    />
                  )
              )}
            </div>
          </div>
          {scrollable && <CustomScrollBar scrollRef={scrollRef} />}
        </div>

        {actionArea && (
          <ActionArea
            leadingLabel={actionArea.leadingLabel}
            onLeadingAction={actionArea.onLeadingAction}
            trailingLabel={actionArea.trailingLabel}
            onTrailingAction={actionArea.onTrailingAction}
          />
        )}
      </div>
    </div>
  )
}
