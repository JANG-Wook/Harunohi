// 챗봇 메시지 응답 설정의 상수·기본값·헬퍼 — HailMary ChatMessagePage 에서 추출
//
// 각 step 은 아래 형태의 messageConfig 를 가진다. ChatMessageConfig 가 편집하고
// ChatMessagePreview 가 렌더링한다.

export const PH = {
  title: '제목 텍스트',
  body: '본문 텍스트',
  accordion: '아코디언 펼침 시 보일 텍스트',
  mainLabel: '메인 버튼',
  subLabel: '서브 버튼',
  quickItem: '퀵 버튼',
}

export const FILE_CAPTION_IMAGE = '* Jpg, Jpeg, Png · 최대 2MB · 정사각형 비율 권장'
export const FILE_CAPTION_BANNER = '* Jpg, Jpeg, Png · 최대 2MB · 권장 800 × 400 (2:1)'
export const IMAGE_MAX_SIZE = 2 * 1024 * 1024 // 2MB
export const IMAGE_ALLOWED_TYPES = ['image/jpeg', 'image/png']

/** 이미지 파일 값에서 url 추출 — 신 포맷 {name, url} / 구 포맷 string 둘 다 처리 */
export function getImageUrl(file) {
  if (!file) return ''
  if (typeof file === 'string') return file
  return file.url ?? ''
}

/** 이미지 파일 값에서 표시용 이름 추출 — 구 포맷이거나 이름 없으면 fallback */
export function getImageName(file) {
  if (!file) return ''
  if (typeof file === 'string') return file ? '이미지 파일' : ''
  return file.name || '이미지 파일'
}

/** 파일 값이 비어있지 않은지 — UI 분기 용 */
export function hasImage(file) {
  return !!getImageUrl(file)
}

export const ACTION_TYPES = [
  { value: 'single', label: '단일 메시지' },
  { value: 'carousel', label: '캐로셀 메시지' },
  { value: 'inputForm', label: '입력 폼 메시지' },
  { value: 'rag', label: 'RAG 메시지' },
  { value: 'branch', label: '분기 연결' },
  { value: 'api', label: 'API 호출' },
  { value: 'sso', label: 'SSO 로그인' },
]

export const HTTP_METHODS = [
  { value: 'GET',    label: 'GET - 조회, 데이터를 가져올 때' },
  { value: 'POST',   label: 'POST - 등록, 데이터를 새로 만들거나 작업을 요청할 때' },
  { value: 'PUT',    label: 'PUT - 수정, 데이터를 통째로 바꿀 때' },
  { value: 'PATCH',  label: 'PATCH - 부분 수정, 데이터 일부만 바꿀 때' },
  { value: 'DELETE', label: 'DELETE - 삭제, 데이터를 지울 때' },
]

export const FORM_TYPES = [
  { value: 'textfield', label: 'String (Textfield)', hasOptions: false, hasGuide: true, sampleDesc: '자유 입력', samplePlaceholder: '내용을 입력해 주세요.' },
  { value: 'textarea', label: 'String (Textarea)', hasOptions: false, hasGuide: true, sampleDesc: '주관식 의견', samplePlaceholder: '의견을 남겨주세요.' },
  { value: 'phone', label: 'Phone (휴대폰 번호)', hasOptions: false, hasGuide: true, sampleDesc: '휴대폰 번호', samplePlaceholder: '예: 01012345678' },
  { value: 'email', label: 'Email (이메일)', hasOptions: false, hasGuide: true, sampleDesc: '이메일', samplePlaceholder: '예: hong@example.com' },
  { value: 'url', label: 'URL', hasOptions: false, hasGuide: true, sampleDesc: 'URL', samplePlaceholder: '예: https://example.com' },
  { value: 'date', label: 'Date (단일 선택)', hasOptions: false, hasGuide: true, sampleDesc: '예약일', samplePlaceholder: '날짜 선택' },
  { value: 'dateRange', label: 'Date (기간 선택)', hasOptions: false, hasGuide: true, sampleDesc: '예약 기간', samplePlaceholder: '기간 선택' },
  { value: 'datetime', label: 'Date time (단일 선택)', hasOptions: false, hasGuide: true, hasTime: true, sampleDesc: '예약 일시', samplePlaceholder: '날짜 선택', sampleTimePlaceholder: '시간 선택' },
  { value: 'selectSingle', label: 'Select (단일 선택)', hasOptions: true, hasGuide: true, sampleDesc: '항목', samplePlaceholder: '항목을 선택해 주세요.' },
  { value: 'selectMulti', label: 'Select (복수 선택)', hasOptions: true, hasGuide: true, sampleDesc: '항목', samplePlaceholder: '항목을 선택해 주세요.' },
  { value: 'checkboxSingle', label: 'Checkbox (단일 선택)', hasOptions: true, hasGuide: false, sampleDesc: '항목', samplePlaceholder: '' },
  { value: 'checkboxMulti', label: 'Checkbox (복수 선택)', hasOptions: true, hasGuide: false, sampleDesc: '항목', samplePlaceholder: '' },
  { value: 'boolean', label: 'Boolean', hasOptions: true, hasGuide: false, sampleDesc: '동의 여부', samplePlaceholder: '' },
  { value: 'number', label: 'Number', hasOptions: false, hasGuide: true, sampleDesc: '예약 인원', samplePlaceholder: '숫자를 입력해 주세요.' },
]

export const defaultFormOptionsFor = (type) => {
  if (type === 'boolean') return [{ id: 1, label: '예' }, { id: 2, label: '아니오' }]
  return [{ id: 1, label: '' }, { id: 2, label: '' }]
}

export const sampleDescFor = (type) => FORM_TYPES.find((t) => t.value === type)?.sampleDesc ?? ''
export const samplePlaceholderFor = (type) => FORM_TYPES.find((t) => t.value === type)?.samplePlaceholder ?? ''
export const sampleTimePlaceholderFor = (type) => FORM_TYPES.find((t) => t.value === type)?.sampleTimePlaceholder ?? ''

/**
 * 버튼 연결 — type=null 이면 미선택.
 *  'bot': targetScenarioId + targetResponseId 사용. targetResponseId 가 'trigger'면 시나리오 시작점으로 점프.
 *  'url': url 사용.
 * 호환: 구포맷 { targetStepId } 로 저장된 데이터는 BotCanvasPage 의 마이그레이션에서 새 형태로 변환된다.
 */
export function defaultLink() {
  return { type: null, targetScenarioId: '', targetResponseId: '', url: '' }
}

export const LINK_TRIGGER_TARGET = 'trigger'

/** 연결 완성 여부 (negative 상태 판정에 사용) */
export function isLinkComplete(link) {
  if (!link) return false
  if (link.type === 'bot') {
    // 신포맷 우선, 레거시(targetStepId) 도 채워져 있으면 완성으로 간주
    if (link.targetScenarioId && link.targetResponseId) return true
    if (link.targetStepId) return true
    return false
  }
  if (link.type === 'url') return !!(link.url && link.url.trim())
  return false
}

export function defaultCarouselCard(id) {
  return {
    id,
    imageOn: false,
    textOn: true,
    titleOn: true,
    bodyOn: true,
    buttonOn: true,
    mainOn: true,
    subOn: false,
    title: [{ text: '제목 텍스트', weight: 'bold' }],
    body: [{ text: '본문 텍스트', weight: 'regular' }],
    mainLabel: '메인 버튼',
    subLabel: '서브 버튼',
    mainLink: defaultLink(),
    subLink: defaultLink(),
    imageFile: '',
  }
}

/** 모드별 message-level 부가 설정 (배너 + 퀵 버튼)의 기본값 */
export function defaultPerModeExtras() {
  return {
    messageBannerOn: false,
    bannerFile: '',
    quickButtonOn: false,
    quickList: [
      { id: 1, label: '', link: defaultLink() },
      { id: 2, label: '', link: defaultLink() },
    ],
  }
}

/** 새 응답 기본 perMode — 퀵 버튼 ON("처음으로"), 배너 OFF. 단일/캐로셀/입력폼에 사용 */
function filledPerModeExtras() {
  return {
    messageBannerOn: false,
    bannerFile: '',
    quickButtonOn: true,
    quickList: [{ id: 1, label: '처음으로', link: defaultLink() }],
  }
}

/** SSO 로그인 응답 설정.
 *  ssoUrl: 팝업으로 열 SSO 페이지 URL (예: /mock-sso/login).
 *  exchangeUrl: authCode → accessToken 교환 API.
 *  tokenVariableId / memberCodeVariableId: 받은 값을 저장할 변수 id (선택).
 *  nextLink: 로그인 완료 후 진행할 응답 (기존 LinkEditor 형식). */
export function defaultSsoConfig() {
  return {
    ssoUrl: '',
    exchangeUrl: '',
    tokenVariableId: '',
    memberCodeVariableId: '',
    nextLink: defaultLink(),
  }
}

/** 응답이 들고 있는 API 참조 — 등록된 API 의 id + 호출 후 진행할 응답 링크.
 *  실제 method/URL/headers/body 는 bot.apis 의 해당 엔트리에 보관. */
export function defaultApiConfig() {
  return {
    apiId: '',           // bot.apis 의 entry id (없으면 미선택 상태)
    nextLink: defaultLink(),
  }
}

/** 봇 레벨 등록 API 엔트리 — 한 번 등록하고 여러 응답에서 재사용.
 *  id, name, description, method, url, headers, body 는 정의 정보.
 *  lastTestResult 는 마지막 테스트 결과 (변수 등록 UI 표시용). */
export function defaultApiEntry(id) {
  return {
    id,
    name: '새 API',
    description: '',
    method: 'POST',
    url: '',
    headers: [{ id: 1, key: '', value: '' }],
    body: '',
    lastTestResult: null,
  }
}

/** 새 단계의 메시지 설정 기본값 — 모든 토글 ON 으로 시작 */
export function createDefaultMessageConfig() {
  return {
    // 메시지 본문 토글 (모든 모드에 적용)
    cfg: {
      messageOn: true,
      imageOn: false,
      textOn: true,
      titleOn: true,
      bodyOn: true,
      accordionOn: false,
      buttonOn: true,
      mainOn: true,
      subOn: false,
    },
    mode: 'single',
    texts: {
      title: [{ text: '제목 텍스트', weight: 'bold' }],
      body: [{ text: '본문 텍스트', weight: 'regular' }],
      accordion: [],
      mainLabel: '메인 버튼',
      subLabel: '서브 버튼',
      mainLink: defaultLink(),
      subLink: defaultLink(),
    },
    imageFile: '',
    carouselCards: [defaultCarouselCard(1), defaultCarouselCard(2)],
    activeCardIdx: 0,
    form: {
      type: 'textfield',
      description: sampleDescFor('textfield'),
      guideText: samplePlaceholderFor('textfield'),
      timeGuideText: sampleTimePlaceholderFor('textfield'),
      options: defaultFormOptionsFor('textfield'),
      /** 사용자 입력을 저장할 변수 id — bot.variables 의 id. 없으면 저장 안 함. */
      memoryVariableId: '',
      /** 제출 후 진행할 응답 — bot 타입 link (기존 LinkEditor 형식) */
      nextLink: defaultLink(),
    },
    // 모드별 메시지 레벨 부가 설정 (배너, 퀵 버튼) — 단일/캐로셀/입력폼/RAG/분기 각각 독립
    perMode: {
      single: filledPerModeExtras(),
      carousel: filledPerModeExtras(),
      inputForm: filledPerModeExtras(),
      rag: defaultPerModeExtras(),
      branch: defaultPerModeExtras(),
      api: defaultPerModeExtras(),
      sso: defaultPerModeExtras(),
    },
    // API 호출 설정 (mode === 'api' 일 때 사용). 다른 모드에선 무시.
    api: defaultApiConfig(),
    // SSO 로그인 설정 (mode === 'sso' 일 때 사용). 다른 모드에선 무시.
    sso: defaultSsoConfig(),
  }
}
