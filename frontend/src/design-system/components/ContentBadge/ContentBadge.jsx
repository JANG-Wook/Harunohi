/**
 * ContentBadge 컴포넌트
 *
 * 특정 콘텐츠의 상태나 속성을 시각적으로 강조하기 위해 사용합니다.
 * 정보를 항목별로 분류할 때 사용하며, 낮은 시각 위계를 가집니다.
 *
 * Props:
 *  variant      — 'solid' | 'outlined'                         기본: 'solid'
 *  size         — 'xsmall' | 'small' | 'medium'               기본: 'xsmall'
 *  color        — 'neutral' | CSS 변수 문자열                    기본: 'neutral'
 *                 예: 'var(--color-accent-fg-cyan)'
 *                     'var(--color-accent-fg-violet)'
 *  leadingIcon  — 앞 아이콘 이름 (Icon 컴포넌트 name). 없으면 null
 *  trailingIcon — 뒤 아이콘 이름. 없으면 null
 *  children     — 배지 텍스트
 *  className    — 추가 클래스
 *
 * 사용 예:
 *  <ContentBadge>텍스트</ContentBadge>
 *  <ContentBadge variant="outlined" size="medium">라벨</ContentBadge>
 *  <ContentBadge color="var(--color-accent-fg-cyan)">완료</ContentBadge>
 *  <ContentBadge color="var(--color-accent-fg-violet)" leadingIcon="check">선택됨</ContentBadge>
 */

import Icon from '../Icon/Icon'

const SIZES = {
  xsmall: {
    paddingH:      'var(--spacing-6)',
    paddingV:      'var(--spacing-3)',
    borderRadius:  'var(--spacing-6)',
    gap:           'var(--spacing-2)',
    iconSize:      12,
    fontSize:      'var(--font-size-caption-2)',
    lineHeight:    'var(--line-height-caption-2)',
    letterSpacing: 'var(--letter-spacing-caption-2)',
  },
  small: {
    paddingH:      'var(--spacing-6)',
    paddingV:      'var(--spacing-4)',
    borderRadius:  'var(--spacing-6)',
    gap:           'var(--spacing-3)',
    iconSize:      14,
    fontSize:      'var(--font-size-caption-1)',
    lineHeight:    'var(--line-height-caption-1)',
    letterSpacing: 'var(--letter-spacing-caption-1)',
  },
  medium: {
    paddingH:      'var(--spacing-8)',
    paddingV:      'var(--spacing-5)',
    borderRadius:  'var(--spacing-8)',
    gap:           'var(--spacing-4)',
    iconSize:      16,
    fontSize:      'var(--font-size-label-2)',
    lineHeight:    'var(--line-height-label-2)',
    letterSpacing: 'var(--letter-spacing-label-2)',
  },
}

export default function ContentBadge({
  variant      = 'solid',
  size         = 'xsmall',
  color        = 'neutral',
  leadingIcon  = null,
  trailingIcon = null,
  children,
  className    = '',
}) {
  const isNeutral  = color === 'neutral'
  const isSolid    = variant === 'solid'
  const isOutlined = variant === 'outlined'

  const {
    paddingH, paddingV, borderRadius, gap, iconSize,
    fontSize, lineHeight, letterSpacing,
  } = SIZES[size]

  const textColor = isNeutral
    ? 'var(--color-label-alternative)'
    : color

  const iconColor = textColor

  /* ── 컨테이너 베이스 스타일 ── */
  const containerStyle = {
    position:       'relative',
    display:        'inline-flex',
    alignItems:     'center',
    justifyContent: 'center',
    paddingTop:     paddingV,
    paddingBottom:  paddingV,
    paddingLeft:    paddingH,
    paddingRight:   paddingH,
    borderRadius,
    /* neutral solid: 불투명 fill */
    ...(isSolid && isNeutral && {
      backgroundColor: 'var(--color-fill-normal)',
    }),
    /* neutral outlined: 단순 border */
    ...(isOutlined && isNeutral && {
      border: '1px solid var(--color-line-neutral)',
    }),
  }

  /* ── 콘텐츠 래퍼 ── */
  const contentStyle = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap,
    position:       'relative',
    flexShrink:     0,
  }

  /* ── 텍스트 ── */
  const textStyle = {
    fontSize,
    fontWeight:    'var(--font-weight-medium)',
    lineHeight,
    letterSpacing,
    color:         textColor,
    whiteSpace:    'nowrap',
    flexShrink:    0,
  }

  return (
    <div style={containerStyle} className={className}>

      {/* ── Accent Solid: 배경 색조 (opacity 8%) ── */}
      {!isNeutral && isSolid && (
        <div
          aria-hidden="true"
          style={{
            position:        'absolute',
            inset:           0,
            overflow:        'hidden',
            borderRadius,
          }}
        >
          <div
            style={{
              position:        'absolute',
              inset:           0,
              backgroundColor: color,
              opacity:         0.08,
              borderRadius,
            }}
          />
        </div>
      )}

      {/* ── Accent Outlined: 테두리 (opacity 43%) ── */}
      {!isNeutral && isOutlined && (
        <div
          aria-hidden="true"
          style={{
            position:     'absolute',
            inset:        0,
            overflow:     'hidden',
            borderRadius,
          }}
        >
          <div
            style={{
              position:     'absolute',
              inset:        0,
              border:       `1px solid ${color}`,
              opacity:      0.43,
              borderRadius,
            }}
          />
        </div>
      )}

      {/* ── 콘텐츠: 아이콘 + 텍스트 ── */}
      <div style={contentStyle}>
        {leadingIcon && (
          <Icon name={leadingIcon} size={iconSize} color={iconColor} />
        )}

        {children && (
          <span style={textStyle}>{children}</span>
        )}

        {trailingIcon && (
          <Icon name={trailingIcon} size={iconSize} color={iconColor} />
        )}
      </div>
    </div>
  )
}
