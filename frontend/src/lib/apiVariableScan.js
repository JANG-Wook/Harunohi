// API 정의에서 {{$xxx}} 토큰을 스캔해 "이 API 가 사용할 변수 키 목록" 을 추출.
//
// 스캔 대상: url + headers[].key + headers[].value + body (body 가 폼 모드라도 직렬화된 JSON 텍스트로
// 저장되므로 키/값 모두 한 번에 매치됨).
//
// 반환값: 변수 키 문자열 배열 (등장 순서, 중복 제거). 키는 displayName 또는 originalKey 일 수 있어
// 이후 변수 매칭 시 templateEngine 과 동일한 우선순위 로직(displayName → originalKey) 으로 해석한다.

const TOKEN_PATTERN = /\{\{\$([^}]+)\}\}/g

/** 한 문자열에서 토큰을 뽑아 out Set 에 누적 */
function scanInto(out, text) {
  if (typeof text !== 'string' || !text) return
  let m
  TOKEN_PATTERN.lastIndex = 0
  while ((m = TOKEN_PATTERN.exec(text)) !== null) {
    const key = m[1].trim()
    if (key) out.add(key)
  }
}

/**
 * apiEntry 정의에서 사용되는 변수 키 목록 추출.
 *   apiEntry: { url, headers:[{key,value}], body, ... }
 * 반환: 등장 순서 보존된 string[] (중복 제거됨).
 */
export function scanApiVariables(apiEntry) {
  const out = new Set()
  if (!apiEntry) return []
  scanInto(out, apiEntry.url)
  for (const h of apiEntry.headers ?? []) {
    scanInto(out, h?.key)
    scanInto(out, h?.value)
  }
  scanInto(out, apiEntry.body)
  return [...out]
}

/**
 * 스캔된 키 문자열을 봇 변수 객체로 해석.
 *   key: displayName 우선 매칭, 없으면 originalKey 매칭.
 * 매칭 실패 시 null.
 */
export function resolveVariableByKey(key, variables) {
  if (!key || !Array.isArray(variables)) return null
  const trimmed = key.trim()
  // 1) displayName 일치
  const byDisplay = variables.find((v) => v?.displayName?.trim() === trimmed)
  if (byDisplay) return byDisplay
  // 2) originalKey 일치
  const byOriginal = variables.find((v) => v?.originalKey === trimmed)
  return byOriginal ?? null
}
