/**
 * Thumbnail 컴포넌트
 *
 * 일정한 비율의 작은 이미지로 콘텐츠를 미리 보여줍니다.
 * 이미지를 항상 같은 비율로 표시할 때 사용합니다.
 *
 * Props:
 *  src       — 이미지 URL. 없으면 빈 배경 표시
 *  alt       — 이미지 alt 텍스트                   기본: ''
 *  ratio     — CSS aspect-ratio 포맷 문자열         기본: '1/1'
 *              예: '1/1', '16/9', '4/3', '3/2', '9/16', '3/4'
 *  radius    — true | false  모서리 12px 둥글게     기본: false
 *  border    — true | false  내부 테두리 표시       기본: false
 *  overlay   — ReactNode     이미지 위 오버레이 콘텐츠 기본: null
 *  className — 추가 클래스
 *
 * 사용 예:
 *  <Thumbnail src="/img.jpg" alt="썸네일" />
 *  <Thumbnail src="/img.jpg" ratio="16/9" radius />
 *  <Thumbnail src="/img.jpg" ratio="4/3" border radius overlay={<PlaytimeBadge time="1:23" />} />
 *  <Thumbnail ratio="1/1" radius />   // src 없으면 빈 배경
 */

export default function Thumbnail({
  src       = '',
  alt       = '',
  ratio     = '1/1',
  radius    = false,
  border    = false,
  overlay   = null,
  className = '',
}) {
  const borderRadius = radius ? 'var(--spacing-12)' : '0px'

  const outerStyle = {
    position:     'relative',
    width:        '100%',
    aspectRatio:  ratio,
    borderRadius,
    overflow:     'hidden',
    display:      'block',
    flexShrink:   0,
    backgroundColor: 'var(--color-fill-normal)',
  }

  const imgStyle = {
    position:   'absolute',
    inset:      0,
    width:      '100%',
    height:     '100%',
    objectFit:  'cover',
    display:    'block',
  }

  const borderStyle = {
    position:     'absolute',
    inset:        0,
    borderRadius,
    border:       '1px solid var(--color-line-neutral)',
    pointerEvents: 'none',
  }

  const overlayStyle = {
    position:       'absolute',
    inset:          0,
    overflow:       'hidden',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
  }

  return (
    <div style={outerStyle} className={className}>
      {src && (
        <img
          src={src}
          alt={alt}
          style={imgStyle}
          draggable={false}
        />
      )}

      {border && (
        <div aria-hidden="true" style={borderStyle} />
      )}

      {overlay && (
        <div style={overlayStyle}>
          {overlay}
        </div>
      )}
    </div>
  )
}
