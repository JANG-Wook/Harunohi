/**
 * Alert 컴포넌트
 *
 * 중요한 정보나 경고를 전달하고, 사용자에게 행동을 요청하는 다이얼로그입니다.
 * platform prop으로 iOS / Android / Web 스타일을 선택합니다.
 *
 * Props:
 *  platform        — 'ios' | 'android' | 'web'                     기본: 'web'
 *  title           — 제목 텍스트 (없으면 미표시)
 *  body            — 본문 텍스트
 *  primaryAction   — { label: string, variant?: 'normal'|'negative', onClick: () => void }
 *  secondaryAction — { label: string, onClick: () => void } | null
 *  className       — 추가 클래스
 *
 * 사용 예:
 *  <Alert
 *    title="삭제하시겠습니까?"
 *    body="삭제된 데이터는 복구할 수 없습니다."
 *    primaryAction={{ label: '삭제', variant: 'negative', onClick: handleDelete }}
 *    secondaryAction={{ label: '취소', onClick: handleCancel }}
 *  />
 *  <Alert platform="android" title="알림" body="내용" primaryAction={{ label: '확인', onClick: fn }} />
 */

import { useRef } from 'react'
import { useFocusTrap } from '../../../lib/useFocusTrap.js'

/* ── 액션 버튼 색상 맵 (Web / Android) ──────────────────────── */
const ACTION_COLOR = {
  normal:   'var(--color-primary-normal)',
  negative: 'var(--color-status-negative)',
  assistive: 'var(--color-label-alternative)',
}

/* ── Web / Android 공통 텍스트 버튼 ────────────────────────── */
function TextActionButton({ label, color, onClick }) {
  return (
    <button
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        paddingTop:     'var(--spacing-4)',
        paddingBottom:  'var(--spacing-4)',
        background:     'none',
        border:         'none',
        cursor:         'pointer',
        fontSize:       'var(--font-size-body-1)',
        lineHeight:     'var(--line-height-body-1-normal)',
        letterSpacing:  'var(--letter-spacing-body-1)',
        fontWeight:     'var(--font-weight-semibold)',
        color,
        whiteSpace:     'nowrap',
        flexShrink:     0,
      }}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

/* ── iOS 전용 버튼 ──────────────────────────────────────────── */
function IOSActionButton({ label, isPrimary, onClick }) {
  return (
    <button
      style={{
        display:         'flex',
        flex:            '1 0 0',
        alignItems:      'center',
        justifyContent:  'center',
        paddingTop:      '13px',
        paddingBottom:   '13px',
        paddingLeft:     'var(--spacing-16)',
        paddingRight:    'var(--spacing-16)',
        borderRadius:    '100px',
        border:          'none',
        cursor:          'pointer',
        backgroundColor: isPrimary
          ? 'var(--color-ios-accent-primary)'
          : 'var(--color-ios-fill-secondary)',
        color:           isPrimary
          ? 'var(--color-static-white)'
          : 'var(--color-static-black)',
        fontSize:        '17px',
        lineHeight:      '22px',
        letterSpacing:   '-0.43px',
        fontWeight:      isPrimary ? 600 : 600,
        fontFamily:      "system-ui, -apple-system, sans-serif",
        whiteSpace:      'nowrap',
        flexShrink:      0,
      }}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

/* ── 메인 컴포넌트 ──────────────────────────────────────────── */
export default function Alert({
  platform        = 'web',
  title,
  body            = '',
  primaryAction,
  secondaryAction = null,
  className       = '',
}) {
  // 다이얼로그 포커스 트랩 + 복원 (마운트되어 있는 동안 활성)
  const dialogRef = useRef(null)
  useFocusTrap(dialogRef, true)

  /* ── iOS ────────────────────────────────────────────────── */
  if (platform === 'ios') {
    return (
      <div
        style={{
          position:       'relative',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          width:          '100%',
          height:         '100%',
        }}
        className={className}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={title ? 'alert-title' : undefined}
        aria-describedby="alert-body"
        ref={dialogRef}
        tabIndex={-1}
      >
        {/* 전체 배경 dimmer */}
        <div style={{
          position:        'absolute',
          inset:           0,
          backgroundColor: 'var(--color-static-black)',
          opacity:         0.2,
        }} aria-hidden="true" />

        {/* iOS 글래스 모달 */}
        <div style={{
          position:             'relative',
          display:              'flex',
          flexDirection:        'column',
          gap:                  'var(--spacing-10)',
          alignItems:           'flex-start',
          padding:              '14px',
          borderRadius:         '14px',
          width:                '270px',
          backdropFilter:       'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          backgroundColor:      'var(--color-ios-glass-background)',
          boxSizing:            'border-box',
        }}>
          {/* 본문 */}
          <div style={{
            display:        'flex',
            flexDirection:  'column',
            gap:            'var(--spacing-10)',
            alignItems:     'center',
            justifyContent: 'center',
            width:          '100%',
            paddingTop:     'var(--spacing-8)',
            paddingBottom:  '24px',
            paddingLeft:    'var(--spacing-8)',
            paddingRight:   'var(--spacing-8)',
            boxSizing:      'border-box',
          }}>
            {title && (
              <p
                id="alert-title"
                style={{
                  fontSize:    '17px',
                  lineHeight:  '22px',
                  letterSpacing: '-0.43px',
                  fontWeight:  600,
                  fontFamily:  "system-ui, -apple-system, sans-serif",
                  color:       'var(--color-static-black)',
                  width:       '100%',
                  flexShrink:  0,
                }}
              >
                {title}
              </p>
            )}
            <p
              id="alert-body"
              style={{
                fontSize:    '17px',
                lineHeight:  '22px',
                letterSpacing: '-0.43px',
                fontWeight:  400,
                fontFamily:  "system-ui, -apple-system, sans-serif",
                color:       'var(--color-static-black)',
                width:       '100%',
                flexShrink:  0,
              }}
            >
              {body}
            </p>
          </div>

          {/* 버튼 영역 */}
          <div style={{
            display:  'flex',
            flexDirection: 'row',
            gap:      'var(--spacing-16)',
            width:    '100%',
            boxSizing: 'border-box',
          }}>
            {secondaryAction && (
              <IOSActionButton
                label={secondaryAction.label}
                isPrimary={false}
                onClick={secondaryAction.onClick}
              />
            )}
            {primaryAction && (
              <IOSActionButton
                label={primaryAction.label}
                isPrimary={true}
                onClick={primaryAction.onClick}
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  /* ── Android / Web 공통 ─────────────────────────────────── */
  const isAndroid = platform === 'android'

  const modalRadius   = isAndroid ? '16px' : '12px'
  const infoPadding   = isAndroid ? '28px' : 'var(--spacing-20)'
  const infoGap       = isAndroid ? 'var(--spacing-8)' : 'var(--spacing-6)'
  const actionPadding = isAndroid
    ? { paddingBottom: 'var(--spacing-20)', paddingLeft: '28px', paddingRight: '28px' }
    : { paddingBottom: 'var(--spacing-12)', paddingLeft: 'var(--spacing-20)', paddingRight: 'var(--spacing-20)' }

  const titleStyle = isAndroid
    ? {
        fontSize:      'var(--font-size-heading-2)',
        lineHeight:    'var(--line-height-heading-2)',
        letterSpacing: 'var(--letter-spacing-heading-2)',
        fontWeight:    'var(--font-weight-semibold)',
        color:         'var(--color-label-normal)',
      }
    : {
        fontSize:      'var(--font-size-headline-1)',
        lineHeight:    'var(--line-height-headline-1)',
        letterSpacing: 'var(--letter-spacing-headline-1)',
        fontWeight:    'var(--font-weight-semibold)',
        color:         'var(--color-label-normal)',
      }

  const primaryColor = primaryAction?.variant === 'negative'
    ? ACTION_COLOR.negative
    : ACTION_COLOR.normal

  return (
    <div
      style={{
        position:       'relative',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        width:          '100%',
        height:         '100%',
        overflow:       'hidden',
        paddingLeft:    'var(--spacing-20)',
        paddingRight:   'var(--spacing-20)',
        boxSizing:      'border-box',
      }}
      className={className}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={title ? 'alert-title' : undefined}
      aria-describedby="alert-body"
      ref={dialogRef}
      tabIndex={-1}
    >
      {/* 전체 배경 dimmer */}
      <div style={{
        position:        'absolute',
        inset:           0,
        backgroundColor: 'var(--color-material-dimmer)',
        opacity:         0.43,
      }} aria-hidden="true" />

      {/* 모달 카드 */}
      <div style={{
        position:        'relative',
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'flex-start',
        minWidth:        '320px',
        maxWidth:        '400px',
        width:           '100%',
        backgroundColor: 'var(--color-bg-elevated)',
        borderRadius:    modalRadius,
        overflow:        'hidden',
        flexShrink:      0,
      }}>
        {/* 정보 영역 */}
        <div style={{
          display:       'flex',
          flexDirection: 'column',
          gap:           infoGap,
          alignItems:    'flex-start',
          padding:       infoPadding,
          width:         '100%',
          boxSizing:     'border-box',
        }}>
          {title && (
            <p id="alert-title" style={{ ...titleStyle, width: '100%', flexShrink: 0 }}>
              {title}
            </p>
          )}
          <p
            id="alert-body"
            style={{
              fontSize:      'var(--font-size-body-2)',
              lineHeight:    'var(--line-height-body-2-normal)',
              letterSpacing: 'var(--letter-spacing-body-2)',
              fontWeight:    'var(--font-weight-regular)',
              color:         'var(--color-label-alternative)',
              width:         '100%',
              flexShrink:    0,
            }}
          >
            {body}
          </p>
        </div>

        {/* 액션 영역 */}
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'flex-end',
          gap:            'var(--spacing-24)',
          width:          '100%',
          boxSizing:      'border-box',
          ...actionPadding,
        }}>
          {secondaryAction && (
            <TextActionButton
              label={secondaryAction.label}
              color={ACTION_COLOR.assistive}
              onClick={secondaryAction.onClick}
            />
          )}
          {primaryAction && (
            <TextActionButton
              label={primaryAction.label}
              color={primaryColor}
              onClick={primaryAction.onClick}
            />
          )}
        </div>
      </div>
    </div>
  )
}
