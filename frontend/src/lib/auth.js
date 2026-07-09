// 인증 상태 관리 — 토큰/유저를 localStorage(harunohi.auth)에 보관하고 login/register/logout API 를 감싼다.

import { readRaw, writeRaw, remove } from './storage.js'

const AUTH_KEY = 'harunohi.auth'

/** 보관된 인증 정보 { accessToken, user } — 없으면 null */
export function getAuth() {
  try {
    return JSON.parse(readRaw(AUTH_KEY))
  } catch {
    return null
  }
}

export function getAccessToken() {
  return getAuth()?.accessToken ?? null
}

export function getCurrentUser() {
  return getAuth()?.user ?? null
}

export function isAuthenticated() {
  return !!getAccessToken()
}

export function clearAuth() {
  remove(AUTH_KEY)
}

function saveAuth(loginResponse) {
  writeRaw(
    AUTH_KEY,
    JSON.stringify({ accessToken: loginResponse.accessToken, user: loginResponse.user }),
  )
  return loginResponse.user
}

/** 로그인 — 성공 시 인증 정보 보관 후 user 반환. 실패는 ApiError throw */
export async function login(email, password) {
  const { apiFetch } = await import('./api.js')
  const res = await apiFetch('/api/auth/login', { method: 'POST', body: { email, password }, auth: false })
  return saveAuth(res)
}

/** 회원가입 — 성공 시 바로 로그인 상태로 전환(백엔드가 토큰을 함께 반환) */
export async function register(email, password, name) {
  const { apiFetch } = await import('./api.js')
  const res = await apiFetch('/api/auth/register', { method: 'POST', body: { email, password, name }, auth: false })
  return saveAuth(res)
}

export function logout() {
  clearAuth()
}
