/**
 * Textfield 컴포넌트
 *
 * Props:
 *  status          — 'normal' | 'positive' | 'negative'  기본: 'normal'
 *  disabled        — true | false                         기본: false
 *  heading         — 라벨 텍스트. 없으면 라벨 숨김
 *  required        — true 시 라벨 옆 * 배지 표시          기본: false
 *  description     — 하단 설명 텍스트. 없으면 숨김
 *  placeholder     — 입력 placeholder 문자열
 *  icon            — leading Icon name (Icon 컴포넌트 name prop)
 *  trailingContent — trailing 영역 커스텀 ReactNode (인풋 박스 안)
 *  trailingButton  — 인풋 오른쪽에 붙는 split-panel 버튼
 *                    { label, variant: 'normal'|'assistive', disabled: boolean }
 *  className       — 추가 클래스
 *  ...props        — <input> 에 전달
 *
 * 사용 예:
 *  <Textfield placeholder="입력하세요" />
 *  <Textfield heading="이름" required description="실명을 입력해 주세요" />
 *  <Textfield status="negative" description="올바르지 않은 형식입니다" />
 *  <Textfield heading="검색" icon="search" />
 *  <Textfield trailingButton={{ label: '재발송', variant: 'normal' }} />
 *  <Textfield trailingButton={{ label: '확인', variant: 'assistive', disabled: true }} />
 */

import Icon from '../Icon/Icon'

const BORDER_COLOR = {
  normal:   'var(--color-line-neutral)',
  positive: 'var(--color-line-neutral)',
  negative: 'color-mix(in srgb, var(--color-status-negative) 28%, transparent)',
}

export default function Textfield({
  status          = 'normal',
  disabled        = false,
  heading         = '',
  required        = false,
  description     = '',
  placeholder     = '',
  icon            = '',
  trailingContent = null,
  trailingButton  = null,
  forceFocused    = false,
  className       = '',
  ...props
}) {
  const hasSplitPanel = !!trailingButton

  const isFocused = forceFocused && !disabled

  const focusBorderColor = status === 'negative'
    ? 'color-mix(in srgb, var(--color-status-negative) 43%, transparent)'
    : 'color-mix(in srgb, var(--color-primary-normal) 43%, transparent)'

  const borderColor = disabled
    ? 'var(--color-line-neutral)'
    : isFocused
      ? focusBorderColor
      : BORDER_COLOR[status]

  const containerStyle = {
    display:       'flex',
    flexDirection: 'column',
    gap:           'var(--spacing-8)',
  }

  /* ── 인풋 박스 ── */
  const inputBoxStyle = {
    display:         'flex',
    alignItems:      'center',
    gap:             'var(--spacing-8)',
    padding:         'var(--spacing-12)',
    borderRadius:    hasSplitPanel
      ? 'var(--spacing-12) 0 0 var(--spacing-12)'
      : 'var(--spacing-12)',
    border:          'none',
    outline:         isFocused ? `2px solid ${borderColor}` : 'none',
    outlineOffset:   isFocused ? '-1px' : '0',
    backgroundColor: disabled
      ? 'var(--color-fill-alternative)'
      : 'var(--color-bg-transparent)',
    backdropFilter:  'blur(32px)',
    boxShadow:       disabled
      ? `inset 0 0 0 1px ${borderColor}`
      : isFocused
        ? `var(--shadow-normal-xsmall)`
        : `inset 0 0 0 1px ${borderColor}, var(--shadow-normal-xsmall)`,
    opacity:         disabled ? 0.4 : 1,
    flex:            hasSplitPanel ? 1 : undefined,
    minWidth:        hasSplitPanel ? 0 : undefined,
    overflow:        'hidden',
  }

  const inputStyle = {
    flex:          1,
    border:        'none',
    outline:       'none',
    background:    'transparent',
    fontFamily:    'var(--font-family-base)',
    fontSize:      'var(--font-size-body-1)',
    fontWeight:    'var(--font-weight-regular)',
    lineHeight:    'var(--line-height-body-1-normal)',
    letterSpacing: 'var(--letter-spacing-body-1)',
    color:         'var(--color-label-normal)',
    caretColor:    'var(--color-primary-normal)',
  }

  const headingStyle = {
    display:       'flex',
    alignItems:    'center',
    gap:           'var(--spacing-4)',
    fontSize:      'var(--font-size-body-2)',
    fontWeight:    'var(--font-weight-semibold)',
    lineHeight:    'var(--line-height-body-2-normal)',
    letterSpacing: 'var(--letter-spacing-body-2)',
    color:         'var(--color-label-neutral)',
  }

  const requiredStyle = {
    color:      'var(--color-status-negative)',
    fontSize:   'var(--font-size-body-2)',
    fontWeight: 'var(--font-weight-semibold)',
    lineHeight: 1,
  }

  const descriptionStyle = {
    fontSize:      'var(--font-size-label-1)',
    fontWeight:    'var(--font-weight-regular)',
    lineHeight:    'var(--line-height-label-1-normal)',
    letterSpacing: 'var(--letter-spacing-label-1)',
    color: status === 'negative' && !disabled
      ? 'var(--color-status-negative)'
      : 'var(--color-label-alternative)',
  }

  /* ── split-panel 버튼 스타일 ── */
  const panelDisabled = disabled || trailingButton?.disabled
  const panelBorderColor = panelDisabled
    ? 'var(--color-line-alternative)'
    : BORDER_COLOR[status]

  const panelStyle = {
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    minWidth:        '80px',
    padding:         'var(--spacing-12) var(--spacing-16)',
    borderRadius:    '0 var(--spacing-12) var(--spacing-12) 0',
    borderTop:       `1px solid ${panelBorderColor}`,
    borderRight:     `1px solid ${panelBorderColor}`,
    borderBottom:    `1px solid ${panelBorderColor}`,
    borderLeft:      'none',
    backgroundColor: panelDisabled ? 'var(--color-fill-alternative)' : 'transparent',
    flexShrink:      0,
  }

  const panelTextColor = panelDisabled
    ? 'var(--color-label-assistive)'
    : trailingButton?.variant === 'assistive'
      ? 'var(--color-label-normal)'
      : 'var(--color-primary-normal)'

  const panelTextStyle = {
    fontSize:      'var(--font-size-body-1)',
    fontWeight:    trailingButton?.variant === 'assistive'
      ? 'var(--font-weight-medium)'
      : 'var(--font-weight-semibold)',
    lineHeight:    'var(--line-height-body-1-normal)',
    letterSpacing: 'var(--letter-spacing-body-1)',
    color:         panelTextColor,
    whiteSpace:    'nowrap',
  }

  return (
    <div style={containerStyle} className={className}>
      {heading && (
        <div style={headingStyle}>
          <span>{heading}</span>
          {required && <span style={requiredStyle} aria-label="필수">*</span>}
        </div>
      )}

      {(() => {
        const inputBox = (
          <div style={inputBoxStyle}>
            {icon && (
              <Icon
                name={icon}
                size={20}
                color={disabled ? 'var(--color-label-disable)' : 'var(--color-label-alternative)'}
              />
            )}
            <input
              style={inputStyle}
              placeholder={placeholder}
              disabled={disabled}
              aria-invalid={status === 'negative'}
              aria-required={required}
              {...props}
            />
            {trailingContent && (
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                {trailingContent}
              </div>
            )}
          </div>
        )

        return hasSplitPanel ? (
          <div style={{ display: 'flex', alignItems: 'stretch' }}>
            {inputBox}
            <div style={panelStyle}>
              <span style={panelTextStyle}>{trailingButton.label}</span>
            </div>
          </div>
        ) : inputBox
      })()}

      {description && (
        <span style={descriptionStyle}>{description}</span>
      )}
    </div>
  )
}
