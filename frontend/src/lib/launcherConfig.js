// 플로팅 챗봇 런처 버튼 디자인 — 기본값 + 다중 버전 localStorage 저장/로드.
//
// 설정값(color 등)은 "사용자가 고르는 데이터" 다. 우리 디자인 토큰이 아니라 고객사 브랜드 색이므로
// 미리보기/임베드에 inline style 로 적용된다. (설정 패널 chrome 은 토큰만 사용)
//
// 저장 구조: 봇과 동일하게 버전(런처 디자인)별로 키를 분리한다.
//   localStorage 키: `harunohi.launcher.<id>`
//   값: { id, name, config, createdAt, updatedAt }

const STORAGE_PREFIX = 'harunohi.launcher.'

/** 항상 존재하는 기본 런처 버튼 id — 삭제 불가 */
export const DEFAULT_LAUNCHER_ID = 'default'

/** 챗봇 느낌 기본 아이콘 선택지 — 플로팅 버튼엔 채워진(fill) 아이콘이 더 어울린다 */
export const LAUNCHER_ICONS = [
  { value: 'bubbleFill', label: '말풍선' },
  { value: 'messageFill', label: '대화' },
  { value: 'faceSmileFill', label: '스마일' },
]

/** 진입 메시지 글자 굵기 — 디자인 시스템 weight 토큰 매핑 */
export const GREETING_WEIGHTS = [
  { value: 'regular', label: '얇게', css: 400 },
  { value: 'medium', label: '보통', css: 500 },
  { value: 'bold', label: '굵게', css: 700 },
]

export function defaultLauncherConfig() {
  return {
    iconType: 'default',          // 'default' | 'image'
    iconName: 'bubbleFill',       // default 일 때 DS 아이콘
    iconColor: '#FFFFFF',         // 아이콘 색 (image 면 비활성)
    iconImage: '',                // 업로드 PNG — { name, url } | ''
    bgColor: '#0066FF',           // 버튼 배경색 (image 여도 항상 적용)
    greetingOn: true,             // 진입 메시지 노출 여부
    greetingPosition: 'left',     // 말풍선 위치 — 'left'(버튼 왼쪽) | 'top'(버튼 위)
    greetingText: '도움이 필요하신가요?',
    greetingTextColor: '#FFFFFF',
    greetingTextSize: 15,         // px
    greetingTextWeight: 'medium', // 'regular'(얇게) | 'medium'(보통) | 'bold'(굵게)
    greetingBgColor: '#0066FF',
  }
}

function keyFor(id) {
  return `${STORAGE_PREFIX}${id}`
}

/** 저장된 런처 디자인 전체 목록 — 이름 가나다순. 손상 항목은 무시 */
export function loadLauncherList() {
  if (typeof window === 'undefined') return []
  const list = []
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i)
    if (!key?.startsWith(STORAGE_PREFIX)) continue
    try {
      const parsed = JSON.parse(window.localStorage.getItem(key))
      if (parsed?.id) list.push(parsed)
    } catch {
      // 손상 항목 무시
    }
  }
  // 최근 저장(수정)순 — 최신이 좌측 상단. 동률이면 이름순
  list.sort((a, b) => {
    const ta = a.updatedAt || a.createdAt || ''
    const tb = b.updatedAt || b.createdAt || ''
    if (ta !== tb) return tb.localeCompare(ta) // 내림차순(최신 먼저)
    return (a.name || '').localeCompare(b.name || '', 'ko')
  })
  return list
}

/** id 로 단일 런처 엔트리 로드 — 없으면 null. config 는 기본값으로 누락 필드 보강 */
export function loadLauncher(id) {
  if (typeof window === 'undefined' || !id) return null
  try {
    const parsed = JSON.parse(window.localStorage.getItem(keyFor(id)))
    if (!parsed?.id) return null
    return { ...parsed, config: { ...defaultLauncherConfig(), ...parsed.config } }
  } catch {
    return null
  }
}

/** 런처 엔트리 저장(생성/수정). createdAt 은 신규일 때만 stamp(인자로 받음) */
export function saveLauncher({ id, name, config, createdAt, nowIso }) {
  if (typeof window === 'undefined') return
  const existing = loadLauncher(id)
  const entry = {
    id,
    name,
    config,
    createdAt: existing?.createdAt ?? createdAt ?? nowIso,
    updatedAt: nowIso,
  }
  window.localStorage.setItem(keyFor(id), JSON.stringify(entry))
}

export function deleteLauncher(id) {
  if (typeof window === 'undefined' || id === DEFAULT_LAUNCHER_ID) return
  window.localStorage.removeItem(keyFor(id))
}

/** 기본 런처 버튼이 없으면 생성 — 목록에 항상 하나는 존재하도록 보장 */
export function ensureDefaultLauncher(nowIso) {
  if (typeof window === 'undefined') return
  if (loadLauncher(DEFAULT_LAUNCHER_ID)) return
  saveLauncher({ id: DEFAULT_LAUNCHER_ID, name: '기본값', config: defaultLauncherConfig(), nowIso })
}

/** 이름 중복 검사 — 같은 이름의 다른 엔트리가 있으면 true (excludeId 는 자기 자신 제외) */
export function isLauncherNameTaken(name, excludeId = null) {
  const trimmed = (name || '').trim()
  if (!trimmed) return false
  return loadLauncherList().some((l) => l.name === trimmed && l.id !== excludeId)
}
