/**
 * PaginationDots 컴포넌트
 *
 * 캐러셀에서 현재 페이지를 점(dot) 형태로 표시하는 페이지네이션입니다.
 * count > 5일 때 슬라이딩 윈도우로 5개 슬롯을 표시하며,
 * 윈도우 경계 바깥에 더 많은 페이지가 있을 경우 작은 크기의 엣지 인디케이터로 표시합니다.
 *
 * Props:
 *  count    — 전체 페이지 수                              기본: 1
 *  value    — 현재 인덱스 (0-based)                      기본: 0
 *  variant  — 'normal' | 'white'                         기본: 'normal'
 *             normal: --color-label-normal
 *             white:  --color-static-white
 *  size     — 'small' | 'medium'                         기본: 'medium'
 *             medium: active/inactive 10px, near-edge 8px, far-edge 6px, gap 10px
 *             small:  active/inactive 6px,  near-edge 4px, far-edge 2px, gap 6px
 *  className — 추가 클래스
 *
 * 사용 예:
 *  <PaginationDots count={5} value={0} />
 *  <PaginationDots count={10} value={4} variant="white" />
 *  <PaginationDots count={3} value={1} size="small" />
 */

/* ── 크기별 스펙 ─────────────────────────────────────────── */
const SIZE_SPEC = {
  medium: {
    gap:      'var(--spacing-10)',
    active:   'var(--spacing-10)',
    inactive: 'var(--spacing-10)',
    nearEdge: 'var(--spacing-8)',
    farEdge:  'var(--spacing-6)',
  },
  small: {
    gap:      'var(--spacing-6)',
    active:   'var(--spacing-6)',
    inactive: 'var(--spacing-6)',
    nearEdge: 'var(--spacing-4)',
    farEdge:  'var(--spacing-2)',
  },
}

/* ── 변형별 스펙 ─────────────────────────────────────────── */
const VARIANT_SPEC = {
  normal: { color: 'var(--color-label-normal)',   activeOpacity: 1, inactiveOpacity: 0.16 },
  white:  { color: 'var(--color-static-white)', activeOpacity: 1, inactiveOpacity: 0.52 },
}

/* ── 슬라이딩 윈도우 계산 ──────────────────────────────────
 * count ≤ 5: 전체 표시
 * count > 5: 5-슬롯 윈도우, 경계 바깥 페이지는 엣지 인디케이터
 *
 * dot types: 'active' | 'inactive' | 'near-left' | 'far-left' | 'near-right' | 'far-right'
 */
function getWindowDots(count, value) {
  const total = Math.max(1, count)
  const current = Math.max(0, Math.min(value, total - 1))

  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => ({
      type: i === current ? 'active' : 'inactive',
    }))
  }

  const start      = Math.max(0, Math.min(current - 2, total - 5))
  const end        = start + 4
  const pagesLeft  = start           // 윈도우 왼쪽 바깥 페이지 수
  const pagesRight = total - 1 - end // 윈도우 오른쪽 바깥 페이지 수

  return Array.from({ length: 5 }, (_, i) => {
    const page = start + i
    if (page === current) return { type: 'active' }

    // 왼쪽 엣지 인디케이터
    if (i === 0 && pagesLeft > 1) return { type: 'far-left' }
    if (i === 0 && pagesLeft === 1) return { type: 'near-left' }
    if (i === 1 && pagesLeft > 1) return { type: 'near-left' }

    // 오른쪽 엣지 인디케이터
    if (i === 4 && pagesRight > 1) return { type: 'far-right' }
    if (i === 4 && pagesRight === 1) return { type: 'near-right' }
    if (i === 3 && pagesRight > 1) return { type: 'near-right' }

    return { type: 'inactive' }
  })
}

/* ── dot 타입별 토큰 크기 반환 ──────────────────────────────── */
function getDotSize(type, spec) {
  switch (type) {
    case 'active':     return spec.active
    case 'inactive':   return spec.inactive
    case 'near-left':
    case 'near-right': return spec.nearEdge
    case 'far-left':
    case 'far-right':  return spec.farEdge
    default:           return spec.inactive
  }
}

export default function PaginationDots({
  count     = 1,
  value     = 0,
  variant   = 'normal',
  size      = 'medium',
  className = '',
}) {
  const spec    = SIZE_SPEC[size]    ?? SIZE_SPEC.medium
  const vspec   = VARIANT_SPEC[variant] ?? VARIANT_SPEC.normal
  const dots    = getWindowDots(count, value)

  const wrapperStyle = {
    display:    'inline-flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap:        spec.gap,
  }

  return (
    <div style={wrapperStyle} className={className} role="tablist" aria-label="페이지 인디케이터">
      {dots.map((dot, i) => {
        const sz      = getDotSize(dot.type, spec)
        const opacity = dot.type === 'active' ? vspec.activeOpacity : vspec.inactiveOpacity

        const dotStyle = {
          width:           sz,
          height:          sz,
          borderRadius:    'var(--radius-full)',
          backgroundColor: vspec.color,
          opacity,
          flexShrink:      0,
          transition:      'width 0.2s, height 0.2s, opacity 0.2s',
        }

        return (
          <div
            key={i}
            style={dotStyle}
            role="tab"
            aria-selected={dot.type === 'active'}
            aria-label={`페이지 ${i + 1}`}
          />
        )
      })}
    </div>
  )
}
