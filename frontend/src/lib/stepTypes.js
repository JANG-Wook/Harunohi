// 단계(step) 데이터 구조 정의 — 빌더 단위 블록의 단일 출처
//
// 단계는 컴포지트 단위로, 안에 messageConfig (액션·이미지·텍스트·버튼·캐로셀·폼 등)를 가진다.
// messageConfig 의 구체 형태는 lib/chatMessageDefaults.js 참조.

import { createDefaultMessageConfig } from './chatMessageDefaults.js'

let stepSeq = 0
export const nextStepId = () => `step_${Date.now().toString(36)}_${stepSeq++}`

/** 인덱스 → 알파벳 라벨 (A, B, ..., Z, AA, AB, ...) */
export function letterForIndex(index) {
  let n = index
  let result = ''
  do {
    result = String.fromCharCode(65 + (n % 26)) + result
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return result
}

export function createEmptyStep(index) {
  return {
    id: nextStepId(),
    letter: letterForIndex(index),
    name: '새 단계',
    status: 'warning',
    messageConfig: createDefaultMessageConfig(),
  }
}
