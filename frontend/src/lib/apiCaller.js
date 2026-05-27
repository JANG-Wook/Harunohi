// API 호출 헬퍼 — 빌더 테스트 + 시뮬레이터 런타임 공통 사용.
//
// URL/headers/body 의 {{$var}} 패턴을 supplied variables 로 치환 후 fetch.
// 결과는 status / body(JSON 파싱 시도, 실패 시 raw 문자열) / error / calledAt 으로 정규화.

import { interpolate } from './templateEngine.js'

const METHODS_WITHOUT_BODY = new Set(['GET', 'HEAD'])

/** apiConfig + variables → 실제 호출 결과 객체.
 *  반환 형태.
 *    { ok, status, headers, body, error, calledAt, requestPreview }
 *  - ok: HTTP 2xx 여부
 *  - body: JSON 파싱 성공 시 객체, 실패 시 원본 문자열
 *  - error: 네트워크/예외 시 메시지 (그 외 null)
 *  - requestPreview: 치환 후 실제 보낸 URL/method/headers/body — 디버깅 표시용 */
export async function callApi(apiConfig, variables = []) {
  const method = (apiConfig?.method || 'GET').toUpperCase()
  const urlRaw = apiConfig?.url || ''
  const url = interpolate(urlRaw, variables)
  const headersList = apiConfig?.headers ?? []
  const bodyRaw = apiConfig?.body || ''

  const headers = {}
  for (const h of headersList) {
    if (h?.key?.trim()) {
      headers[interpolate(h.key, variables)] = interpolate(h.value ?? '', variables)
    }
  }

  // GET/HEAD 는 body 미포함. 그 외에 body 가 있으면 Content-Type 자동 부여 (사용자가 명시했으면 유지)
  let body
  if (!METHODS_WITHOUT_BODY.has(method) && bodyRaw.trim()) {
    body = interpolate(bodyRaw, variables)
    if (!Object.keys(headers).some((k) => k.toLowerCase() === 'content-type')) {
      headers['Content-Type'] = 'application/json'
    }
  }

  const requestPreview = { method, url, headers, body }
  const calledAt = new Date().toISOString()

  if (!url) {
    return {
      ok: false,
      status: 0,
      headers: {},
      body: null,
      error: 'URL 이 비어있습니다.',
      calledAt,
      requestPreview,
    }
  }

  try {
    const res = await fetch(url, { method, headers, body })
    const rawText = await res.text()
    let parsed = rawText
    try {
      parsed = JSON.parse(rawText)
    } catch {
      // 비 JSON 응답은 원본 문자열 유지
    }
    const resHeaders = {}
    res.headers.forEach((v, k) => {
      resHeaders[k] = v
    })
    return {
      ok: res.ok,
      status: res.status,
      headers: resHeaders,
      body: parsed,
      error: null,
      calledAt,
      requestPreview,
    }
  } catch (err) {
    return {
      ok: false,
      status: 0,
      headers: {},
      body: null,
      error: err?.message || '네트워크 오류',
      calledAt,
      requestPreview,
    }
  }
}

/** 응답 객체에서 dot-path 로 값 추출 — 'data.name' → response.body.data.name */
export function getValueAtPath(obj, path) {
  if (!obj || !path) return undefined
  const parts = path.split('.')
  let cur = obj
  for (const p of parts) {
    if (cur == null) return undefined
    cur = cur[p]
  }
  return cur
}
