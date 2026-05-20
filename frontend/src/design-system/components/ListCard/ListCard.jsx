/**
 * ListCard 컴포넌트
 *
 * 표시할 양이 많은 정보를 묶어 표시할 때 사용합니다.
 * 썸네일 + 텍스트가 가로로 나열되는 리스트형 카드입니다.
 *
 * Props:
 *  platform       — 'desktop' | 'mobile'     기본: 'desktop'
 *                   desktop: gap 16px, 썸네일 120px, 제목 body-1/semibold
 *                   mobile:  gap 12px, 썸네일 96px,  제목 body-2/semibold
 *  src            — 썸네일 이미지 URL          기본: ''
 *  alt            — 이미지 alt 텍스트          기본: ''
 *  title          — 카드 제목                  기본: ''
 *  caption        — 캡션 텍스트 (있으면 표시)   기본: ''
 *  extraCaption   — 추가 캡션 (있으면 표시)     기본: ''
 *  skeleton       — 스켈레톤 로딩 상태          기본: false
 *  topContent     — ReactNode  제목 위 슬롯    기본: null
 *  bottomContent  — ReactNode  캡션 아래 슬롯  기본: null
 *  leadingContent — ReactNode  썸네일 왼쪽 슬롯 기본: null
 *  trailingContent — ReactNode 텍스트 오른쪽 슬롯 기본: null
 *  className      — 추가 클래스
 *
 * 사용 예:
 *  <ListCard src="/img.jpg" title="제목" caption="캡션" />
 *  <ListCard platform="mobile" src="/img.jpg" title="제목" />
 *  <ListCard src="/img.jpg" title="제목" trailingContent={<Icon name="chevronRight" />} />
 *  <ListCard src="/img.jpg" title="제목" leadingContent={<Checkbox />} />
 *  <ListCard skeleton />
 */

const PLATFORM = {
  desktop: {
    gap:               'var(--spacing-16)',
    thumbnailWidth:    '120px',
    titleFontSize:     'var(--font-size-body-1)',
    titleLineHeight:   'var(--line-height-body-1-normal)',
    titleLetterSpacing:'var(--letter-spacing-body-1)',
  },
  mobile: {
    gap:               'var(--spacing-12)',
    thumbnailWidth:    '96px',
    titleFontSize:     'var(--font-size-body-2)',
    titleLineHeight:   'var(--line-height-body-2-normal)',
    titleLetterSpacing:'var(--letter-spacing-body-2)',
  },
}

export default function ListCard({
  platform        = 'desktop',
  src             = '',
  alt             = '',
  title           = '',
  caption         = '',
  extraCaption    = '',
  skeleton        = false,
  topContent      = null,
  bottomContent   = null,
  leadingContent  = null,
  trailingContent = null,
  className       = '',
}) {
  const p = PLATFORM[platform] ?? PLATFORM.desktop

  /* ── 외부 래퍼 ── */
  const outerStyle = {
    display:    'flex',
    flexDirection: 'row',
    gap:        p.gap,
    alignItems: 'center',
    width:      '100%',
  }

  /* ── 썸네일 ── */
  const thumbWrapStyle = {
    position:        'relative',
    width:           p.thumbnailWidth,
    aspectRatio:     '3/2',
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

  const thumbBorderStyle = {
    position:     'absolute',
    inset:        0,
    border:       '1px solid var(--color-line-alternative)',
    borderRadius: 'var(--spacing-12)',
    pointerEvents:'none',
  }

  /* ── 컨테이너 (썸네일 오른쪽) ── */
  const containerStyle = {
    display:    'flex',
    flexDirection: 'row',
    flex:       '1 0 0',
    gap:        p.gap,
    alignItems: 'center',
    minWidth:   0,
  }

  /* ── 텍스트 래퍼 ── */
  const wrapperStyle = {
    display:       'flex',
    flexDirection: 'column',
    flex:          '1 0 0',
    gap:           'var(--spacing-8)',
    alignItems:    'flex-start',
    minWidth:      0,
  }

  /* ── 텍스트 콘텐츠 블록 ── */
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

  /* ── 스켈레톤 rect ── */
  const skeletonRect = (width = '100%', height = 'var(--spacing-16)') => ({
    backgroundColor: 'var(--color-fill-normal)',
    borderRadius:    'var(--spacing-4)',
    width,
    height,
    flexShrink:      0,
  })

  return (
    <div style={outerStyle} className={className}>

      {/* 좌측 슬롯 */}
      {leadingContent && (
        <div style={{ flexShrink: 0 }}>
          {leadingContent}
        </div>
      )}

      {/* 썸네일 */}
      <div style={thumbWrapStyle}>
        {!skeleton && src && (
          <img src={src} alt={alt} style={imgStyle} draggable={false} />
        )}
        <div aria-hidden="true" style={thumbBorderStyle} />
      </div>

      {/* 컨테이너 */}
      <div style={containerStyle}>

        {/* 텍스트 래퍼 */}
        <div style={wrapperStyle}>
          {topContent && (
            <div style={{ width: '100%', flexShrink: 0 }}>
              {topContent}
            </div>
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
            <div style={{ width: '100%', flexShrink: 0 }}>
              {bottomContent}
            </div>
          )}
        </div>

        {/* 우측 슬롯 */}
        {trailingContent && (
          <div style={{ flexShrink: 0 }}>
            {trailingContent}
          </div>
        )}
      </div>
    </div>
  )
}
