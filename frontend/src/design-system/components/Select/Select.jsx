/**
 * Select 컴포넌트 — 드롭다운 트리거 UI
 *
 * 이 컴포넌트는 트리거(버튼) UI만 담당합니다.
 * 드롭다운 패널 열기/닫기는 부모 컴포넌트에서 onClick을 통해 제어하세요.
 *
 * Props:
 *  render        — 'text' | 'chip'            기본: 'text'
 *                  text: 단일 선택값을 텍스트로 표시
 *                  chip: 다중 선택값을 칩으로 표시
 *  status        — 'normal' | 'negative'      기본: 'normal'
 *  disabled      — true | false               기본: false
 *  forceFocused  — true 시 포커스 스타일 강제 적용 (쇼케이스용)
 *  heading       — 라벨 텍스트. 없으면 숨김
 *  required      — true 시 * 배지 표시        기본: false
 *  description   — 하단 설명. 없으면 숨김
 *  placeholder   — 미선택 시 표시 텍스트      기본: '선택해주세요.'
 *  value         — 선택된 값 (text: string, chip: string[])
 *  leadingIcon   — leading Icon name
 *  overflow      — true 시 텍스트 줄바꿈 / 칩 전체 표시 (쇼케이스용)  기본: false
 *  onRemoveChip  — chip × 버튼 핸들러 (value: string) => void
 *  onClick       — 트리거 클릭 핸들러 (드롭다운 열기)
 *  className     — 추가 클래스
 *
 * 사용 예:
 *  <Select placeholder="카테고리 선택" onClick={openDropdown} />
 *  <Select heading="태그" render="chip" value={['React', 'TypeScript']} onRemoveChip={removeTag} />
 *  <Select status="negative" description="필수 항목입니다" />
 */

import Icon from '../Icon/Icon'


export default function Select({
  render       = 'text',
  status       = 'normal',
  disabled     = false,
  forceFocused = false,
  overflow     = false,
  heading      = '',
  required     = false,
  description  = '',
  placeholder  = '선택해주세요.',
  value        = '',
  leadingIcon  = '',
  onRemoveChip = null,
  onClick      = null,
  className    = '',
}) {
  const isChipMode   = render === 'chip'
  const chips        = isChipMode ? (Array.isArray(value) ? value : []) : []
  const hasValue     = isChipMode ? chips.length > 0 : Boolean(value)
  const visibleChips = chips

  const isFocused = forceFocused && !disabled

  const focusBorderColor = status === 'negative'
    ? 'color-mix(in srgb, var(--color-status-negative) 43%, transparent)'
    : 'color-mix(in srgb, var(--color-primary-normal) 43%, transparent)'

  const borderColor = disabled
    ? 'var(--color-line-alternative)'
    : isFocused
      ? focusBorderColor
      : status === 'negative'
        ? 'color-mix(in srgb, var(--color-status-negative) 28%, transparent)'
        : 'var(--color-line-neutral)'

  const containerStyle = {
    display:       'flex',
    flexDirection: 'column',
    gap:           'var(--spacing-8)',
  }

  const inputBoxStyle = {
    position:        'relative',
    display:         'flex',
    alignItems:      'center',
    gap:             'var(--spacing-12)',
    padding:         'var(--spacing-12)',
    borderRadius:    'var(--spacing-12)',
    border:          'none',
    outline:         isFocused ? `2px solid ${focusBorderColor}` : 'none',
    outlineOffset:   isFocused ? '-1px' : '0',
    backgroundColor: disabled ? 'var(--color-interaction-disable)' : 'var(--color-bg-transparent)',
    backdropFilter:  disabled ? 'none' : 'blur(32px)',
    boxShadow:       disabled
      ? 'none'
      : isFocused
        ? 'var(--shadow-normal-xsmall)'
        : `inset 0 0 0 1px ${borderColor}, var(--shadow-normal-xsmall)`,
    cursor:          disabled ? 'not-allowed' : 'pointer',
    userSelect:      'none',
  }

  const contentStyle = {
    flex:        '1 0 0',
    display:     'flex',
    alignItems:  'center',
    gap:         'var(--spacing-8)',
    minWidth:    0,
    minHeight:   '24px',
  }

  const headingStyle = {
    display:       'flex',
    alignItems:    'center',
    gap:           'var(--spacing-4)',
    fontSize:      'var(--font-size-label-1)',
    fontWeight:    'var(--font-weight-semibold)',
    lineHeight:    'var(--line-height-label-1-normal)',
    letterSpacing: 'var(--letter-spacing-label-1)',
    color:         'var(--color-label-neutral)',
    flexShrink:    0,
  }

  const requiredStyle = {
    color:      'var(--color-status-negative)',
    fontSize:   'var(--font-size-label-1)',
    fontWeight: 'var(--font-weight-semibold)',
    lineHeight: 1,
  }

  const textStyle = {
    flex:          '1 0 0',
    fontSize:      'var(--font-size-body-1)',
    fontWeight:    'var(--font-weight-regular)',
    lineHeight:    'var(--line-height-body-1-normal)',
    letterSpacing: 'var(--letter-spacing-body-1)',
    color:         disabled
      ? (hasValue ? 'var(--color-label-alternative)' : 'var(--color-label-disable)')
      : (hasValue ? 'var(--color-label-normal)'      : 'var(--color-label-assistive)'),
    overflow:      overflow ? 'visible' : 'hidden',
    textOverflow:  overflow ? 'unset'   : 'ellipsis',
    whiteSpace:    overflow ? 'normal'  : 'nowrap',
    wordBreak:     overflow ? 'break-all' : undefined,
    paddingLeft:   'var(--spacing-4)',
    paddingRight:  'var(--spacing-4)',
  }

  const chipsWrapStyle = {
    flex:        '1 0 0',
    display:     'flex',
    flexWrap:    overflow ? 'wrap' : 'nowrap',
    alignItems:  overflow ? 'flex-start' : 'center',
    gap:         'var(--spacing-4)',
    minWidth:    0,
    overflow:    overflow ? 'visible' : 'hidden',
    paddingLeft: 'var(--spacing-4)',
  }

  const chipStyle = {
    display:         'inline-flex',
    alignItems:      'center',
    gap:             'var(--spacing-2)',
    paddingLeft:     'var(--spacing-7)',
    paddingRight:    'var(--spacing-7)',
    paddingTop:      'var(--spacing-4)',
    paddingBottom:   'var(--spacing-4)',
    borderRadius:    'var(--spacing-6)',
    backgroundColor: 'var(--color-fill-alternative)',
    fontSize:        'var(--font-size-caption-1)',
    fontWeight:      'var(--font-weight-medium)',
    lineHeight:      'var(--line-height-caption-1)',
    letterSpacing:   'var(--letter-spacing-caption-1)',
    color:           disabled ? 'var(--color-label-disable)' : 'var(--color-label-alternative)',
    flexShrink:      0,
  }


  const placeholderChipStyle = {
    ...textStyle,
    paddingLeft:  0,
    paddingRight: 0,
  }

  const descriptionStyle = {
    fontSize:      'var(--font-size-caption-1)',
    fontWeight:    'var(--font-weight-regular)',
    lineHeight:    'var(--line-height-caption-1)',
    letterSpacing: 'var(--letter-spacing-caption-1)',
    color: status === 'negative' && !disabled
      ? 'var(--color-status-negative)'
      : 'var(--color-label-alternative)',
    flexShrink: 0,
  }

  const handleClick = () => {
    if (!disabled && onClick) onClick()
  }

  const handleChipRemove = (e, chipValue) => {
    e.stopPropagation()
    if (!disabled && onRemoveChip) onRemoveChip(chipValue)
  }

  return (
    <div style={containerStyle} className={className}>
      {heading && (
        <div style={headingStyle}>
          <span>{heading}</span>
          {required && <span style={requiredStyle} aria-label="필수">*</span>}
        </div>
      )}

      <div
        style={inputBoxStyle}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={false}
        aria-disabled={disabled}
        aria-invalid={status === 'negative'}
        aria-required={required}
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick() }}
      >
        {/* Leading Icon */}
        {leadingIcon && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon
              name={leadingIcon}
              size={22}
              color={disabled ? 'var(--color-label-disable)' : 'var(--color-label-alternative)'}
            />
          </div>
        )}

        {/* Content */}
        <div style={contentStyle}>
          {isChipMode ? (
            chips.length > 0 ? (
              <div style={chipsWrapStyle}>
                {visibleChips.map((chip) => (
                  <span key={chip} style={chipStyle}>
                    {chip}
                    <button
                      type="button"
                      aria-label={`${chip} 삭제`}
                      style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit' }}
                      onClick={(e) => handleChipRemove(e, chip)}
                    >
                      <Icon name="closeThick" size={12} color="currentColor" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <span style={placeholderChipStyle}>{placeholder}</span>
            )
          ) : (
            <span style={textStyle}>
              {hasValue ? String(value) : placeholder}
            </span>
          )}
        </div>

        {/* Negative status icon — unfocused 상태에서만 표시 */}
        {status === 'negative' && !isFocused && !disabled && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="circleExclamationFill" size={22} color="var(--color-status-negative)" />
          </div>
        )}

        {/* Trailing Chevron */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-4)', flexShrink: 0 }}>
          <Icon
            name={isFocused ? 'chevronUp' : 'chevronDown'}
            size={16}
            color={disabled ? 'var(--color-label-disable)' : 'var(--color-label-alternative)'}
          />
        </div>
      </div>

      {description && (
        <span style={descriptionStyle}>{description}</span>
      )}
    </div>
  )
}
