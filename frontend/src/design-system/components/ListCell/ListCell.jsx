/**
 * ListCell 컴포넌트
 *
 * 인터랙션이 가능한 리스트 항목입니다.
 * 좌측 슬롯(leadingContent)과 우측 슬롯(trailingContent)을 통해
 * 아이콘, 아바타, 뱃지, 스위치 등 다양한 콘텐츠를 조합할 수 있습니다.
 *
 * Props:
 *  label           — 메인 텍스트                             기본: ''
 *  description     — 보조 텍스트. 있으면 label 아래 표시      기본: ''
 *  verticalPadding — 'none' | 'small' | 'medium' | 'large'  기본: 'medium'
 *                    none: 0px  small: 8px  medium: 12px  large: 16px
 *  verticalAlign   — 'top' | 'center'                        기본: 'top'
 *  textEllipsis    — true | false  텍스트 말줄임              기본: false
 *  selected        — true | false  선택 상태                  기본: false
 *  disabled        — true | false  비활성화 (opacity 0.43)    기본: false
 *  divider         — true | false  하단 구분선                기본: false
 *  chevron         — true | false  우측 chevronRight 아이콘   기본: false
 *  leadingContent  — ReactNode     좌측 슬롯                  기본: null
 *  trailingContent — ReactNode     우측 슬롯                  기본: null
 *  onClick         — 클릭 핸들러 () => void
 *  className       — 추가 클래스
 *
 * 사용 예:
 *  <ListCell label="텍스트" />
 *  <ListCell label="제목" description="설명" verticalPadding="large" chevron />
 *  <ListCell label="선택됨" selected trailingContent={<Icon name="check" size={24} />} />
 *  <ListCell label="항목" leadingContent={<Avatar size="small" />} divider onClick={fn} />
 *  <ListCell label="비활성" disabled />
 */

import { useState } from 'react'
import Icon from '../Icon/Icon'

const OVERLAY_OPACITY = { hovered: 0.05, focused: 0.08, pressed: 0.12 }

const PADDING_Y = {
  none:   0,
  small:  'var(--spacing-8)',
  medium: 'var(--spacing-12)',
  large:  'var(--spacing-16)',
}

export default function ListCell({
  label           = '',
  description     = '',
  verticalPadding = 'medium',
  verticalAlign   = 'top',
  textEllipsis    = false,
  selected        = false,
  disabled        = false,
  divider         = false,
  chevron         = false,
  leadingContent  = null,
  trailingContent = null,
  onClick         = null,
  className       = '',
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const isClickable  = !!onClick && !disabled
  const overlayOpacity = !isClickable ? 0
    : isPressed                       ? OVERLAY_OPACITY.pressed
    : isFocused                       ? OVERLAY_OPACITY.focused
    : isHovered                       ? OVERLAY_OPACITY.hovered
    : 0

  const alignItems   = verticalAlign === 'center' ? 'center' : 'flex-start'
  const paddingY     = PADDING_Y[verticalPadding] ?? PADDING_Y.medium

  /* ── 라벨 색상 / 굵기 ── */
  const labelColor  = (!disabled && selected)
    ? 'var(--color-primary-normal)'
    : disabled
      ? 'var(--color-label-alternative)'
      : 'var(--color-label-normal)'
  const labelWeight = (!disabled && selected)
    ? 'var(--font-weight-medium)'
    : 'var(--font-weight-regular)'

  /* ── 스타일 ── */
  const outerStyle = {
    position:  'relative',
    display:   'flex',
    flexDirection: 'column',
    width:     '100%',
  }

  const dividerStyle = {
    position:    'absolute',
    inset:       0,
    borderBottom: '1px solid var(--color-line-alternative)',
    pointerEvents: 'none',
  }

  const containerStyle = {
    display:         'flex',
    alignItems,
    paddingTop:      paddingY,
    paddingBottom:   paddingY,
    position:        'relative',
    overflow:        'hidden',
    opacity:         disabled ? 0.43 : 1,
    cursor:          disabled ? 'not-allowed' : (isClickable ? 'pointer' : 'default'),
    userSelect:      'none',
    width:           '100%',
  }

  const innerWrapStyle = {
    display:   'flex',
    flex:      '1 0 0',
    gap:       'var(--spacing-8)',
    alignItems,
    minWidth:  0,
  }

  const leadingWrapStyle = {
    display:  'flex',
    alignItems: 'flex-start',
    flexShrink: 0,
    overflow: 'hidden',
  }

  const textColumnStyle = {
    display:        'flex',
    flex:           '1 0 0',
    flexDirection:  'column',
    gap:            'var(--spacing-4)',
    minWidth:       0,
    overflow:       'hidden',
  }

  const labelStyle = {
    fontSize:      'var(--font-size-body-1)',
    fontWeight:    labelWeight,
    lineHeight:    'var(--line-height-body-1-normal)',
    letterSpacing: 'var(--letter-spacing-body-1)',
    color:         labelColor,
    minHeight:     'var(--spacing-24)',
    display:       'flex',
    alignItems:    'center',
    width:         '100%',
    ...(textEllipsis && {
      overflow:     'hidden',
      textOverflow: 'ellipsis',
      whiteSpace:   'nowrap',
      display:      'block',
    }),
  }

  const descriptionStyle = {
    fontSize:      'var(--font-size-label-2)',
    fontWeight:    'var(--font-weight-regular)',
    lineHeight:    'var(--line-height-label-2)',
    letterSpacing: 'var(--letter-spacing-label-2)',
    color:         'var(--color-label-alternative)',
    width:         '100%',
    ...(textEllipsis && {
      overflow:     'hidden',
      textOverflow: 'ellipsis',
      whiteSpace:   'nowrap',
    }),
  }

  const trailingAreaStyle = {
    display:    'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    flexShrink: 0,
  }

  const trailingContentWrapStyle = {
    display:     'flex',
    alignItems:  'center',
    paddingLeft: 'var(--spacing-8)',
    flexShrink:  0,
  }

  const chevronWrapStyle = {
    display:      'flex',
    alignItems:   'center',
    justifyContent: 'center',
    paddingLeft:  'var(--spacing-8)',
    paddingTop:   'var(--spacing-4)',
    paddingBottom:'var(--spacing-4)',
    flexShrink:   0,
  }

  const handleClick = () => {
    if (isClickable) onClick()
  }

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <div style={outerStyle} className={className}>
      {/* 하단 구분선 */}
      {divider && (
        <div aria-hidden="true" style={dividerStyle} />
      )}

      {/* 메인 컨테이너 */}
      <div
        style={containerStyle}
        role={isClickable ? 'button' : undefined}
        aria-pressed={isClickable ? selected : undefined}
        aria-disabled={disabled}
        tabIndex={isClickable ? 0 : undefined}
        onClick={handleClick}
        onKeyDown={isClickable ? handleKeyDown : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setIsPressed(false) }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => { setIsFocused(false); setIsPressed(false) }}
      >
        <div
          aria-hidden="true"
          style={{
            position:        'absolute',
            inset:           0,
            backgroundColor: `color-mix(in srgb, var(--color-label-normal) ${Math.round(overlayOpacity * 100)}%, transparent)`,
            pointerEvents:   'none',
            transition:      'background-color 0.15s ease',
          }}
        />
        <div style={innerWrapStyle}>
          {/* 좌측 슬롯 */}
          {leadingContent && (
            <div style={leadingWrapStyle}>
              {leadingContent}
            </div>
          )}

          {/* 텍스트 영역 */}
          <div style={textColumnStyle}>
            {label && (
              <span style={labelStyle}>{label}</span>
            )}
            {description && (
              <span style={descriptionStyle}>{description}</span>
            )}
          </div>

          {/* 우측 슬롯 + chevron */}
          <div style={trailingAreaStyle}>
            {trailingContent && (
              <div style={trailingContentWrapStyle}>
                {trailingContent}
              </div>
            )}
            {chevron && (
              <div style={chevronWrapStyle}>
                <Icon
                  name="chevronRight"
                  size={16}
                  color="var(--color-label-alternative)"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
