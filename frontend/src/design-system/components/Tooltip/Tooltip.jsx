/**
 * Tooltip 컴포넌트
 *
 * 특정 UI 요소에 대한 간략한 레이블이나 추가 정보를 제공하는 작은 팝업입니다.
 *
 * Props:
 *  size          — 'medium' | 'small'                               기본: 'medium'
 *  position      — 'top' | 'bottom' | 'left' | 'right'             기본: 'bottom'
 *                  tooltip이 앵커 요소 대비 어느 쪽에 위치하는지
 *  align         — 'start' | 'center' | 'end'                       기본: 'center'
 *                  top/bottom → 화살표 수평 정렬 (start=왼, end=오)
 *                  left/right → 화살표 수직 정렬 (start=위, end=아래)
 *  label         — 본문 텍스트 (string)
 *  shortcut      — 단축키 표시 여부 (bool)                           기본: false
 *  shortcutText  — 단축키 텍스트 (string)                            기본: '⌘C'
 *  className     — 추가 클래스
 *
 * 사용 예:
 *  <Tooltip label="저장" />
 *  <Tooltip label="복사하기" shortcut shortcutText="⌘C" position="top" />
 *  <Tooltip label="역할" size="small" position="right" align="start" />
 */

/* ── 화살표 SVG ─────────────────────────────────────────────
 * position: 툴팁 말풍선이 위치하는 방향 → 화살표가 반대 방향을 가리킴
 *   bottom → 화살표가 위를 가리킴 (말풍선 위에 ▲)
 *   top    → 화살표가 아래를 가리킴 (말풍선 아래에 ▼)
 *   right  → 화살표가 왼쪽을 가리킴 (말풍선 왼쪽에 ◀)
 *   left   → 화살표가 오른쪽을 가리킴 (말풍선 오른쪽에 ▶)
 */

/* ── SVG 화살표 (cssVar=CSS 변수명, opacity 속성으로 레이어 분리) ── */

/* Medium 상하 화살표 (20×8) */
function ArrowUpMedium({ cssVar, opacity }) {
  return (
    <svg width="20" height="8" viewBox="0 0 20 8" fill="none" style={{ opacity }} aria-hidden="true">
      <path d="M0 8 C3 8,7 2,10 0 C13 2,17 8,20 8 Z" fill={`var(${cssVar})`} />
    </svg>
  )
}

function ArrowDownMedium({ cssVar, opacity }) {
  return (
    <svg width="20" height="8" viewBox="0 0 20 8" fill="none" style={{ opacity }} aria-hidden="true">
      <path d="M0 0 C3 0,7 6,10 8 C13 6,17 0,20 0 Z" fill={`var(${cssVar})`} />
    </svg>
  )
}

/* Medium 좌우 화살표 (8×20) */
function ArrowLeftMedium({ cssVar, opacity }) {
  return (
    <svg width="8" height="20" viewBox="0 0 8 20" fill="none" style={{ opacity }} aria-hidden="true">
      <path d="M8 0 C8 3,2 7,0 10 C2 13,8 17,8 20 Z" fill={`var(${cssVar})`} />
    </svg>
  )
}

function ArrowRightMedium({ cssVar, opacity }) {
  return (
    <svg width="8" height="20" viewBox="0 0 8 20" fill="none" style={{ opacity }} aria-hidden="true">
      <path d="M0 0 C0 3,6 7,8 10 C6 13,0 17,0 20 Z" fill={`var(${cssVar})`} />
    </svg>
  )
}

/* Small 상하 화살표 (14×6) */
function ArrowUpSmall({ cssVar, opacity }) {
  return (
    <svg width="14" height="6" viewBox="0 0 14 6" fill="none" style={{ opacity }} aria-hidden="true">
      <path d="M0 6 C2 6,5 1,7 0 C9 1,12 6,14 6 Z" fill={`var(${cssVar})`} />
    </svg>
  )
}

function ArrowDownSmall({ cssVar, opacity }) {
  return (
    <svg width="14" height="6" viewBox="0 0 14 6" fill="none" style={{ opacity }} aria-hidden="true">
      <path d="M0 0 C2 0,5 5,7 6 C9 5,12 0,14 0 Z" fill={`var(${cssVar})`} />
    </svg>
  )
}

/* Small 좌우 화살표 (6×14) */
function ArrowLeftSmall({ cssVar, opacity }) {
  return (
    <svg width="6" height="14" viewBox="0 0 6 14" fill="none" style={{ opacity }} aria-hidden="true">
      <path d="M6 0 C6 2,1 5,0 7 C1 9,6 12,6 14 Z" fill={`var(${cssVar})`} />
    </svg>
  )
}

function ArrowRightSmall({ cssVar, opacity }) {
  return (
    <svg width="6" height="14" viewBox="0 0 6 14" fill="none" style={{ opacity }} aria-hidden="true">
      <path d="M0 0 C0 2,5 5,6 7 C5 9,0 12,0 14 Z" fill={`var(${cssVar})`} />
    </svg>
  )
}

/* ── 사이즈별 스펙 ─────────────────────────────────────────── */
const SIZE_SPEC = {
  medium: {
    paddingLeft:   'var(--spacing-12)',
    paddingRight:  'var(--spacing-12)',
    paddingTop:    'var(--spacing-8)',
    paddingBottom: 'var(--spacing-8)',
    borderRadius:  'var(--spacing-8)',
    minWidth:      '64px',
    maxWidth:      '256px',
    fontSize:      'var(--font-size-label-1)',
    lineHeight:    'var(--line-height-label-1-normal)',
    letterSpacing: 'var(--letter-spacing-label-1)',
    gap:           'var(--spacing-6)',
    arrowEdgeOffset: 'var(--spacing-8)', // start/end align 시 화살표 가장자리 여백
  },
  small: {
    paddingLeft:   'var(--spacing-8)',
    paddingRight:  'var(--spacing-8)',
    paddingTop:    'var(--spacing-5)',
    paddingBottom: 'var(--spacing-5)',
    borderRadius:  'var(--spacing-6)',
    minWidth:      '36px',
    maxWidth:      '264px',
    fontSize:      'var(--font-size-caption-2)',
    lineHeight:    'var(--line-height-caption-2)',
    letterSpacing: 'var(--letter-spacing-caption-2)',
    gap:           'var(--spacing-2)',
    arrowEdgeOffset: 'var(--spacing-5)',
  },
}

/* ── 화살표 컴포넌트 선택 ────────────────────────────────────── */
function getArrowComponent(position, size) {
  if (size === 'small') {
    switch (position) {
      case 'bottom': return ArrowUpSmall
      case 'top':    return ArrowDownSmall
      case 'right':  return ArrowLeftSmall
      case 'left':   return ArrowRightSmall
    }
  }
  switch (position) {
    case 'bottom': return ArrowUpMedium
    case 'top':    return ArrowDownMedium
    case 'right':  return ArrowLeftMedium
    case 'left':   return ArrowRightMedium
  }
}

/* ── 화살표 컨테이너 스타일 ──────────────────────────────────── */
function getArrowContainerStyle(position, align, spec) {
  const isVertical = position === 'top' || position === 'bottom'

  if (isVertical) {
    // 화살표를 수평 정렬
    const justifyContent =
      align === 'start'  ? 'flex-start' :
      align === 'end'    ? 'flex-end'   : 'center'

    return {
      display:        'flex',
      flexDirection:  'row',
      justifyContent,
      alignItems:     'center',
      width:          '100%',
      flexShrink:     0,
      paddingLeft:    align === 'start' ? spec.arrowEdgeOffset : undefined,
      paddingRight:   align === 'end'   ? spec.arrowEdgeOffset : undefined,
      boxSizing:      'border-box',
    }
  } else {
    // 화살표를 수직 정렬
    const justifyContent =
      align === 'start'  ? 'flex-start' :
      align === 'end'    ? 'flex-end'   : 'center'

    return {
      display:        'flex',
      flexDirection:  'column',
      justifyContent,
      alignItems:     'center',
      alignSelf:      'stretch',
      flexShrink:     0,
      paddingTop:     align === 'start' ? spec.arrowEdgeOffset : undefined,
      paddingBottom:  align === 'end'   ? spec.arrowEdgeOffset : undefined,
      boxSizing:      'border-box',
    }
  }
}

/* ── 메인 컴포넌트 ──────────────────────────────────────────── */
export default function Tooltip({
  size          = 'medium',
  position      = 'bottom',
  align         = 'center',
  label         = '',
  shortcut      = false,
  shortcutText  = '⌘C',
  className     = '',
}) {
  const spec       = SIZE_SPEC[size] ?? SIZE_SPEC.medium
  const isVertical = position === 'top' || position === 'bottom'

  // 컨테이너 flex 방향
  const flexDirection =
    position === 'bottom' ? 'column' :
    position === 'top'    ? 'column-reverse' :
    position === 'right'  ? 'row' : 'row-reverse'

  const ArrowComponent = getArrowComponent(position, size)
  const arrowContainerStyle = getArrowContainerStyle(position, align, spec)

  const outerStyle = {
    display:       'inline-flex',
    flexDirection,
    alignItems:    isVertical ? 'stretch' : 'center',
    position:      'relative',
  }

  const bubbleStyle = {
    position:             'relative',
    display:              'flex',
    gap:                  spec.gap,
    alignItems:           'flex-start',
    minWidth:             spec.minWidth,
    maxWidth:             spec.maxWidth,
    overflow:             'hidden',
    paddingLeft:          spec.paddingLeft,
    paddingRight:         spec.paddingRight,
    paddingTop:           spec.paddingTop,
    paddingBottom:        spec.paddingBottom,
    borderRadius:         spec.borderRadius,
    flexShrink:           0,
    backdropFilter:       'blur(32px)',
    WebkitBackdropFilter: 'blur(32px)',
    boxSizing:            'border-box',
  }

  const textStyle = {
    fontSize:            spec.fontSize,
    lineHeight:          spec.lineHeight,
    letterSpacing:       spec.letterSpacing,
    fontWeight:          'var(--font-weight-medium)',
    fontFeatureSettings: "'ss10' 1",
    color:               'var(--color-inverse-label)',
    flex:                '1 0 0',
    minWidth:            0,
    margin:              0,
    whiteSpace:          'pre-line',
    position:            'relative',
  }

  const shortcutStyle = {
    fontSize:            spec.fontSize,
    lineHeight:          spec.lineHeight,
    letterSpacing:       spec.letterSpacing,
    fontWeight:          'var(--font-weight-medium)',
    fontFeatureSettings: "'ss10' 1",
    color:               'var(--color-inverse-label)',
    opacity:             0.61,
    flexShrink:          0,
    whiteSpace:          'nowrap',
    margin:              0,
    position:            'relative',
  }

  return (
    <div style={outerStyle} className={className} role="tooltip">
      {/* 화살표 */}
      <div style={arrowContainerStyle} aria-hidden="true">
        <div style={{ position: 'relative', flexShrink: 0, lineHeight: 0 }}>
          {/* 화살표 레이어 1: inverse-background opacity 0.88 */}
          <div style={{ position: 'absolute', inset: 0, lineHeight: 0 }}>
            <ArrowComponent cssVar="--color-inverse-background" opacity={0.88} />
          </div>
          {/* 화살표 레이어 2: primary-normal opacity 0.05 */}
          <ArrowComponent cssVar="--color-primary-normal" opacity={0.05} />
        </div>
      </div>

      {/* 말풍선 */}
      <div style={bubbleStyle}>
        {/* 배경 Layer 1 */}
        <div style={{
          position:        'absolute',
          inset:           0,
          backgroundColor: 'var(--color-inverse-background)',
          opacity:         0.88,
        }} aria-hidden="true" />
        {/* 배경 Layer 2 */}
        <div style={{
          position:        'absolute',
          inset:           0,
          backgroundColor: 'var(--color-primary-normal)',
          opacity:         0.05,
        }} aria-hidden="true" />

        {/* 텍스트 콘텐츠 */}
        <p style={textStyle}>{label}</p>
        {shortcut && (
          <p style={shortcutStyle}>{shortcutText}</p>
        )}
      </div>
    </div>
  )
}
