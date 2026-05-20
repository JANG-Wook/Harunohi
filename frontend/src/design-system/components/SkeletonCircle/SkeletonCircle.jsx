/**
 * SkeletonCircle 컴포넌트
 *
 * 동그란 모양을 가진 콘텐츠 자리를 일시적으로 표시할 때 사용합니다.
 * 아바타, 프로필 이미지 등 원형 영역의 로딩 플레이스홀더입니다.
 *
 * Props:
 *  color     — 'normal' | 'white'     기본: 'normal'
 *              normal: var(--color-fill-alternative) 배경
 *              white:  var(--color-static-white) + opacity 0.28 (어두운 배경 위)
 *  size      — 지름 (px)              기본: 64
 *  className — 추가 클래스
 *
 * 사용 예:
 *  <SkeletonCircle />
 *  <SkeletonCircle size={40} />
 *  <SkeletonCircle color="white" size={48} />
 */

export default function SkeletonCircle({
  color     = 'normal',
  size      = 64,
  className = '',
}) {
  const isWhite = color === 'white'

  const outerStyle = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    position:       'relative',
    width:          `${size}px`,
    height:         `${size}px`,
    flexShrink:     0,
  }

  const circleStyle = {
    flex:            '1 0 0',
    height:          '100%',
    minWidth:        0,
    borderRadius:    '50%',
    backgroundColor: isWhite
      ? 'var(--color-static-white)'
      : 'var(--color-fill-alternative)',
    opacity:         isWhite ? 0.28 : 1,
  }

  return (
    <div style={outerStyle} className={className} aria-hidden="true">
      <div style={circleStyle} />
    </div>
  )
}
