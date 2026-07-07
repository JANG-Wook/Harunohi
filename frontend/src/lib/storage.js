// 영속 저장 어댑터 — localStorage 접근을 한곳으로 모아 이후 API 교체 지점을 단일화한다.
// 현재 구현은 localStorage 그대로(동작·키 규약 불변). SSR(window 없음) 안전.
//
// 향후 API 전환 시: 이 모듈의 구현만 교체하거나, 도메인 함수(loadXxxList 등)를
// 비동기 API 호출로 바꾼다. (localStorage=동기, API=비동기 전환은 별도 청크)

/** window.localStorage 안전 접근 — 없거나 접근 불가면 null */
function ls() {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/** 키의 원문(string) 읽기 — 없으면 null */
export function readRaw(key) {
  const s = ls()
  if (!s || !key) return null
  return s.getItem(key)
}

/** 키에 원문(string) 쓰기 */
export function writeRaw(key, value) {
  const s = ls()
  if (!s || !key) return
  s.setItem(key, value)
}

/** 키 삭제 */
export function remove(key) {
  const s = ls()
  if (!s || !key) return
  s.removeItem(key)
}

/** 저장된 키 목록 — prefix 주면 그 접두사로 시작하는 키만 */
export function keys(prefix = '') {
  const s = ls()
  if (!s) return []
  const out = []
  for (let i = 0; i < s.length; i++) {
    const k = s.key(i)
    if (k && (!prefix || k.startsWith(prefix))) out.push(k)
  }
  return out
}
