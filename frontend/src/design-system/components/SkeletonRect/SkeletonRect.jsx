/**
 * SkeletonRect 컴포넌트
 *
 * 네모난 모양을 가진 콘텐츠 자리를 일시적으로 표시할 때 사용합니다.
 * 이미지, 카드, 썸네일 등 직사각형 영역의 로딩 플레이스홀더입니다.
 *
 * Props:
 *  color       — 'normal' | 'white'     기본: 'normal'
 *                normal: var(--color-fill-alternative) 배경
 *                white:  var(--color-static-white) + opacity 0.28 (어두운 배경 위)
 *  width       — 너비. 숫자(px) 또는 CSS 문자열  기본: '100%'
 *  height      — 높이. 숫자(px) 또는 CSS 문자열  기본: '100%'
 *  radius      — border-radius (px)              기본: 3
 *  aspectRatio — CSS aspect-ratio 문자열.
 *                지정 시 height 대신 비율로 높이 결정  기본: ''
 *                예: '1/1', '16/9', '3/2', '4/3'
 *  className   — 추가 클래스
 *
 * 사용 예:
 *  <SkeletonRect width={64} height={64} />
 *  <SkeletonRect width="100%" aspectRatio="3/2" />
 *  <SkeletonRect color="white" width={120} height={80} radius={12} />
 *  <SkeletonRect width="100%" height={20} radius={4} />
 */

export default function SkeletonRect({
  color       = 'normal',
  width       = '100%',
  height      = '100%',
  radius      = 3,
  aspectRatio = '',
  className   = '',
}) {
  const isWhite = color === 'white'

  const w = typeof width  === 'number' ? `${width}px`  : width
  const h = typeof height === 'number' ? `${height}px` : height

  const outerStyle = {
    display:     'flex',
    alignItems:  'center',
    justifyContent: 'center',
    position:    'relative',
    width:       w,
    ...(aspectRatio
      ? { aspectRatio }
      : { height: h }
    ),
    flexShrink: 0,
  }

  const barStyle = {
    flex:            '1 0 0',
    height:          '100%',
    minWidth:        0,
    borderRadius:    `${radius}px`,
    backgroundColor: isWhite
      ? 'var(--color-static-white)'
      : 'var(--color-fill-alternative)',
    opacity:         isWhite ? 0.28 : 1,
  }

  return (
    <div style={outerStyle} className={className} aria-hidden="true">
      <div style={barStyle} />
    </div>
  )
}
