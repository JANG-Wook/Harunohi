// 응답(response) + 시나리오(scenario) 데이터 구조 — 빌더 단위 블록의 단일 출처
//
// 봇 → scenarios[] → responses[] 3계층. 응답은 컴포지트 단위로, 안에 messageConfig
// (액션·이미지·텍스트·버튼·캐로셀·폼 등)를 가진다. messageConfig 구체 형태는
// lib/chatMessageDefaults.js 참조.
//
// 변수명은 호환을 위해 step / createEmptyStep 등 유지하나 UI 명칭은 "응답".

import { createDefaultMessageConfig, defaultLink, hasImage, isLinkComplete } from './chatMessageDefaults.js'

let stepSeq = 0
export const nextStepId = () => `step_${Date.now().toString(36)}_${stepSeq++}`

export function createEmptyStep() {
  return {
    id: nextStepId(),
    name: '새 응답',
    messageConfig: createDefaultMessageConfig(),
  }
}

let scenarioSeq = 0
export const nextScenarioId = () => `sc_${Date.now().toString(36)}_${scenarioSeq++}`

let variableSeq = 0
export const nextVariableId = () => `var_${Date.now().toString(36)}_${variableSeq++}`

let apiSeq = 0
export const nextApiId = () => `api_${Date.now().toString(36)}_${apiSeq++}`

/**
 * 새 봇 생성 시 기본으로 제공되는 변수 8종 — 자주 쓰이는 챗봇 패턴 커버.
 * 매 호출마다 새 id 발급해서 봇끼리 충돌 없음. 사용자는 자유롭게 삭제/편집 가능.
 */
export function createDefaultBotVariables() {
  const seed = [
    { originalKey: 'memberName',     displayName: '회원명',       sampleValue: '홍길동' },
    { originalKey: 'memberCode',     displayName: '회원코드',     sampleValue: 'M001' },
    { originalKey: 'phone',          displayName: '휴대폰번호',   sampleValue: '01012341234' },
    { originalKey: 'email',          displayName: '이메일',       sampleValue: 'hong@example.com' },
    { originalKey: 'grade',          displayName: '등급',         sampleValue: 'VIP' },
    { originalKey: 'orderNumber',    displayName: '주문번호',     sampleValue: 'ORD-20240528-001' },
    { originalKey: 'trackingNumber', displayName: '배송번호',     sampleValue: '1234567890' },
    { originalKey: 'accessToken',    displayName: '',             sampleValue: 'at_xxxxxxxxx' },
  ]
  return seed.map((entry) => ({
    id: nextVariableId(),
    originalKey: entry.originalKey,
    displayName: entry.displayName,
    sampleValue: entry.sampleValue,
    sourceType: 'manual',
    sourceId: null,
    valueType: 'string',
  }))
}

/**
 * 봇 변수 — 시뮬레이터/실런타임에서 메시지 치환에 사용.
 *   originalKey: 식별자 (예: 'memberName'). API 응답/폼 키와 매칭되는 원본 키.
 *   displayName: 사용자 별명 (예: '회원명'). 없으면 originalKey 가 표시 이름이 됨.
 *   sampleValue: 시뮬레이터 미리보기용 값 (테스트로 API 호출하면 자동 채워짐).
 *   sourceType:  'manual' | 'api' | 'form' — 변수 출처
 *   sourceId:    sourceType 이 api/form 일 때 해당 응답 id (manual 은 null)
 *   valueType:   'string' | 'number' | 'boolean' — 표시/검증용 (Phase 2A 는 string 만)
 */
export function createVariable({
  originalKey,
  displayName = '',
  sampleValue = '',
  sourceType = 'manual',
  sourceId = null,
  valueType = 'string',
}) {
  return {
    id: nextVariableId(),
    originalKey,
    displayName,
    sampleValue,
    sourceType,
    sourceId,
    valueType,
  }
}

/** 빈 시나리오 — 응답 0개로 시작, 트리거 위치만 기본값 */
export function createEmptyScenario(name = '새 시나리오') {
  return {
    id: nextScenarioId(),
    name,
    responses: [],
    positions: {},
    triggerPosition: { x: -380, y: 200 },
    triggerTargetResponseId: null,
  }
}

/** 완성된 웰컴 예시 응답 — 첫 진입 시 모든 항목이 채워진 완성형을 보여준다(모든 토글 on).
 *  이미지/배너는 public 의 예시 에셋 사용. */
function makeWelcomeExampleStep() {
  const base = createDefaultMessageConfig()
  const config = {
    ...base,
    // 예시는 모든 항목 on (새 응답 기본값과 무관하게 명시)
    cfg: {
      messageOn: true,
      imageOn: true,
      textOn: true,
      titleOn: true,
      bodyOn: true,
      accordionOn: true,
      buttonOn: true,
      mainOn: true,
      subOn: true,
    },
    texts: {
      ...base.texts,
      title: '안녕하세요. 무엇을 도와드릴까요?',
      body: '자주 묻는 질문, 영업시간, 환불, 배송 안내를 확인하실 수 있어요. 아래 버튼을 눌러 시작해 보세요.',
      accordion: '고객센터: 123',
      mainLabel: '자주 묻는 질문',
      subLabel: '환불 안내',
    },
    imageFile: { name: 'image_ex.png', url: '/image_ex.png' },
    perMode: {
      ...base.perMode,
      single: {
        ...base.perMode.single,
        messageBannerOn: true,
        bannerFile: { name: 'banner_ex.png', url: '/banner_ex.png' },
        quickButtonOn: true,
        quickList: [
          { id: 1, label: '영업 시간', link: defaultLink() },
          { id: 2, label: '배송 안내', link: defaultLink() },
        ],
      },
    },
  }
  return { id: nextStepId(), name: '웰컴메시지', messageConfig: config }
}

/** 신규 봇용 기본 시나리오 + 완성된 웰컴 예시 — 트리거가 웰컴을 가리키도록 */
export function makeDefaultScenarioWithWelcome() {
  const welcome = makeWelcomeExampleStep()
  const sc = createEmptyScenario('기본 시나리오')
  return { ...sc, responses: [welcome], triggerTargetResponseId: welcome.id }
}

/** 신규 봇의 최초 저장 데이터 — 버전 1개(기본 시나리오+웰컴, 기본 변수)로 즉시 영속 가능.
 *  localStorage 의 harunohi.bot.<id> 에 그대로 저장한다. nowIso 는 호출부에서 주입. */
export function createInitialBotData(nowIso) {
  const scenario = makeDefaultScenarioWithWelcome()
  const version = {
    id: `v_${Date.now().toString(36)}`,
    savedAt: nowIso,
    scenarios: [scenario],
    currentScenarioId: scenario.id,
    variables: createDefaultBotVariables(),
    apis: [],
  }
  return { versions: [version], currentVersionId: version.id, status: 'draft' }
}

/**
 * 단계가 "완성"되었는지 판정 — 모든 활성 토글에 값이 채워졌으면 true.
 * StepList 의 경고 아이콘 노출 여부에 사용된다.
 */
export function isStepComplete(step) {
  const config = step?.messageConfig
  if (!config) return true
  const { cfg = {}, texts = {}, imageFile, mode = 'single', carouselCards = [] } = config

  // 마스터 메시지 토글이 꺼져있으면 별도 검증 없이 OK
  if (!cfg.messageOn) return true

  // 단일 모드 — 활성화된 각 항목에 값이 있는지
  if (mode === 'single') {
    if (cfg.imageOn && !hasImage(imageFile)) return false
    if (cfg.textOn) {
      if (cfg.titleOn && !texts.title?.trim()) return false
      if (cfg.bodyOn && !texts.body?.trim()) return false
      if (cfg.accordionOn && !texts.accordion?.trim()) return false
    }
    if (cfg.buttonOn) {
      if (cfg.mainOn && (!texts.mainLabel?.trim() || !isLinkComplete(texts.mainLink))) return false
      if (cfg.subOn && (!texts.subLabel?.trim() || !isLinkComplete(texts.subLink))) return false
    }
  }

  // 캐로셀 모드 — 모든 카드가 자체 토글에 맞춰 채워졌는지
  if (mode === 'carousel') {
    for (const card of carouselCards) {
      if (card.imageOn && !hasImage(card.imageFile)) return false
      if (card.textOn) {
        if (card.titleOn && !card.title?.trim()) return false
        if (card.bodyOn && !card.body?.trim()) return false
      }
      if (card.buttonOn) {
        if (card.mainOn && (!card.mainLabel?.trim() || !isLinkComplete(card.mainLink))) return false
        if (card.subOn && (!card.subLabel?.trim() || !isLinkComplete(card.subLink))) return false
      }
    }
  }

  // 입력 폼 / RAG / 분기 — 현재 미구현 영역이라 추가 검증 생략

  // 메시지 배너 + 퀵 버튼 (모드별 perMode)
  const perMode = config.perMode?.[mode]
  if (perMode) {
    if (perMode.messageBannerOn && !hasImage(perMode.bannerFile)) return false
    if (perMode.quickButtonOn) {
      for (const item of perMode.quickList ?? []) {
        if (!item.label?.trim() || !isLinkComplete(item.link)) return false
      }
    }
  }

  return true
}
