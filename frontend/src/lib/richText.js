// 인라인 굵기 리치 텍스트 모델 — "runs"(세그먼트 배열)로 저장/렌더하는 공용 유틸.
// run = { text: string, weight: 'regular'|'bold' }. 편집기(Tiptap)와 분리해
// 캔버스 미리보기·시뮬레이터·임베드가 같은 모델 하나만 읽도록 한다. (HTML 주입 없음)

/** 굵기 단계 — regular(기본) / bold 2단계. value/표시 라벨/CSS 토큰 var */
export const TEXT_WEIGHTS = [
  { value: 'regular', label: 'Regular', css: 'var(--font-weight-regular)' },
  { value: 'bold', label: 'Bold', css: 'var(--font-weight-bold)' },
]

/** 기본(미적용) 굵기 — 마크 없는 텍스트는 regular 로 본다 */
export const DEFAULT_WEIGHT = 'regular'

/** weight 값 → CSS font-weight 토큰 var. 알 수 없으면 regular */
export function weightCss(weight) {
  const found = TEXT_WEIGHTS.find((w) => w.value === weight)
  return (found ?? TEXT_WEIGHTS.find((w) => w.value === DEFAULT_WEIGHT)).css
}

/** runs 전체 텍스트(굵기 무시) — 빈값 검사·길이·변수치환 전 길이 등에 사용 */
export function runsToText(runs) {
  if (!Array.isArray(runs)) return typeof runs === 'string' ? runs : ''
  return runs.map((r) => r?.text ?? '').join('')
}

/** runs 가 비었는지(공백 제외) */
export function isRunsEmpty(runs) {
  return !runsToText(runs).trim()
}

/** 인접한 동일 굵기 run 병합 + 빈 텍스트 run 제거. 정규화된 새 배열 반환 */
export function normalizeRuns(runs) {
  if (!Array.isArray(runs)) return []
  const out = []
  for (const r of runs) {
    const text = r?.text ?? ''
    if (text === '') continue
    const weight = TEXT_WEIGHTS.some((w) => w.value === r?.weight) ? r.weight : DEFAULT_WEIGHT
    const last = out[out.length - 1]
    if (last && last.weight === weight) last.text += text
    else out.push({ text, weight })
  }
  return out
}

/** 평문 문자열(또는 이미 runs)을 runs 로 정규화. 빈 문자열은 [] 로.
 *  baseWeight: 평문을 승계할 때 부여할 굵기(제목=bold 등). */
export function toRuns(value, baseWeight = DEFAULT_WEIGHT) {
  if (Array.isArray(value)) return normalizeRuns(value)
  if (typeof value === 'string') {
    return value === '' ? [] : normalizeRuns([{ text: value, weight: baseWeight }])
  }
  return []
}

/** 각 run 텍스트에 변환 함수 적용(굵기 보존) — 변수치환 {{var}} 용.
 *  치환 결과가 run 경계 안에서 처리되므로 굵기가 유지된다. */
export function mapRunsText(runs, fn) {
  return normalizeRuns(toRuns(runs).map((r) => ({ text: fn(r.text), weight: r.weight })))
}
