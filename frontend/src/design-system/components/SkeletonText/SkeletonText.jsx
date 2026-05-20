/**
 * SkeletonText 컴포넌트
 *
 * 텍스트 자리를 일시적으로 표시할 때 사용합니다.
 * 로딩 중 텍스트 영역을 회색 바로 대체합니다.
 *
 * Props:
 *  color     — 'normal' | 'white'                    기본: 'normal'
 *              normal: var(--color-fill-normal) 배경
 *              white:  var(--color-static-white) + opacity 0.28 (어두운 배경 위)
 *  length    — '100%' | '75%' | '50%' | '25%'        기본: '100%'
 *              바의 너비 비율
 *  align     — 'leading' | 'center' | 'trailing'     기본: 'leading'
 *              length < 100% 일 때 바의 정렬 방향
 *  height    — 컨테이너 높이 (px)                     기본: 22
 *  className — 추가 클래스
 *
 * 사용 예:
 *  <SkeletonText />
 *  <SkeletonText length="75%" />
 *  <SkeletonText length="50%" align="center" />
 *  <SkeletonText color="white" length="75%" align="trailing" />
 *  <SkeletonText height={18} length="100%" />
 */

const ALIGN_MAP = {
  leading:  'flex-start',
  center:   'center',
  trailing: 'flex-end',
}

export default function SkeletonText({
  color     = 'normal',
  length    = '100%',
  align     = 'leading',
  height    = 22,
  className = '',
}) {
  const isWhite = color === 'white'

  const outerStyle = {
    position: 'relative',
    height:   `${height}px`,
    width:    '100%',
    flexShrink: 0,
  }

  const paddingStyle = {
    position:       'absolute',
    inset:          0,
    display:        'flex',
    alignItems:     'flex-start',
    justifyContent: ALIGN_MAP[align] ?? 'flex-start',
    paddingTop:     'var(--spacing-2)',
    paddingBottom:  'var(--spacing-2)',
  }

  const barStyle = {
    width:           length,
    height:          '100%',
    minWidth:        0,
    borderRadius:    'var(--spacing-3)',
    backgroundColor: isWhite
      ? 'var(--color-static-white)'
      : 'var(--color-fill-normal)',
    opacity:         isWhite ? 0.28 : 1,
    flexShrink:      0,
  }

  return (
    <div style={outerStyle} className={className} aria-hidden="true">
      <div style={paddingStyle}>
        <div style={barStyle} />
      </div>
    </div>
  )
}
