// 단계(step) 데이터 구조 정의 — 빌더 단위 블록의 단일 출처
//
// 단계는 컴포지트 단위로, 안에 messageConfig (액션·이미지·텍스트·버튼·캐로셀·폼 등)를 가진다.
// messageConfig 의 구체 형태는 lib/chatMessageDefaults.js 참조.

import { createDefaultMessageConfig } from './chatMessageDefaults.js'

let stepSeq = 0
export const nextStepId = () => `step_${Date.now().toString(36)}_${stepSeq++}`

export function createEmptyStep() {
  return {
    id: nextStepId(),
    name: '새 단계',
    status: 'warning',
    messageConfig: createDefaultMessageConfig(),
  }
}
