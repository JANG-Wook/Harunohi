// 공개 대화방 대화 로그 전송 클라이언트 — 무인증. 실패해도 대화 흐름을 깨지 않도록 조용히 무시(fire-and-forget).

import { apiFetch } from './api.js'

// botPublicId → 세션 시작 프로미스 캐시. 한 번의 방문(페이지 로드)에서
// 마운트가 여러 번 일어나도(StrictMode 이중 실행, 리렌더 재마운트) 세션은 하나만 만든다.
const sessionPromises = new Map()

/** 세션 시작 — 발행된 봇의 세션을 만들고 sessionPublicId 를 반환. 실패 시 null. */
export function startSession(botPublicId) {
  if (!botPublicId) return Promise.resolve(null)
  const cached = sessionPromises.get(botPublicId)
  if (cached) return cached
  const promise = apiFetch(`/api/public/bots/${botPublicId}/sessions`, {
    method: 'POST',
    auth: false,
  })
    .then((res) => res?.sessionPublicId ?? null)
    .catch(() => {
      sessionPromises.delete(botPublicId) // 실패한 시도는 캐시에서 비워 재시도 여지를 남긴다
      return null // 로깅 실패는 대화를 막지 않는다
    })
  sessionPromises.set(botPublicId, promise)
  return promise
}

/** 메시지 배치 적재 — 아직 안 보낸 이벤트만 넘긴다. 실패는 조용히 무시. */
export async function appendMessages(sessionPublicId, messages) {
  if (!sessionPublicId || !messages?.length) return
  try {
    await apiFetch(`/api/public/sessions/${sessionPublicId}/messages`, {
      method: 'POST',
      auth: false,
      body: { messages },
    })
  } catch {
    // 로깅 실패는 대화를 막지 않는다
  }
}

/** 런타임 history 이벤트 → 서버 메시지 형태 { sender, contentType, content }. */
export function toLogMessage(event) {
  return {
    sender: senderOf(event.kind),
    contentType: event.kind,
    content: event,
  }
}

/** 이벤트 kind → sender 분류 (bot / user / system). */
function senderOf(kind) {
  if (kind === 'bot') return 'bot'
  if (kind === 'user-click' || kind === 'user-utterance') return 'user'
  return 'system'
}
