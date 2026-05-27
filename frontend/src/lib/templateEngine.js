// 변수 치환 엔진 — `{{$key}}` 문법을 봇 변수(또는 시뮬레이터 메모리) 의 값으로 치환.
//
// 사용처: 시뮬레이터에서 메시지 텍스트 / 버튼 라벨 / URL 링크 등 렌더링 시점에 적용.
// 미정의 변수는 그대로 둠 — 디버깅 + 학습 친화 (사용자 결정).
//
// 변수 조회 우선순위.
//   1) displayName 이 일치하는 변수 (사용자 별명, 예: '회원명')
//   2) originalKey 가 일치하는 변수 (API/폼 원본 키, 예: 'memberName')
//
// 변수 sampleValue 가 값으로 사용됨. (시뮬레이터에서 메모리로 확장될 자리)

const TEMPLATE_PATTERN = /\{\{\$([^}]+)\}\}/g

/**
 * variables 배열 → { key: value } 룩업 맵.
 * displayName 우선 등록, 그 후 originalKey 등록 (displayName 충돌 시 displayName 이 이김).
 */
function buildLookup(variables) {
  const lookup = new Map()
  if (!Array.isArray(variables)) return lookup
  // 1차: originalKey
  for (const v of variables) {
    if (v?.originalKey) lookup.set(v.originalKey, v.sampleValue ?? '')
  }
  // 2차: displayName (있으면 덮어쓰기 — 사용자 별명 우선)
  for (const v of variables) {
    if (v?.displayName?.trim()) lookup.set(v.displayName.trim(), v.sampleValue ?? '')
  }
  return lookup
}

/**
 * 문자열 안의 `{{$key}}` 패턴을 변수 값으로 치환.
 * 입력이 문자열이 아니거나 빈 값이면 그대로 반환.
 */
export function interpolate(text, variables) {
  if (typeof text !== 'string' || !text) return text
  const lookup = buildLookup(variables)
  return text.replace(TEMPLATE_PATTERN, (full, rawKey) => {
    const key = rawKey.trim()
    if (lookup.has(key)) return String(lookup.get(key))
    return full // 미정의 — 원본 그대로 노출
  })
}

/**
 * 링크 객체에 변수 치환 적용 — bot 타입은 그대로, url 타입은 url 필드 치환.
 * 링크 자체가 없으면 그대로 반환.
 */
export function interpolateLink(link, variables) {
  if (!link || link.type !== 'url') return link
  return { ...link, url: interpolate(link.url, variables) }
}
