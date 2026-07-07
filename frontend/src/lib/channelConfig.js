// 챗봇 채널 — 봇 + 챗봇 설정(런처)을 묶어 외부 노출하는 단위. localStorage 저장/로드 + 호출 URL/HTML 생성.
//
// 백엔드가 아직 없으므로 호출 URL/HTML 은 채널 id 기반 플레이스홀더다(공개 대화방 라우트 연결은 후속 작업).
//
// 저장 구조:
//   localStorage 키: `harunohi.channel.<id>`
//   값: { id, name, type, botId, launcherId, consultingEnabled, createdAt, updatedAt }

import { readRaw, writeRaw, remove, keys } from './storage.js'

const STORAGE_PREFIX = 'harunohi.channel.'
const BOT_PREFIX = 'harunohi.bot.'

/** 현재는 web 채널만 지원 — 향후 카카오/인스타 등 확장 자리 */
export const CHANNEL_TYPES = [{ value: 'web', label: 'Web' }]

/** 호출 URL/HTML 플레이스홀더 호스트 — 백엔드 연결 전까지 형태만 노출 */
const EMBED_HOST = 'https://chat.harunohi.io'
const WIDGET_CDN = 'https://cdn.harunohi.io/widget.js'

/** 채널 유형 값 → 라벨 */
export function channelTypeLabel(type) {
  return CHANNEL_TYPES.find((t) => t.value === type)?.label ?? type ?? '—'
}

/** 대화방 호출 URL — 이 링크를 열면 해당 채널의 챗봇 대화방이 뜬다(예정) */
export function channelChatUrl(id) {
  return `${EMBED_HOST}/c/${id}`
}

/** 대화방 호출 HTML — 사이트에 삽입하면 위젯이 뜬다(예정) */
export function channelEmbedHtml(id) {
  return `<script src="${WIDGET_CDN}" data-channel="${id}" async></script>`
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
export function createChannel({ name, type = 'web', botId, launcherId, consultingEnabled, nowIso }) {
  const entry = {
    id: newId(),
    name: (name ?? '').trim(),
    type,
    botId: botId ?? '',
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

/** 저장된 봇 목록을 셀렉트 옵션으로 — { value:id, label:이름 } (DashboardPage 키 규약과 동일) */
export function loadBotOptions() {
  const opts = []
  for (const key of keys(BOT_PREFIX)) {
    const botId = key.slice(BOT_PREFIX.length)
    opts.push({ value: botId, label: decodeURIComponent(botId) })
  }
  opts.sort((a, b) => a.label.localeCompare(b.label, 'ko'))
  return opts
}

/** 봇 id → 표시 이름. 없으면 '(삭제됨)' */
export function botName(botId) {
  if (!botId) return '—'
  return loadBotOptions().some((o) => o.value === botId) ? decodeURIComponent(botId) : '(삭제됨)'
}
