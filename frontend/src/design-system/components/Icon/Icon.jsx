/**
 * Icon 컴포넌트
 *
 * Props:
 *  name      — 아이콘 이름 (camelCase). 예: 'arrowDown', 'chevronLeft', 'navigationCareer'
 *  size      — 아이콘 크기. 숫자(px) 또는 named variant 기본: 24
 *              named: 'xsmall'(16) | 'small'(20) | 'medium'(28) | 'large'(32) | 'xlarge'(24)
 *  color     — 색상. 기본: currentColor (부모 색상 상속)
 *  className — 추가 클래스
 *
 * 사용 예:
 *  <Icon name="arrowDown" />
 *  <Icon name="star" size="medium" color="var(--color-primary-normal)" />
 *  <Icon name="arrowDownThick" size={20} color="var(--color-primary-normal)" />
 *  <Icon name="navigationCareer" size="large" />
 */

const SIZE_MAP = {
  xsmall: 16,
  small:  20,
  medium: 28,
  large:  32,
  xlarge: 24,
}

const normalModules = import.meta.glob(
  '../../icons/normal/*.svg',
  { eager: true, query: '?react', import: 'default' }
)
const navigationModules = import.meta.glob(
  '../../icons/navigation/*.svg',
  { eager: true, query: '?react', import: 'default' }
)

function buildMap(modules, prefix) {
  const map = {}
  for (const [path, Component] of Object.entries(modules)) {
    const filename = path.split('/').pop().replace('.svg', '')
    map[prefix ? prefix + filename.charAt(0).toUpperCase() + filename.slice(1) : filename] = Component
    // navigation 아이콘은 'navigationCareer' 형태로 이미 prefix 포함
    map[filename] = Component
  }
  return map
}

const iconMap = {
  ...buildMap(normalModules, ''),
  ...buildMap(navigationModules, ''),
}

export default function Icon({
  name,
  size = 24,
  color = 'currentColor',
  className = '',
  ...props
}) {
  const resolvedSize = typeof size === 'string' ? (SIZE_MAP[size] ?? 24) : size
  const SvgComponent = iconMap[name]

  if (!SvgComponent) {
    if (import.meta.env.DEV) {
      console.warn(`[Icon] 아이콘을 찾을 수 없습니다: "${name}"`)
    }
    return null
  }

  return (
    <SvgComponent
      width={resolvedSize}
      height={resolvedSize}
      style={{ color }}
      className={className}
      aria-hidden="true"
      {...props}
    />
  )
}
