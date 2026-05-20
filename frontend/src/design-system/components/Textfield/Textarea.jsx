import { useRef, useState, useEffect } from 'react'
import './Textarea.css'

/**
 * Textarea 컴포넌트
 *
 * Props:
 *  status          — 'normal' | 'negative'              기본: 'normal'
 *  resize          — 'normal' | 'limit' | 'fixed'       기본: 'normal'
 *                    normal: 세로 자유 조절
 *                    limit:  최대 높이 제한 후 스크롤
 *                    fixed:  고정 높이, resize 불가
 *  disabled        — true | false                       기본: false
 *  heading         — 라벨 텍스트. 없으면 숨김
 *  required        — true 시 * 배지 표시                 기본: false
 *  description     — 하단 설명 텍스트. 없으면 숨김
 *  placeholder     — textarea placeholder
 *  maxLength       — 글자수 카운터 최대값. 0이면 숨김    기본: 0
 *  value           — controlled 입력값
 *  onChange        — 변경 핸들러
 *  leadingContent  — bottom bar 좌측 커스텀 ReactNode
 *  trailingContent — bottom bar 우측 커스텀 ReactNode
 *  className       — 추가 클래스
 *  ...props        — <textarea> 에 전달
 *
 * 사용 예:
 *  <Textarea placeholder="메시지를 입력해 주세요." />
 *  <Textarea heading="내용" required maxLength={2000} />
 *  <Textarea status="negative" description="올바르지 않은 형식입니다" />
 *  <Textarea resize="fixed" heading="고정 높이 입력" />
 */

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
      const trackHeight = clientHeight - 16
      const ratio       = clientHeight / scrollHeight
      const newThumbH   = Math.max(Math.round(trackHeight * ratio), 20)
      const maxTop      = trackHeight - newThumbH
      const scrollRatio = scrollTop / (scrollHeight - clientHeight)
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
        right:         'calc(-1 * var(--spacing-6))',
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

const BORDER_COLOR = {
  normal:   'var(--color-line-neutral)',
  negative: 'color-mix(in srgb, var(--color-status-negative) 28%, transparent)',
}

const FOCUS_BORDER_COLOR = {
  normal:   'color-mix(in srgb, var(--color-primary-normal) 43%, transparent)',
  negative: 'color-mix(in srgb, var(--color-status-negative) 43%, transparent)',
}

const RESIZE_STYLE = {
  normal: {
    resize:    'vertical',
    minHeight: '90px',
    maxHeight: 'none',
    height:    'auto',
    overflowY: 'auto',
  },
  limit: {
    resize:    'vertical',
    minHeight: '90px',
    maxHeight: '208px',
    height:    'auto',
    overflowY: 'auto',
  },
  fixed: {
    resize:    'none',
    height:    '78px',
    minHeight: 'unset',
    maxHeight: 'none',
    overflowY: 'auto',
  },
}

export default function Textarea({
  status          = 'normal',
  resize          = 'normal',
  disabled        = false,
  heading         = '',
  required        = false,
  description     = '',
  placeholder     = '',
  maxLength       = 0,
  value,
  onChange,
  leadingContent  = null,
  trailingContent = null,
  forceFocused    = false,
  className       = '',
  ...props
}) {
  const textareaRef = useRef(null)
  const currentLength = value !== undefined ? String(value).length : 0
  const showBottom = maxLength > 0 || leadingContent || trailingContent
  const isFocused = forceFocused && !disabled

  const containerStyle = {
    display:       'flex',
    flexDirection: 'column',
    gap:           'var(--spacing-8)',
  }

  const wrapperStyle = {
    position: 'relative',
    width:    '100%',
    flexShrink: 0,
  }

  const backgroundStyle = {
    position:       'absolute',
    inset:          0,
    borderRadius:   'var(--spacing-12)',
    backgroundColor: disabled
      ? 'var(--color-fill-alternative)'
      : 'var(--color-bg-transparent)',
    backdropFilter: 'blur(32px)',
  }

  const inputBoxStyle = {
    position:      'relative',
    display:       'flex',
    flexDirection: 'column',
    gap:           'var(--spacing-12)',
    padding:       'var(--spacing-12)',
    borderRadius:  'var(--spacing-12)',
    border:        'none',
    outline:       isFocused ? `2px solid ${FOCUS_BORDER_COLOR[status]}` : 'none',
    outlineOffset: isFocused ? '-1px' : '0',
    boxShadow:     disabled
      ? `inset 0 0 0 1px var(--color-line-neutral)`
      : isFocused
        ? `var(--shadow-normal-xsmall)`
        : `inset 0 0 0 1px ${BORDER_COLOR[status]}, var(--shadow-normal-xsmall)`,
    opacity:       disabled ? 0.4 : 1,
  }

  const textareaStyle = {
    border:        'none',
    outline:       'none',
    background:    'transparent',
    fontFamily:    'var(--font-family-base)',
    fontSize:      'var(--font-size-body-1)',
    fontWeight:    'var(--font-weight-regular)',
    lineHeight:    'var(--line-height-body-1-reading)',
    letterSpacing: 'var(--letter-spacing-body-1)',
    color:         'var(--color-label-normal)',
    width:         '100%',
    padding:       'var(--spacing-4)',
    boxSizing:     'border-box',
    ...RESIZE_STYLE[resize],
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

  const bottomStyle = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    gap:            'var(--spacing-16)',
    width:          '100%',
    flexShrink:     0,
  }

  const counterStyle = {
    fontSize:      'var(--font-size-label-2)',
    fontWeight:    'var(--font-weight-medium)',
    lineHeight:    'var(--line-height-label-2)',
    letterSpacing: 'var(--letter-spacing-label-2)',
    color:         'var(--color-label-alternative)',
    opacity:       0.74,
    paddingLeft:   'var(--spacing-4)',
    paddingRight:  'var(--spacing-4)',
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

  return (
    <div style={containerStyle} className={className}>
      {heading && (
        <div style={headingStyle}>
          <span>{heading}</span>
          {required && <span style={requiredStyle} aria-label="필수">*</span>}
        </div>
      )}

      <div style={wrapperStyle}>
        <div style={backgroundStyle} aria-hidden="true" />

        <div style={inputBoxStyle}>
          <div style={{ position: 'relative', flex: '1 0 0' }}>
            <textarea
              ref={textareaRef}
              className="ax-textarea"
              style={textareaStyle}
              placeholder={placeholder}
              disabled={disabled}
              maxLength={maxLength > 0 ? maxLength : undefined}
              value={value}
              onChange={onChange}
              aria-invalid={status === 'negative'}
              aria-required={required}
              {...props}
            />
            <CustomScrollBar scrollRef={textareaRef} />
          </div>

          {showBottom && (
            <div style={bottomStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', flex: '1 0 0' }}>
                {maxLength > 0 && (
                  <span style={counterStyle}>
                    {currentLength}/{maxLength}
                  </span>
                )}
                {leadingContent}
              </div>

              {trailingContent && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', flexShrink: 0 }}>
                  {trailingContent}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {description && (
        <span style={descriptionStyle}>{description}</span>
      )}
    </div>
  )
}
