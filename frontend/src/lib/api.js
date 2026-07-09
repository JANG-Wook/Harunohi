// 백엔드 REST API 클라이언트 — base URL(env) + Bearer 토큰 자동 첨부 + JSON/에러 정규화.
//
// base URL 은 VITE_API_BASE_URL 로 주입(기본 http://localhost:8080).
// 토큰은 auth.js 가 localStorage(harunohi.auth)에 보관하고, 여기서 읽어 Authorization 헤더로 붙인다.

import { getAccessToken, clearAuth } from './auth.js'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

/** API 오류 — status 와 서버 message 를 보존해 호출부가 분기할 수 있게 한다 */
export class ApiError extends Error {
  constructor(status, message, body) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

/** 공통 요청 — path 는 '/api/...' 형태. body 는 객체(JSON 직렬화). 204 는 null 반환 */
export async function apiFetch(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getAccessToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }
  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    // 네트워크 실패(서버 다운/CORS) — 호출부에 일관된 형태로 전달
    throw new ApiError(0, '서버에 연결할 수 없습니다.', null)
  }
  if (res.status === 204) return null
  let json = null
  try {
    json = await res.json()
  } catch {
    // 본문 없는 응답 허용
  }
  if (!res.ok) {
    // 만료/무효 토큰 — 보관된 인증 정보를 지워 재로그인 유도 (로그인 시도 자체는 auth=false 경로)
    if (res.status === 401 && auth) clearAuth()
    const message = json?.message ?? `요청이 실패했습니다 (HTTP ${res.status})`
    throw new ApiError(res.status, message, json)
  }
  return json
}
