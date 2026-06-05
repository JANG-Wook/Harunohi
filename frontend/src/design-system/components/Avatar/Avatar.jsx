/**
 * Avatar 컴포넌트
 *
 * 사용자·기업·기관을 대표하는 프로필 이미지를 표시합니다.
 * src 없으면 variant에 맞는 플레이스홀더 아이콘을 보여줍니다.
 *
 * Props:
 *  variant     — 'person' | 'company' | 'academy'   기본: 'person'
 *                person  : 완전 원형 (border-radius 9999px)
 *                company : 둥근 사각형 (size × 0.25)
 *                academy : 둥근 사각형 (size × 0.25, company와 동일)
 *  size        — 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'   기본: 'medium'
 *                xsmall: 24px  small: 32px  medium: 40px
 *                large: 48px   xlarge: 56px
 *  src         — 이미지 URL. 없으면 플레이스홀더 표시
 *  alt         — 이미지 alt 텍스트                       기본: ''
 *  badge       — ReactNode  우측 상단 배지 슬롯           기본: null
 *  interaction — true일 때 hover/focus/press 오버레이 활성  기본: false
 *  onClick     — 클릭 핸들러. 지정 시 interaction 자동 활성
 *  className   — 추가 클래스
 *
 * 사용 예:
 *  <Avatar src="/profile.jpg" alt="홍길동" />
 *  <Avatar variant="company" size="large" src="/logo.png" alt="회사명" />
 *  <Avatar variant="person" size="medium" />                      // 플레이스홀더
 *  <Avatar src="/img.jpg" badge={<OnlineDot />} />                // 배지 슬롯
 *  <Avatar src="/img.jpg" interaction onClick={() => {}} />       // 인터랙티브
 */

import { useState } from 'react'
import Icon from '../Icon/Icon'

const SIZES = {
  xsmall: { px: 24 },
  small:  { px: 32 },
  medium: { px: 40 },
  large:  { px: 48 },
  xlarge: { px: 56 },
}

export default function Avatar({
  variant     = 'person',
  size        = 'medium',
  src         = '',
  alt         = '',
  badge       = null,
  interaction = false,
  onClick     = null,
  className   = '',
}) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [focused, setFocused] = useState(false)

  const { px } = SIZES[size]
  const isPerson    = variant === 'person'
  const borderRadius = isPerson ? '9999px' : `${Math.round(px * 0.25)}px`
  const iconSize     = Math.round(px * 0.5)
  const isInteractive = interaction || !!onClick

  const overlayOpacity = isInteractive
    ? (pressed ? 0.12 : focused ? 0.08 : hovered ? 0.05 : 0)
    : 0

  const outerStyle = {
    position:   'relative',
    display:    'inline-flex',
    flexShrink: 0,
    width:      `${px}px`,
    height:     `${px}px`,
    cursor:     isInteractive ? 'pointer' : 'default',
    outline:    'none',
  }

  const containerStyle = {
    width:           '100%',
    height:          '100%',
    borderRadius,
    overflow:        'hidden',
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: src
      ? 'var(--color-static-white)'
      : 'var(--color-fill-normal)',
    border:          '1px solid var(--color-line-alternative)',
    boxSizing:       'border-box',
    flexShrink:      0,
    position:        'relative',
  }

  const imgStyle = {
    position:  'absolute',
    inset:     0,
    width:     '100%',
    height:    '100%',
    objectFit: 'cover',
    display:   'block',
  }

  /* 배지 앵커: 우측 상단 꼭짓점에 고정, 배지 자체 크기의 50%만큼 밖으로 밀어 모서리에 걸치도록 */
  const badgeAnchorStyle = {
    position:  'absolute',
    right:     0,
    top:       0,
    transform: 'translate(50%, -50%)',
  }

  /* hover/focus/press 상태를 어둠 오버레이로 표현 */
  const overlayStyle = {
    position:        'absolute',
    inset:           0,
    backgroundColor: 'var(--color-label-normal)',
    opacity:         overlayOpacity,
    pointerEvents:   'none',
    transition:      'opacity 0.12s',
  }

  const placeholderIcon = isPerson ? 'personFill' : variant === 'academy' ? 'graduationFill' : 'companyFill'

  const interactiveHandlers = isInteractive ? {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => { setHovered(false); setPressed(false) },
    onMouseDown:  () => setPressed(true),
    onMouseUp:    () => setPressed(false),
    onFocus:      () => setFocused(true),
    onBlur:       () => { setFocused(false); setPressed(false) },
    onClick,
    onKeyDown: onClick
      ? (e) => {
          // 키보드 활성화 — Enter/Space 로 onClick 실행
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick(e)
          }
        }
      : undefined,
    tabIndex: 0,
    role:     onClick ? 'button' : undefined,
  } : {}

  return (
    <div style={outerStyle} className={className} {...interactiveHandlers}>
      <div style={containerStyle}>
        {src ? (
          <img
            src={src}
            alt={alt}
            style={imgStyle}
            draggable={false}
          />
        ) : (
          <Icon
            name={placeholderIcon}
            size={iconSize}
            color="var(--color-label-assistive)"
          />
        )}
        {isInteractive && (
          <div aria-hidden="true" style={overlayStyle} />
        )}
      </div>

      {badge && (
        <div aria-hidden="true" style={badgeAnchorStyle}>
          {badge}
        </div>
      )}
    </div>
  )
}
