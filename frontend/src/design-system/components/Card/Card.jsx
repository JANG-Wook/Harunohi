/**
 * Card 컴포넌트
 *
 * 일반적인 상황에서 정보를 묶어 표시할 때 사용합니다.
 *
 * Props:
 *  platform       — 'desktop' | 'mobile'     기본: 'desktop'
 *                   desktop: 외부 gap 8px, 썸네일 3/2 비율, 제목 body-1/semibold
 *                   mobile:  외부 gap 6px, 썸네일 4/3 비율, 제목 body-2/semibold
 *  src            — 썸네일 이미지 URL          기본: ''
 *  alt            — 이미지 alt 텍스트          기본: ''
 *  title          — 카드 제목                  기본: ''
 *  caption        — 캡션 텍스트 (있으면 표시)   기본: ''
 *  extraCaption   — 추가 캡션 (있으면 표시)     기본: ''
 *  thumbnailOverlay — 썸네일 오버레이 표시      기본: true
 *  overlayCaption — 오버레이 위 캡션 텍스트     기본: ''
 *  saved          — 북마크 활성 상태            기본: false
 *  onToggleSave   — 북마크 토글 콜백 () => void
 *  onClick        — 카드 클릭 핸들러
 *  skeleton       — 스켈레톤 로딩 상태          기본: false
 *  topContent     — ReactNode  제목 위 슬롯    기본: null
 *  bottomContent  — ReactNode  캡션 아래 슬롯  기본: null
 *  className      — 추가 클래스
 *
 * 사용 예:
 *  <Card src="/img.jpg" title="제목" caption="캡션" />
 *  <Card platform="mobile" src="/img.jpg" title="제목" caption="캡션" />
 *  <Card src="/img.jpg" title="제목" saved onToggleSave={toggle} onClick={goDetail} />
 *  <Card src="/img.jpg" title="제목" overlayCaption="D-3" thumbnailOverlay />
 *  <Card src="/img.jpg" title="제목" bottomContent={<Badge />} />
 *  <Card skeleton />
 */

import { useState } from 'react'
import Icon from '../Icon/Icon'
import IconButtonNormal from '../IconButton/IconButtonNormal'

const PLATFORM = {
  desktop: {
    outerGap:           'var(--spacing-8)',
    thumbnailRatio:     '3/2',
    overlayPadding:     'var(--spacing-14)',
    titleFontSize:      'var(--font-size-body-1)',
    titleLineHeight:    'var(--line-height-body-1-normal)',
    titleLetterSpacing: 'var(--letter-spacing-body-1)',
    overlayCaptionSize: 'var(--font-size-label-2)',
    overlayCaptionLH:   'var(--line-height-label-2)',
    overlayCaptionLS:   'var(--letter-spacing-label-2)',
    toggleIconSize:     24,
    containerPaddingX:  'var(--spacing-6)',
  },
  mobile: {
    outerGap:           'var(--spacing-6)',
    thumbnailRatio:     '4/3',
    overlayPadding:     'var(--spacing-10)',
    titleFontSize:      'var(--font-size-body-2)',
    titleLineHeight:    'var(--line-height-body-2-normal)',
    titleLetterSpacing: 'var(--letter-spacing-body-2)',
    overlayCaptionSize: 'var(--font-size-caption-1)',
    overlayCaptionLH:   'var(--line-height-caption-1)',
    overlayCaptionLS:   'var(--letter-spacing-caption-1)',
    toggleIconSize:     20,
    containerPaddingX:  0,
  },
}

/* ── 인터랙션 오버레이 opacity ───────────────────────────────── */
const OVERLAY_OPACITY = { hovered: 0.05, focused: 0.08, pressed: 0.12 }

export default function Card({
  platform         = 'desktop',
  src              = '',
  alt              = '',
  title            = '',
  caption          = '',
  extraCaption     = '',
  thumbnailOverlay = true,
  overlayCaption   = '',
  saved            = false,
  onToggleSave     = null,
  onClick          = null,
  skeleton         = false,
  topContent       = null,
  bottomContent    = null,
  className        = '',
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const p = PLATFORM[platform] ?? PLATFORM.desktop
  const isClickable = !!onClick

  const overlayOpacity = !isClickable ? 0
    : isPressed                       ? OVERLAY_OPACITY.pressed
    : isFocused                       ? OVERLAY_OPACITY.focused
    : isHovered                       ? OVERLAY_OPACITY.hovered
    : 0

  const outerStyle = {
    display:       'flex',
    flexDirection: 'column',
    gap:           p.outerGap,
    alignItems:    'flex-start',
    width:         '100%',
    cursor:        isClickable ? 'pointer' : 'default',
    outline:       'none',
  }

  const thumbWrapStyle = {
    position:        'relative',
    width:           '100%',
    aspectRatio:     p.thumbnailRatio,
    borderRadius:    'var(--spacing-12)',
    overflow:        'hidden',
    flexShrink:      0,
    backgroundColor: 'var(--color-fill-normal)',
  }

  const imgStyle = {
    position:  'absolute',
    inset:     0,
    width:     '100%',
    height:    '100%',
    objectFit: 'cover',
    display:   'block',
  }

  const overlayStyle = {
    position:  'absolute',
    inset:     0,
    padding:   p.overlayPadding,
    display:   'flex',
    gap:       'var(--spacing-4)',
    alignItems:'flex-start',
  }

  const gradientStyle = {
    position:      'absolute',
    inset:         0,
    background:    'linear-gradient(to bottom, var(--color-static-black), transparent)',
    opacity:       0.35,
    pointerEvents: 'none',
  }

  const overlayCaptionStyle = {
    flex:          '1 0 0',
    fontSize:      p.overlayCaptionSize,
    fontWeight:    'var(--font-weight-semibold)',
    lineHeight:    p.overlayCaptionLH,
    letterSpacing: p.overlayCaptionLS,
    color:         'var(--color-static-white)',
    textShadow:    'var(--shadow-text-overlay)',
    minWidth:      0,
  }

  const thumbBorderStyle = {
    position:      'absolute',
    inset:         0,
    border:        '1px solid var(--color-line-alternative)',
    borderRadius:  'var(--spacing-12)',
    pointerEvents: 'none',
  }

  const infoStyle = {
    display:       'flex',
    flexDirection: 'column',
    gap:           'var(--spacing-6)',
    alignItems:    'flex-start',
    paddingLeft:   p.containerPaddingX,
    paddingRight:  p.containerPaddingX,
    width:         '100%',
    flexShrink:    0,
  }

  const contentStyle = {
    display:       'flex',
    flexDirection: 'column',
    gap:           'var(--spacing-4)',
    alignItems:    'flex-start',
    width:         '100%',
    flexShrink:    0,
  }

  const titleStyle = {
    fontSize:      p.titleFontSize,
    fontWeight:    'var(--font-weight-semibold)',
    lineHeight:    p.titleLineHeight,
    letterSpacing: p.titleLetterSpacing,
    color:         'var(--color-label-normal)',
    width:         '100%',
  }

  const captionStyle = {
    fontSize:      'var(--font-size-label-2)',
    fontWeight:    'var(--font-weight-medium)',
    lineHeight:    'var(--line-height-label-2)',
    letterSpacing: 'var(--letter-spacing-label-2)',
    color:         'var(--color-label-alternative)',
    width:         '100%',
  }

  const skeletonRect = (width = '100%', height = 'var(--spacing-16)') => ({
    backgroundColor: 'var(--color-fill-normal)',
    borderRadius:    'var(--spacing-4)',
    width,
    height,
    flexShrink:      0,
  })

  const handleSaveClick = (e) => {
    e.stopPropagation()
    onToggleSave?.()
  }

  const cardEvents = isClickable ? {
    onClick,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => { setIsHovered(false); setIsPressed(false) },
    onMouseDown:  () => setIsPressed(true),
    onMouseUp:    () => setIsPressed(false),
    onFocus:      () => setIsFocused(true),
    onBlur:       () => { setIsFocused(false); setIsPressed(false) },
    tabIndex:     0,
  } : {}

  return (
    <div style={outerStyle} className={className} {...cardEvents}>

      {/* ── 썸네일 영역 ── */}
      <div style={thumbWrapStyle}>
        {!skeleton && src && (
          <img src={src} alt={alt} style={imgStyle} draggable={false} />
        )}

        {/* 오버레이 */}
        {!skeleton && thumbnailOverlay && (
          <div style={overlayStyle}>
            <div aria-hidden="true" style={gradientStyle} />

            <div style={{ flex: '1 0 0', minWidth: 0 }}>
              {overlayCaption && (
                <span style={overlayCaptionStyle}>{overlayCaption}</span>
              )}
            </div>

            {(onToggleSave !== null || saved) && (
              <div style={{ margin: 'calc(-1 * var(--spacing-8))' }}>
                <IconButtonNormal
                  aria-label={saved ? '북마크 해제' : '북마크'}
                  aria-pressed={saved}
                  color="var(--color-static-white)"
                  onClick={onToggleSave ? handleSaveClick : undefined}
                  icon={<Icon name={saved ? 'bookmarkFill' : 'bookmark'} size={p.toggleIconSize} />}
                />
              </div>
            )}
          </div>
        )}

        {/* 인터랙션 오버레이 (클릭 가능한 카드에만 표시) */}
        {isClickable && (
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
        )}

        <div aria-hidden="true" style={thumbBorderStyle} />
      </div>

      {/* ── 정보 영역 ── */}
      <div style={infoStyle}>
        {topContent && (
          <div style={{ width: '100%', flexShrink: 0 }}>{topContent}</div>
        )}

        <div style={contentStyle}>
          {skeleton ? (
            <>
              <div style={skeletonRect('70%', 'var(--spacing-20)')} />
              <div style={skeletonRect('50%', 'var(--spacing-16)')} />
            </>
          ) : (
            <>
              {title        && <span style={titleStyle}>{title}</span>}
              {caption      && <span style={captionStyle}>{caption}</span>}
              {extraCaption && <span style={captionStyle}>{extraCaption}</span>}
            </>
          )}
        </div>

        {bottomContent && (
          <div style={{ width: '100%', flexShrink: 0 }}>{bottomContent}</div>
        )}
      </div>
    </div>
  )
}
