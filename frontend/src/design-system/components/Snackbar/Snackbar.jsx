/**
 * Snackbar 컴포넌트
 *
 * 간단한 메시지와 상호작용을 안내하는 스낵바입니다.
 * 유리모피즘 배경에 메시지 + 선택적 아이콘 / 액션 버튼 / 닫기 버튼을 제공합니다.
 *
 * Props:
 *  message      — 메인 텍스트 (string)                              필수
 *  description  — 보조 설명 텍스트 (string)                         선택
 *  icon         — 왼쪽 아이콘 슬롯 (ReactNode)                      선택
 *  actionLabel  — 오른쪽 텍스트 버튼 레이블 (string)                 선택
 *  onAction     — 액션 버튼 클릭 핸들러 (() => void)                 선택
 *  onClose      — 제공 시 X 닫기 버튼 표시 (() => void)              선택
 *  className    — 추가 클래스
 *
 * 사용 예:
 *  <Snackbar message="저장되었습니다" actionLabel="실행 취소" onAction={handleUndo} />
 *  <Snackbar message="메시지" description="보조 설명" onClose={handleClose} />
 *  <Snackbar message="알림" icon={<Icon />} actionLabel="확인" onAction={fn} onClose={fn} />
 */

import { useState } from 'react'

/* ── 인터랙션 오버레이 opacity ───────────────────────────────── */
const OVERLAY_OPACITY = { hovered: 0.05, focused: 0.08, pressed: 0.12 }

/* ── 닫기 아이콘 SVG ────────────────────────────────────────── */
function XIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 5L15 15M15 5L5 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ── 액션 버튼 서브컴포넌트 ─────────────────────────────────── */
function ActionButton({ label, onClick }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const overlayOpacity = isPressed ? OVERLAY_OPACITY.pressed
    : isFocused                    ? OVERLAY_OPACITY.focused
    : isHovered                    ? OVERLAY_OPACITY.hovered
    : 0

  return (
    <button
      style={{
        position:            'relative',
        display:             'flex',
        alignItems:          'center',
        justifyContent:      'center',
        paddingTop:          'var(--spacing-4)',
        paddingBottom:       'var(--spacing-4)',
        background:          'none',
        border:              'none',
        cursor:              'pointer',
        fontSize:            'var(--font-size-body-2)',
        lineHeight:          'var(--line-height-body-2-normal)',
        letterSpacing:       'var(--letter-spacing-body-2)',
        fontWeight:          'var(--font-weight-semibold)',
        fontFeatureSettings: "'ss10' 1",
        color:               'var(--color-static-white)',
        whiteSpace:          'nowrap',
        flexShrink:          0,
        outline:             'none',
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false) }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => { setIsFocused(false); setIsPressed(false) }}
    >
      <div
        style={{
          position:        'absolute',
          left:            '-7px',
          right:           '-7px',
          top:             '50%',
          transform:       'translateY(-50%)',
          height:          'var(--spacing-32)',
          borderRadius:    'var(--spacing-6)',
          overflow:        'clip',
          backgroundColor: `color-mix(in srgb, var(--color-static-white) ${Math.round(overlayOpacity * 100)}%, transparent)`,
          pointerEvents:   'none',
          transition:      'background-color 0.15s ease',
        }}
        aria-hidden="true"
      />
      <span style={{ position: 'relative' }}>{label}</span>
    </button>
  )
}

/* ── 닫기 버튼 서브컴포넌트 ─────────────────────────────────── */
function CloseButton({ onClick }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const overlayOpacity = isPressed ? OVERLAY_OPACITY.pressed
    : isFocused                    ? OVERLAY_OPACITY.focused
    : isHovered                    ? OVERLAY_OPACITY.hovered
    : 0

  return (
    <button
      style={{
        position:       'relative',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        'var(--spacing-2)',
        background:     'none',
        border:         'none',
        cursor:         'pointer',
        color:          'var(--color-static-white)',
        opacity:        0.61,
        flexShrink:     0,
        lineHeight:     0,
        outline:        'none',
      }}
      onClick={onClick}
      aria-label="닫기"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false) }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => { setIsFocused(false); setIsPressed(false) }}
    >
      <div
        style={{
          position:        'absolute',
          inset:           '-8px',
          borderRadius:    'var(--radius-full)',
          backgroundColor: `color-mix(in srgb, var(--color-static-white) ${Math.round(overlayOpacity * 100)}%, transparent)`,
          pointerEvents:   'none',
          transition:      'background-color 0.15s ease',
        }}
        aria-hidden="true"
      />
      <XIcon />
    </button>
  )
}

/* ── 메인 컴포넌트 ──────────────────────────────────────────── */
export default function Snackbar({
  message      = '',
  description,
  icon,
  actionLabel,
  onAction,
  onClose,
  className    = '',
}) {
  const outerStyle = {
    position:             'relative',
    display:              'flex',
    alignItems:           'flex-start',
    overflow:             'clip',
    paddingTop:           '11px',
    paddingBottom:        '11px',
    paddingLeft:          'var(--spacing-16)',
    paddingRight:         'var(--spacing-16)',
    borderRadius:         '12px',
    width:                '335px',
    maxWidth:             '420px',
    backdropFilter:       'blur(32px)',
    WebkitBackdropFilter: 'blur(32px)',
    boxSizing:            'border-box',
  }

  const containerStyle = {
    display:       'flex',
    flexDirection: 'row',
    alignItems:    'center',
    gap:           'var(--spacing-12)',
    minHeight:     '32px',
    flex:          '1 0 0',
    minWidth:      0,
    position:      'relative',
  }

  const contentStyle = {
    display:       'flex',
    flexDirection: 'row',
    alignItems:    'center',
    gap:           'var(--spacing-8)',
    flex:          '1 0 0',
    minWidth:      0,
    position:      'relative',
  }

  const messageStyle = {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'flex-start',
    justifyContent: 'center',
    flex:           '1 0 0',
    minWidth:       0,
    paddingTop:     '5px',
    paddingBottom:  '5px',
    paddingLeft:    'var(--spacing-2)',
    paddingRight:   'var(--spacing-2)',
    position:       'relative',
  }

  const headingStyle = {
    fontSize:            'var(--font-size-body-2)',
    lineHeight:          'var(--line-height-body-2-normal)',
    letterSpacing:       'var(--letter-spacing-body-2)',
    fontWeight:          'var(--font-weight-semibold)',
    fontFeatureSettings: "'ss10' 1",
    color:               'var(--color-static-white)',
    opacity:             0.88,
    width:               '100%',
    flexShrink:          0,
    margin:              0,
    position:            'relative',
  }

  const descriptionStyle = {
    fontSize:            'var(--font-size-label-2)',
    lineHeight:          'var(--line-height-label-2)',
    letterSpacing:       'var(--letter-spacing-label-2)',
    fontWeight:          'var(--font-weight-regular)',
    fontFeatureSettings: "'ss10' 1",
    color:               'var(--color-static-white)',
    opacity:             0.88,
    width:               '100%',
    flexShrink:          0,
    overflow:            'hidden',
    textOverflow:        'ellipsis',
    margin:              0,
    position:            'relative',
  }

  return (
    <div style={outerStyle} className={className} role="alert" aria-live="polite">
      {/* 배경 Layer 1: 역배경 */}
      <div
        style={{
          position:        'absolute',
          inset:           0,
          backgroundColor: 'var(--color-inverse-background)',
          opacity:         0.52,
        }}
        aria-hidden="true"
      />
      {/* 배경 Layer 2: 프라이머리 오버레이 */}
      <div
        style={{
          position:        'absolute',
          inset:           0,
          backgroundColor: 'var(--color-primary-normal)',
          opacity:         0.05,
        }}
        aria-hidden="true"
      />

      {/* 컨텐츠 영역 */}
      <div style={containerStyle}>
        <div style={contentStyle}>
          {/* 선택적 왼쪽 아이콘 */}
          {icon && (
            <div style={{
              display:    'flex',
              alignItems: 'center',
              alignSelf:  'stretch',
              maxHeight:  '40px',
              flexShrink: 0,
              position:   'relative',
            }}>
              <div style={{
                width:          '22px',
                height:         '22px',
                flexShrink:     0,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
              }}>
                {icon}
              </div>
            </div>
          )}

          {/* 메시지 영역 */}
          <div style={messageStyle}>
            {message && <p style={headingStyle}>{message}</p>}
            {description && (
              <p style={descriptionStyle}>{description}</p>
            )}
          </div>
        </div>

        {/* 액션 버튼 */}
        {actionLabel && (
          <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'flex-end',
            paddingLeft:    'var(--spacing-2)',
            paddingRight:   'var(--spacing-2)',
            flexShrink:     0,
            position:       'relative',
          }}>
            <ActionButton label={actionLabel} onClick={onAction} />
          </div>
        )}

        {/* 닫기 버튼 */}
        {onClose && <CloseButton onClick={onClose} />}
      </div>
    </div>
  )
}
