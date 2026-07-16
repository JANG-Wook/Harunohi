// 봇 도메인 API — 워크스페이스 부트스트랩 + 봇/버전/발행 REST 를 프론트 모델에 맞게 감싼다.
//
// 파일럿은 단일 워크스페이스: 내 워크스페이스가 없으면 "기본 워크스페이스"를 자동 생성하고
// publicId 를 메모리 캐시에 보관한다(로그아웃/토큰 변경 시 자연 리셋 — 모듈 상태는 세션 한정).

import { apiFetch } from './api.js'

let cachedWorkspaceId = null
let inflightWorkspace = null

/** 내 워크스페이스 publicId — 없으면 자동 생성. 모든 봇 API 의 선행 단계.
    동시 호출(예: StrictMode 이중 이펙트)에도 생성이 한 번만 일어나도록 in-flight 프로미스를 공유한다. */
export async function ensureWorkspace() {
  if (cachedWorkspaceId) return cachedWorkspaceId
  if (!inflightWorkspace) {
    inflightWorkspace = (async () => {
      const list = await apiFetch('/api/workspaces')
      if (Array.isArray(list) && list.length > 0) return list[0].publicId
      const created = await apiFetch('/api/workspaces', { method: 'POST', body: { name: '기본 워크스페이스' } })
      return created.publicId
    })()
      .then((id) => {
        cachedWorkspaceId = id
        return id
      })
      .finally(() => {
        inflightWorkspace = null
      })
  }
  return inflightWorkspace
}

/** 캐시 리셋 — 로그아웃 시 호출 */
export function resetWorkspaceCache() {
  cachedWorkspaceId = null
  inflightWorkspace = null
}

/** 봇 목록 — 서버 메타를 대시보드 카드 형태로 반환 */
export async function listBots() {
  const ws = await ensureWorkspace()
  const bots = await apiFetch(`/api/workspaces/${ws}/bots`)
  return bots ?? []
}

export async function createBot(name) {
  const ws = await ensureWorkspace()
  return apiFetch(`/api/workspaces/${ws}/bots`, { method: 'POST', body: { name } })
}

export async function patchBot(botPublicId, patch) {
  const ws = await ensureWorkspace()
  return apiFetch(`/api/workspaces/${ws}/bots/${botPublicId}`, { method: 'PATCH', body: patch })
}

export async function deleteBot(botPublicId) {
  const ws = await ensureWorkspace()
  return apiFetch(`/api/workspaces/${ws}/bots/${botPublicId}`, { method: 'DELETE' })
}

export async function getBot(botPublicId) {
  const ws = await ensureWorkspace()
  return apiFetch(`/api/workspaces/${ws}/bots/${botPublicId}`)
}

/* ── 버전 — definition_json 에 프론트 정의(scenarios/currentScenarioId/variables/apis/appliedLauncherId) 통째 저장 ── */

export async function listVersions(botPublicId) {
  const ws = await ensureWorkspace()
  return apiFetch(`/api/workspaces/${ws}/bots/${botPublicId}/versions`)
}

export async function getVersion(botPublicId, versionPublicId) {
  const ws = await ensureWorkspace()
  return apiFetch(`/api/workspaces/${ws}/bots/${botPublicId}/versions/${versionPublicId}`)
}

export async function createVersion(botPublicId, { name, description, definition }) {
  const ws = await ensureWorkspace()
  return apiFetch(`/api/workspaces/${ws}/bots/${botPublicId}/versions`, {
    method: 'POST',
    body: { name, description: description ?? '', definitionJson: JSON.stringify(definition) },
  })
}

export async function deleteVersion(botPublicId, versionPublicId) {
  const ws = await ensureWorkspace()
  return apiFetch(`/api/workspaces/${ws}/bots/${botPublicId}/versions/${versionPublicId}`, { method: 'DELETE' })
}

export async function setCurrentVersion(botPublicId, versionPublicId) {
  const ws = await ensureWorkspace()
  return apiFetch(`/api/workspaces/${ws}/bots/${botPublicId}/versions/${versionPublicId}/current`, { method: 'PUT' })
}

/* ── 발행/롤백 ── */

export async function publishVersion(botPublicId, versionPublicId, note) {
  const ws = await ensureWorkspace()
  return apiFetch(`/api/workspaces/${ws}/bots/${botPublicId}/publish`, {
    method: 'POST',
    body: { versionPublicId, note: note ?? '' },
  })
}

export async function rollbackDeployment(botPublicId, deploymentPublicId) {
  const ws = await ensureWorkspace()
  return apiFetch(`/api/workspaces/${ws}/bots/${botPublicId}/rollback`, {
    method: 'POST',
    body: { deploymentPublicId },
  })
}

export async function listDeployments(botPublicId) {
  const ws = await ensureWorkspace()
  return apiFetch(`/api/workspaces/${ws}/bots/${botPublicId}/deployments`)
}

/* ── 대화 로그 조회 (인증) ── */

export async function listSessions(botPublicId) {
  const ws = await ensureWorkspace()
  return apiFetch(`/api/workspaces/${ws}/bots/${botPublicId}/sessions`)
}

export async function listSessionMessages(botPublicId, sessionPublicId) {
  const ws = await ensureWorkspace()
  return apiFetch(`/api/workspaces/${ws}/bots/${botPublicId}/sessions/${sessionPublicId}/messages`)
}

/** 공개(무인증) 배포 조회 — 위젯/공개 챗룸이 발행된 스냅샷을 읽는다 */
export async function getPublicDeployment(botPublicId) {
  return apiFetch(`/api/public/bots/${botPublicId}/deployment`, { auth: false })
}
