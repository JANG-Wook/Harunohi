// 챗봇 채널 — 봇 + 챗봇 설정(런처)을 묶어 외부 노출하는 단위. localStorage 저장/로드 + 호출 URL/HTML 생성.
//
// 호출 URL/HTML 은 실제 공개 대화방 라우트 `/c/<botPublicId>` 를 가리킨다(위젯=iframe 임베드).
// 채널 자체는 아직 클라이언트 전용 → URL 은 채널이 고른 봇의 publicId 로 직결(채널 서버화는 후속 V3).
//
// 저장 구조:
//   localStorage 키: `harunohi.channel.<id>`
//   값: { id, name, type, botId(=botPublicId), botName, launcherId, consultingEnabled, createdAt, updatedAt }

import { readRaw, writeRaw, remove, keys } from './storage.js'

const STORAGE_PREFIX = 'harunohi.channel.'

/** 현재는 web 채널만 지원 — 향후 카카오/인스타 등 확장 자리 */
export const CHANNEL_TYPES = [{ value: 'web', label: 'Web' }]

/** 공개 대화방 서빙 오리진 — 운영은 VITE_PUBLIC_CHAT_ORIGIN 로 도메인 주입, 없으면 현재 오리진(데모/로컬) */
function publicOrigin() {
  const env = import.meta.env.VITE_PUBLIC_CHAT_ORIGIN
  if (env) return env
  return typeof window !== 'undefined' ? window.location.origin : ''
}

/** 채널 유형 값 → 라벨 */
export function channelTypeLabel(type) {
  return CHANNEL_TYPES.find((t) => t.value === type)?.label ?? type ?? '—'
}

/** 대화방 호출 URL — 이 링크를 열면 봇의 공개 대화방이 뜬다 (botPublicId 직결) */
export function channelChatUrl(botPublicId) {
  return `${publicOrigin()}/c/${botPublicId}`
}

/** 대화방 호출 HTML — 사이트에 붙여넣으면 iframe 으로 대화방 위젯이 뜬다 */
export function channelEmbedHtml(botPublicId) {
  return `<iframe src="${publicOrigin()}/c/${botPublicId}" title="챗봇" style="width:400px;height:720px;border:0;border-radius:16px" allow="clipboard-write"></iframe>`
}

function keyFor(id) {
  return `${STORAGE_PREFIX}${id}`
}

/** 채널 id 생성 — 앱 런타임이라 Date.now/Math.random 사용 가능 */
function newId() {
  return `ch_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

/** 저장 원본을 런타임 형태로 정규화 — 누락 필드 보강 */
function normalize(parsed) {
  if (!parsed?.id) return null
  return {
    id: parsed.id,
    name: parsed.name ?? '',
    type: parsed.type ?? 'web',
    botId: parsed.botId ?? '',
    botName: parsed.botName ?? '',
    launcherId: parsed.launcherId ?? '',
    consultingEnabled: !!parsed.consultingEnabled,
    createdAt: parsed.createdAt ?? null,
    updatedAt: parsed.updatedAt ?? parsed.createdAt ?? null,
  }
}

/** 저장된 채널 전체 목록 — 최근 수정순. 손상 항목은 무시 */
export function loadChannelList() {
  const list = []
  for (const key of keys(STORAGE_PREFIX)) {
    try {
      const entry = normalize(JSON.parse(readRaw(key)))
      if (entry) list.push(entry)
    } catch {
      // 손상 항목 무시
    }
  }
  list.sort((a, b) => {
    const ta = a.updatedAt || a.createdAt || ''
    const tb = b.updatedAt || b.createdAt || ''
    if (ta !== tb) return tb.localeCompare(ta) // 최신 먼저
    return (a.name || '').localeCompare(b.name || '', 'ko')
  })
  return list
}

/** id 로 단일 채널 로드 — 없으면 null */
export function loadChannel(id) {
  if (!id) return null
  try {
    return normalize(JSON.parse(readRaw(keyFor(id))))
  } catch {
    return null
  }
}

/** 채널 신규 생성 — 생성된 채널(런타임 형태) 반환 */
export function createChannel({ name, type = 'web', botId, botName, launcherId, consultingEnabled, nowIso }) {
  const entry = {
    id: newId(),
    name: (name ?? '').trim(),
    type,
    botId: botId ?? '',
    botName: botName ?? '',
    launcherId: launcherId ?? '',
    consultingEnabled: !!consultingEnabled,
    createdAt: nowIso,
    updatedAt: nowIso,
  }
  writeRaw(keyFor(entry.id), JSON.stringify(entry))
  return entry
}

export function deleteChannel(id) {
  if (!id) return
  remove(keyFor(id))
}

/** 이름 중복 검사 — 같은 이름의 다른 채널이 있으면 true */
export function isChannelNameTaken(name, excludeId = null) {
  const trimmed = (name || '').trim()
  if (!trimmed) return false
  return loadChannelList().some((c) => c.name === trimmed && c.id !== excludeId)
}
