/**
 * Divider 컴포넌트
 *
 * Props:
 *  variant  — 'normal' | 'thick'  기본: 'normal'
 *             normal: 1px / thick: 12px
 *  vertical — true | false        기본: false (가로)
 *             true = 세로 구분선 (normal 두께 고정)
 *  className — 추가 클래스
 *
 * 사용 예:
 *  <Divider />                    가로 1px, --color-line-normal
 *  <Divider variant="thick" />    가로 12px, --color-line-alternative
 *  <Divider vertical />           세로 1px, --color-line-normal
 */

export default function Divider({
  variant = 'normal',
  vertical = false,
  className = '',
  ...props
}) {
  const style = vertical
    ? {
        width:           'var(--divider-thickness-normal)',
        alignSelf:       'stretch',
        backgroundColor: 'var(--color-line-normal)',
        flexShrink:      0,
      }
    : {
        height:          variant === 'thick'
                           ? 'var(--divider-thickness-thick)'
                           : 'var(--divider-thickness-normal)',
        width:           '100%',
        backgroundColor: variant === 'thick'
                           ? 'var(--color-line-alternative)'
                           : 'var(--color-line-normal)',
      }

  return (
    <div
      role="separator"
      aria-orientation={vertical ? 'vertical' : 'horizontal'}
      style={style}
      className={className}
      {...props}
    />
  )
}
