/**
 * PageIndicatorCounter 컴포넌트
 *
 * 이미지 묶음에서 현재/전체 페이지를 숫자로 표시하는 페이지네이션 인디케이터입니다.
 *
 * Props:
 *  current     — 현재 페이지 (string | number)   기본: '1'
 *  total       — 전체 페이지 (string | number)   기본: '10'
 *  size        — 'small' | 'medium'              기본: 'medium'
 *  alternative — true | false                    기본: false
 *               false: iOS 유리모피즘 (backdropFilter blur)
 *               true:  Android 불투명 배경
 *  className   — 추가 클래스
 *
 * 사용 예:
 *  <PageIndicatorCounter current={3} total={12} />
 *  <PageIndicatorCounter current="5" total="20" size="small" />
 *  <PageIndicatorCounter current={2} total={8} alternative />
 */

const SIZE_STYLE = {
  medium: {
    paddingTop:    'var(--spacing-6)',
    paddingBottom: 'var(--spacing-6)',
    paddingLeft:   'var(--spacing-12)',
    paddingRight:  'var(--spacing-12)',
    gap:           'var(--spacing-4)',
    fontSize:      'var(--font-size-body-2)',
    lineHeight:    'var(--line-height-body-2-normal)',
    letterSpacing: 'var(--letter-spacing-body-2)',
  },
  small: {
    paddingTop:    'var(--spacing-4)',
    paddingBottom: 'var(--spacing-4)',
    paddingLeft:   'var(--spacing-10)',
    paddingRight:  'var(--spacing-10)',
    gap:           'var(--spacing-3)',
    fontSize:      'var(--font-size-label-2)',
    lineHeight:    'var(--line-height-label-2)',
    letterSpacing: 'var(--letter-spacing-label-2)',
  },
}

export default function PageIndicatorCounter({
  current   = '1',
  total     = '10',
  size      = 'medium',
  alternative = false,
  className = '',
}) {
  const s = SIZE_STYLE[size] ?? SIZE_STYLE.medium

  const outerStyle = {
    position:       'relative',
    display:        'inline-flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    backdropFilter: alternative ? undefined : 'blur(32px)',
    WebkitBackdropFilter: alternative ? undefined : 'blur(32px)',
  }

  const contentStyle = {
    display:       'flex',
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           s.gap,
    paddingTop:    s.paddingTop,
    paddingBottom: s.paddingBottom,
    paddingLeft:   s.paddingLeft,
    paddingRight:  s.paddingRight,
    position:      'relative',
    fontSize:      s.fontSize,
    lineHeight:    s.lineHeight,
    letterSpacing: s.letterSpacing,
    whiteSpace:    'nowrap',
    textAlign:     'center',
    fontStyle:     'normal',
  }

  return (
    <div style={outerStyle} className={className} aria-label={`${current} / ${total}`}>
      {/* 배경 레이어 */}
      <div style={{
        position: 'absolute',
        inset:    0,
        overflow: 'clip',
        borderRadius: 'var(--radius-full)',
      }} aria-hidden="true">
        {alternative ? (
          /* Android: 단일 불투명 배경 */
          <div style={{
            position:        'absolute',
            inset:           0,
            borderRadius:    'var(--radius-full)',
            backgroundColor: 'var(--color-cool-neutral-30)',
            opacity:         0.61,
          }} />
        ) : (
          /* iOS: 유리모피즘 이중 레이어 */
          <>
            <div style={{
              position:        'absolute',
              inset:           0,
              borderRadius:    'var(--radius-full)',
              backgroundColor: 'var(--color-static-white)',
              opacity:         0.35,
              mixBlendMode:    'plus-lighter',
            }} />
            <div style={{
              position:        'absolute',
              inset:           0,
              borderRadius:    'var(--radius-full)',
              backgroundColor: 'var(--color-static-black)',
              opacity:         0.28,
            }} />
          </>
        )}
      </div>

      {/* 텍스트 콘텐츠 */}
      <div style={contentStyle}>
        {/* 현재 페이지 */}
        <span style={{
          fontWeight:          'var(--font-weight-semibold)',
          position:            'relative',
          flexShrink:          0,
          color:               alternative ? 'var(--color-static-white)' : 'var(--color-interaction-inactive)',
          opacity:             alternative ? 0.88 : 0.74,
          mixBlendMode:        alternative ? undefined : 'plus-lighter',
          textShadow:          'var(--shadow-page-indicator-text)',
          fontFeatureSettings: "'ss10' 1",
        }}>
          {current}
        </span>

        {/* 구분자 */}
        <span style={{
          fontWeight:          'var(--font-weight-regular)',
          position:            'relative',
          flexShrink:          0,
          color:               alternative ? 'var(--color-static-white)' : 'var(--color-interaction-inactive)',
          opacity:             alternative ? 0.52 : 0.28,
          mixBlendMode:        alternative ? undefined : 'plus-lighter',
          fontFeatureSettings: "'ss10' 1",
        }}>
          /
        </span>

        {/* 전체 페이지 */}
        <span style={{
          fontWeight:          'var(--font-weight-semibold)',
          position:            'relative',
          flexShrink:          0,
          color:               alternative ? 'var(--color-static-white)' : 'var(--color-interaction-inactive)',
          opacity:             alternative ? 0.88 : 0.74,
          mixBlendMode:        alternative ? undefined : 'plus-lighter',
          fontFeatureSettings: "'ss10' 1",
        }}>
          {total}
        </span>
      </div>
    </div>
  )
}
