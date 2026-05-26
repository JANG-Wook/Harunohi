// 응답(response) + 시나리오(scenario) 데이터 구조 — 빌더 단위 블록의 단일 출처
//
// 봇 → scenarios[] → responses[] 3계층. 응답은 컴포지트 단위로, 안에 messageConfig
// (액션·이미지·텍스트·버튼·캐로셀·폼 등)를 가진다. messageConfig 구체 형태는
// lib/chatMessageDefaults.js 참조.
//
// 변수명은 호환을 위해 step / createEmptyStep 등 유지하나 UI 명칭은 "응답".

import { createDefaultMessageConfig, hasImage, isLinkComplete } from './chatMessageDefaults.js'

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
