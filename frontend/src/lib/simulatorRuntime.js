// 시뮬레이터 런타임 — 봇 세션 상태 전이 (UI 무관 순수 함수)
//
// 세션 객체.
//   { scenarios, history: [...events], ended: boolean, error?: string }
// history 의 event 종류.
//   { kind: 'bot', scenarioId, responseId, response }
//   { kind: 'user-click', label, link }
//   { kind: 'system', text }  // URL 이동 안내, 종료 사유 등
//
// 외부 호출.
//   createSession(scenarios) → 봇의 첫 시나리오 트리거에서 시작
//   clickButton(session, label, link) → 버튼 클릭 처리
//   restart(session) → 세션 초기화

const TRIGGER_TARGET = 'trigger'

/** 시나리오 + responseId 가 유효한지 검증 후 bot 메시지 이벤트 생성 */
function resolveResponse(scenarios, scenarioId, responseId) {
  if (responseId === TRIGGER_TARGET) {
    // 트리거로 점프 — 그 시나리오의 triggerTargetResponseId 로 다시 해석
    const sc = scenarios.find((s) => s.id === scenarioId)
    if (!sc) return { error: '시나리오를 찾을 수 없습니다' }
    const next = sc.triggerTargetResponseId || sc.responses?.[0]?.id
    if (!next) return { error: '시나리오에 응답이 없습니다' }
    return resolveResponse(scenarios, scenarioId, next)
  }
  const sc = scenarios.find((s) => s.id === scenarioId)
  if (!sc) return { error: '시나리오를 찾을 수 없습니다' }
  const response = sc.responses?.find((r) => r.id === responseId)
  if (!response) return { error: '응답을 찾을 수 없습니다' }
  return { scenarioId, responseId, response }
}

/** 봇의 첫 시나리오 트리거에서 시작 — scenarios[0] 이 봇의 진입점 */
export function createSession(scenarios) {
  const list = Array.isArray(scenarios) ? scenarios : []
  if (list.length === 0) {
    return { scenarios: list, history: [], ended: true, error: '봇에 시나리오가 없습니다' }
  }
  const entry = list[0]
  const entryTarget = entry.triggerTargetResponseId || entry.responses?.[0]?.id
  if (!entryTarget) {
    return {
      scenarios: list,
      history: [{ kind: 'system', text: `'${entry.name}' 시나리오에 응답이 없습니다.` }],
      ended: true,
    }
  }
  const resolved = resolveResponse(list, entry.id, entryTarget)
  if (resolved.error) {
    return {
      scenarios: list,
      history: [{ kind: 'system', text: resolved.error }],
      ended: true,
    }
  }
  return {
    scenarios: list,
    history: [
      {
        kind: 'bot',
        scenarioId: resolved.scenarioId,
        responseId: resolved.responseId,
        response: resolved.response,
      },
    ],
    ended: false,
  }
}

/** 사용자가 응답의 버튼 클릭. label/link 는 응답의 mainLink/subLink/quickList 중 하나. */
export function clickButton(session, label, link) {
  if (session.ended) return session

  // 사용자 클릭은 항상 history 에 user-click 으로 기록
  const userEvent = { kind: 'user-click', label, link }

  // 봇 응답으로 이동 — link.type === 'bot' + targetScenarioId + targetResponseId
  if (link?.type === 'bot' && link.targetScenarioId && link.targetResponseId) {
    const resolved = resolveResponse(
      session.scenarios,
      link.targetScenarioId,
      link.targetResponseId,
    )
    if (resolved.error) {
      return {
        ...session,
        history: [...session.history, userEvent, { kind: 'system', text: resolved.error }],
        ended: true,
      }
    }
    return {
      ...session,
      history: [
        ...session.history,
        userEvent,
        {
          kind: 'bot',
          scenarioId: resolved.scenarioId,
          responseId: resolved.responseId,
          response: resolved.response,
        },
      ],
      ended: false,
    }
  }

  // URL 링크 — 대화는 계속, 시스템 메시지로 URL 이동 안내만 표시
  if (link?.type === 'url' && link.url) {
    return {
      ...session,
      history: [
        ...session.history,
        userEvent,
        { kind: 'system', text: `🔗 외부 링크로 이동: ${link.url}` },
      ],
    }
  }

  // 링크 미완성 — 시스템 안내
  return {
    ...session,
    history: [
      ...session.history,
      userEvent,
      { kind: 'system', text: '이 버튼은 연결 응답이 설정되어 있지 않습니다.' },
    ],
  }
}

/** 세션 재시작 — scenarios 는 그대로 두고 history 초기화 */
export function restart(session) {
  return createSession(session.scenarios)
}

/** 사용자 자유 발화 — 챗 입력창에서 텍스트 전송.
 *  현 단계는 매칭 로직 없음 (TEI 기반 발화 매칭은 추후 도입). 발화만 history 에 기록. */
export function sendUtterance(session, text) {
  const trimmed = text?.trim()
  if (!trimmed) return session
  return {
    ...session,
    history: [...session.history, { kind: 'user-utterance', text: trimmed }],
  }
}

/** 현재 활성 봇 응답 — 마지막 bot 이벤트 (없으면 null) */
export function getActiveResponse(session) {
  for (let i = session.history.length - 1; i >= 0; i--) {
    const ev = session.history[i]
    if (ev.kind === 'bot') return ev
  }
  return null
}
