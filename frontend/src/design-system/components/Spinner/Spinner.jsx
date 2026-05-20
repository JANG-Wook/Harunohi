/**
 * Spinner 컴포넌트 (Circular Loading)
 *
 * 로드 시간이 적은 일반적인 상황에서 사용합니다.
 * CSS border 기법으로 구현된 원형 로딩 인디케이터입니다.
 *
 * Props:
 *  size       — 스피너 크기 (px)                              기본: 28
 *  color      — 호(arc) 색상. CSS 변수 문자열                  기본: 'var(--color-primary-normal)'
 *  trackColor — 배경 링 색상. CSS 변수 문자열                  기본: 'var(--color-line-solid-normal)'
 *  animate    — true | false  회전 애니메이션 on/off           기본: true
 *  className  — 추가 클래스
 *
 * 사용 예:
 *  <Spinner />
 *  <Spinner size={20} />
 *  <Spinner color="var(--color-status-positive)" />
 *  <Spinner animate={false} />   // 정적 상태
 */

export default function Spinner({
  size       = 28,
  color      = 'var(--color-primary-normal)',
  trackColor = 'var(--color-line-solid-normal)',
  animate    = true,
  className  = '',
}) {
  /* 사이즈 대비 적절한 테두리 두께: 28px → 3px, 최소 2px */
  const borderWidth = Math.max(2, Math.round(size * 0.107))

  const spinnerStyle = {
    display:      'inline-block',
    width:        `${size}px`,
    height:       `${size}px`,
    borderRadius: '50%',
    border:       `${borderWidth}px solid ${trackColor}`,
    borderTopColor: color,
    flexShrink:   0,
    boxSizing:    'border-box',
    animation:    animate ? 'ax-spin 0.8s linear infinite' : 'none',
  }

  return (
    <span
      role="status"
      aria-label="로딩 중"
      style={spinnerStyle}
      className={className}
    />
  )
}
