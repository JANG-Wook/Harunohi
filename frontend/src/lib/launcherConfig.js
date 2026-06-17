// 플로팅 챗봇 런처 버튼 디자인 — 기본값 + 단일 config localStorage 저장/로드.
//
// 설정값(color 등)은 "사용자가 고르는 데이터" 다. 우리 디자인 토큰이 아니라 고객사 브랜드 색이므로
// 미리보기/임베드에 inline style 로 적용된다. (설정 패널 chrome 은 토큰만 사용)
//
// 저장 구조: 디자인별로 키를 분리한다.
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

/** 기본 버튼 모양 선택지 */
export const LAUNCHER_SHAPES = [
  { value: 'circle', label: '원' },
  { value: 'rounded', label: '둥근 사각형' },
  { value: 'square', label: '사각형' },
]

/** 대화방 설정 기본값 — config.chatroom 에 중첩 저장.
    프로필은 실제 ChatRoom 아바타(이미지 전용)에 맞춰 사진만 지원(없으면 기본 아바타). */
export function defaultChatroomConfig() {
  return {
    botNameOn: true,            // 챗봇 이름 표시 여부
    botName: '챗봇',            // 메시지마다 아바타 옆에 붙는 봇 라벨
    roomTitleOn: true,          // 대화방 이름 표시 여부
    roomTitle: '챗봇',          // 대화방 헤더 제목
    onlineIndicator: true,      // 헤더 이름 옆 연결 상태 점(깜빡임) 표시 여부
    pinUserToTop: true,         // 사용자 발화 상단 고정 — 보낼 때마다 직전 대화가 밀리고 발화가 상단에 위치
    inputExpandable: true,      // 메시지 입력창 확장 사용 — 켜면 클릭 시 입력창이 textarea 로 확장
    profileType: 'icon',        // 'icon'(기본 아이콘) | 'image'(이미지 업로드)
    profileIcon: 'robot',       // 기본 아이콘 종류 — profileAvatar.js PROFILE_ICONS ('flower'|'robot'|'face')
    profileIconColor: '#0066FF', // 기본 아이콘 전경색 (흰 눈/미소는 고정)
    profileIconBgColor: '#EAF1FF', // 기본 아이콘 배경색
    profileImage: '',           // { name, url } | '' — profileType==='image' 일 때 사용
    themeSupport: true,         // 다크/라이트 모드 사용 — true 면 테마 배경 따름, 고정 배경 비활성
    bgType: 'color',            // 'color' | 'image' — 대화방 배경 (themeSupport=false 일 때 적용)
    bgColor: '#F5F6F8',         // 대화방 배경색 (bgType==='color' 일 때)
    bgImage: '',                // { name, url } | ''
    inputPlaceholder: '메시지를 입력해 주세요',
    font: 'pretendard',         // 현재 1종(고정)
  }
}

/** 챗봇 응답(메시지) 스타일 기본값 — config.response 에 중첩 저장.
    색/크기/둥글기는 고객사 브랜드 데이터라 미리보기에 inline style 로 적용된다.
    기본값은 실제 DS ChatRoom 렌더와 동일하게 맞췄다. DS 는 알파 색(label-neutral .88,
    line-neutral .16 등)을 쓰는데 ColorField 는 6자리 hex 만 받으므로 "흰 배경 합성값"으로 변환.
    (기본 흰 배경 기준 일치. 단위 px) */
export function defaultResponseConfig() {
  return {
    // 제목/본문/펼치기 텍스트 — body-2(15), 색은 label-neutral(.88)→흰 배경 합성 #47484B
    titleSize: 15,
    titleColor: '#47484B',
    bodySize: 15,
    bodyColor: '#47484B',
    // 펼치기(아코디언) — '더 보기' 버튼 자체는 설정 대상 아님
    accordionSize: 15,
    accordionColor: '#47484B',
    // 버튼 — DS Button(large): 둥글기 14, 글자 16. 둥글기/글자 크기는 메인·서브 공통
    buttonRadius: 14,
    buttonTextSize: 16,
    // 메인 = solid primary (테두리 없음 → bg 와 동일 색으로 숨김)
    mainButtonColor: '#0066FF',
    mainButtonBorderColor: '#0066FF',
    mainButtonTextColor: '#FFFFFF',
    // 서브 = outlined primary: 외곽선 line-neutral(.16)→#E8E9EA, 텍스트만 primary
    subButtonColor: '#FFFFFF',
    subButtonBorderColor: '#E8E9EA',
    subButtonTextColor: '#0066FF',
    // 퀵버튼 = Chip(outlined small): 둥글기 8, 외곽선 line-neutral #E8E9EA, 텍스트 label-alternative(.61)→#858688
    quickRadius: 8,
    quickTextSize: 14,
    quickTextColor: '#858688',
    quickColor: '#FFFFFF',
    quickBorderColor: '#E8E9EA',
    // 말풍선 — bg-normal / line-solid-normal
    bubbleBgColor: '#FFFFFF',
    bubbleBorderColor: '#E1E2E4',
  }
}

/** 진입 메시지 글자 굵기 — 디자인 시스템 weight 토큰 매핑 */
export const GREETING_WEIGHTS = [
  { value: 'regular', label: '얇게', css: 400 },
  { value: 'medium', label: '보통', css: 500 },
  { value: 'bold', label: '굵게', css: 700 },
]

export function defaultLauncherConfig() {
  return {
    iconType: 'default',          // 'default' | 'image' — 버튼 안 아이콘
    iconName: 'bubbleFill',       // default 일 때 DS 아이콘
    iconColor: '#FFFFFF',         // 아이콘 색 (이미지 아이콘/이미지 버튼 중 비활성)
    iconImage: '',                // 업로드 아이콘 — { name, url } | ''
    buttonType: 'default',        // 'default'(모양) | 'image'(이미지 버튼)
    buttonShape: 'circle',        // 'circle' | 'rounded' | 'bubble'
    buttonImage: '',              // 업로드 버튼 이미지 — { name, url } | ''
    bgColor: '#0066FF',           // 버튼 배경색 (이미지 버튼 중 비활성)
    greetingOn: true,             // 진입 메시지 노출 여부
    greetingPosition: 'left',     // 말풍선 위치 — 'left'(버튼 왼쪽) | 'top'(버튼 위)
    greetingText: '도움이 필요하신가요?',
    greetingTextColor: '#FFFFFF',
    greetingTextSize: 15,         // px
    greetingTextWeight: 'medium', // 'regular'(얇게) | 'medium'(보통) | 'bold'(굵게)
    greetingBgColor: '#0066FF',
    chatroom: defaultChatroomConfig(), // 대화방 설정 (중첩)
    response: defaultResponseConfig(), // 챗봇 응답 스타일 (중첩)
  }
}

function keyFor(id) {
  return `${STORAGE_PREFIX}${id}`
}

/** 버전 id 생성 — 앱 런타임이라 Date.now/Math.random 사용 가능 */
function newVersionId() {
  return `v_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

/** 저장 엔트리에 현재 버전 config 를 펼쳐 런타임 형태로 — 에디터/미리보기가 entry.config 를 바로 쓰도록 */
function withCurrentConfig(entry) {
  const current =
    entry.versions.find((v) => v.id === entry.currentVersionId) ??
    entry.versions[entry.versions.length - 1]
  return { ...entry, currentVersionId: current.id, config: current.config }
}

/** config 누락 필드를 기본값으로 보강 */
function fillConfig(config) {
  const merged = { ...defaultLauncherConfig(), ...config }
  // 제거된 옛 모양값(bubble) 보정 — 원형으로 승계
  if (!['circle', 'rounded', 'square'].includes(merged.buttonShape)) {
    merged.buttonShape = 'circle'
  }
  // 대화방 설정 깊은 병합 — 기존 데이터(chatroom 없음)도 기본값 보강
  merged.chatroom = { ...defaultChatroomConfig(), ...(config?.chatroom ?? {}) }
  // 제거된 옛 배경값(default) 보정 — color 로 승계(테마 추종은 themeSupport 가 담당)
  if (!['color', 'image'].includes(merged.chatroom.bgType)) {
    merged.chatroom.bgType = 'color'
  }
  // 프로필 타입 보정 — 옛 데이터(profileType 없음)는 업로드 이미지 유무로 승계
  if (!['icon', 'image', 'none'].includes(merged.chatroom.profileType)) {
    const pImg = merged.chatroom.profileImage
    const pHasImg = !!(typeof pImg === 'string' ? pImg : pImg?.url)
    merged.chatroom.profileType = pHasImg ? 'image' : 'icon'
  }
  // 응답 스타일 깊은 병합 — 기존 데이터(response 없음)도 기본값 보강
  merged.response = { ...defaultResponseConfig(), ...(config?.response ?? {}) }
  return merged
}

/** 저장 원본(parsed)을 현재 모델(versions 보유)로 정규화.
    - versions[] 포맷: 그대로 보강(이름/설명 없으면 채움).
    - 단일 config 포맷: 버전 1개("버전 1")로 승계.
    반환은 런타임 형태(현재 버전 config 가 entry.config 로 펼쳐짐). */
function migrateEntry(parsed) {
  if (!parsed?.id) return null
  const createdAt = parsed.createdAt
  let versions
  if (Array.isArray(parsed.versions) && parsed.versions.length > 0) {
    versions = parsed.versions.map((v, i) => ({
      id: v.id ?? newVersionId(),
      name: v.name ?? `버전 ${i + 1}`,
      description: v.description ?? '',
      config: fillConfig(v.config),
      createdAt: v.createdAt ?? v.savedAt ?? createdAt,
    }))
  } else {
    versions = [
      { id: newVersionId(), name: '버전 1', description: '', config: fillConfig(parsed.config), createdAt },
    ]
  }
  const ids = versions.map((v) => v.id)
  const currentVersionId = ids.includes(parsed.currentVersionId)
    ? parsed.currentVersionId
    : ids.includes(parsed.appliedVersionId)
      ? parsed.appliedVersionId
      : versions[versions.length - 1].id
  const deployedVersionId = ids.includes(parsed.deployedVersionId) ? parsed.deployedVersionId : null
  return withCurrentConfig({
    id: parsed.id,
    name: parsed.name ?? '',
    createdAt,
    updatedAt: parsed.updatedAt ?? createdAt,
    versions,
    currentVersionId,
    deployedVersionId,
  })
}

/** 저장된 디자인 전체 목록 — 최근 수정순. 손상 항목은 무시 */
export function loadLauncherList() {
  if (typeof window === 'undefined') return []
  const list = []
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i)
    if (!key?.startsWith(STORAGE_PREFIX)) continue
    try {
      const entry = migrateEntry(JSON.parse(window.localStorage.getItem(key)))
      if (entry) list.push(entry)
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

/** id 로 단일 디자인 엔트리 로드 — 없으면 null */
export function loadLauncher(id) {
  if (typeof window === 'undefined' || !id) return null
  try {
    return migrateEntry(JSON.parse(window.localStorage.getItem(keyFor(id))))
  } catch {
    return null
  }
}

/** 저장은 stored 형태로 — 런타임 파생 필드(config)는 저장하지 않는다 */
function writeEntry(entry) {
  const { config, ...stored } = entry
  window.localStorage.setItem(keyFor(entry.id), JSON.stringify(stored))
}

/** 디자인 신규 생성 — config 를 버전 1개("버전 1")로 시작 */
export function createLauncher({ id, name, config, nowIso }) {
  if (typeof window === 'undefined') return null
  const version = { id: newVersionId(), name: '버전 1', description: '', config: fillConfig(config), createdAt: nowIso }
  const entry = {
    id,
    name,
    createdAt: nowIso,
    updatedAt: nowIso,
    versions: [version],
    currentVersionId: version.id,
    deployedVersionId: null,
  }
  writeEntry(entry)
  return withCurrentConfig(entry)
}

/** 새 버전 저장 — 현재 설정값을 명명된 버전으로 추가하고 현재 버전으로 지정.
 *  versionName 은 런처 내 유일해야 한다(호출부 검증 + 여기서도 가드). */
export function saveLauncherVersion({ id, name, versionName, description, config, nowIso }) {
  if (typeof window === 'undefined') return null
  const entry = loadLauncher(id)
  if (!entry) return null
  const trimmed = (versionName || '').trim()
  if (!trimmed || isVersionNameTaken(entry.versions, trimmed)) return null
  const version = {
    id: newVersionId(),
    name: trimmed,
    description: (description ?? '').trim(),
    config: fillConfig(config),
    createdAt: nowIso,
  }
  const next = {
    id,
    name: name ?? entry.name,
    createdAt: entry.createdAt,
    updatedAt: nowIso,
    versions: [...entry.versions, version],
    currentVersionId: version.id,
    deployedVersionId: entry.deployedVersionId,
  }
  writeEntry(next)
  return withCurrentConfig(next)
}

/** 버전 정보(이름+설명) 수정 — 이름은 디자인 내 유일해야 함(빈값·중복이면 무시) */
export function editLauncherVersion({ id, versionId, name, description, nowIso }) {
  if (typeof window === 'undefined') return null
  const entry = loadLauncher(id)
  if (!entry) return null
  const trimmed = (name || '').trim()
  if (!trimmed || isVersionNameTaken(entry.versions, trimmed, versionId)) return null
  const versions = entry.versions.map((v) =>
    v.id === versionId ? { ...v, name: trimmed, description: (description ?? '').trim() } : v,
  )
  const next = {
    id,
    name: entry.name,
    createdAt: entry.createdAt,
    updatedAt: nowIso,
    versions,
    currentVersionId: entry.currentVersionId,
    deployedVersionId: entry.deployedVersionId,
  }
  writeEntry(next)
  return withCurrentConfig(next)
}

/** 버전 삭제 — 최소 1개는 유지. 현재 버전 삭제 시 최신으로, 배포 버전 삭제 시 배포 해제 */
export function deleteLauncherVersion({ id, versionId, nowIso }) {
  if (typeof window === 'undefined') return null
  const entry = loadLauncher(id)
  if (!entry || entry.versions.length <= 1) return null
  const versions = entry.versions.filter((v) => v.id !== versionId)
  if (versions.length === entry.versions.length) return null // 없는 id
  const currentVersionId =
    entry.currentVersionId === versionId ? versions[versions.length - 1].id : entry.currentVersionId
  const deployedVersionId = entry.deployedVersionId === versionId ? null : entry.deployedVersionId
  const next = {
    id,
    name: entry.name,
    createdAt: entry.createdAt,
    updatedAt: nowIso,
    versions,
    currentVersionId,
    deployedVersionId,
  }
  writeEntry(next)
  return withCurrentConfig(next)
}

/** 이름만 변경(런처 이름) — 버전은 그대로 */
export function renameLauncher({ id, name, nowIso }) {
  if (typeof window === 'undefined') return null
  const entry = loadLauncher(id)
  if (!entry) return null
  const next = { ...entry, name, updatedAt: nowIso }
  writeEntry(next)
  return withCurrentConfig(next)
}

/** 최신(가장 최근 생성) 버전 — 목록 "최신 버전명" 용 */
export function latestVersion(entry) {
  return entry?.versions?.length ? entry.versions[entry.versions.length - 1] : null
}

/** 배포 버전 — 미배포면 null (배포 기능 미구현, 자리만) */
export function deployedVersion(entry) {
  if (!entry?.deployedVersionId) return null
  return entry.versions?.find((v) => v.id === entry.deployedVersionId) ?? null
}

/** 버전명 중복 검사 — 같은 이름의 다른 버전이 있으면 true */
export function isVersionNameTaken(versions, versionName, excludeId = null) {
  const t = (versionName || '').trim()
  if (!t) return false
  return (versions ?? []).some((v) => v.name === t && v.id !== excludeId)
}

export function deleteLauncher(id) {
  if (typeof window === 'undefined' || id === DEFAULT_LAUNCHER_ID) return
  window.localStorage.removeItem(keyFor(id))
}

/** 기본 디자인이 없으면 생성 — 목록에 항상 하나는 존재하도록 보장 */
export function ensureDefaultLauncher(nowIso) {
  if (typeof window === 'undefined') return
  if (loadLauncher(DEFAULT_LAUNCHER_ID)) return
  createLauncher({ id: DEFAULT_LAUNCHER_ID, name: '기본값', config: defaultLauncherConfig(), nowIso })
}

/** 이름 중복 검사 — 같은 이름의 다른 엔트리가 있으면 true (excludeId 는 자기 자신 제외) */
export function isLauncherNameTaken(name, excludeId = null) {
  const trimmed = (name || '').trim()
  if (!trimmed) return false
  return loadLauncherList().some((l) => l.name === trimmed && l.id !== excludeId)
}
