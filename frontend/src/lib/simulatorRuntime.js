// 시뮬레이터 런타임 — 봇 세션 상태 전이 (UI 무관 순수 함수 + 비동기 fetch).
//
// 세션 객체.
//   { scenarios, variables, memory, history, ended, error? }
//   - variables: 봇 변수 정의 (originalKey/displayName/sourcePath 등)
//   - memory: 런타임 값 { [key]: value }. 처음엔 변수 sampleValue 로 초기화.
//             API 호출 응답이 사용자가 등록한 변수의 sourcePath 를 통해 채워짐.
//
// history 의 event 종류.
//   { kind: 'bot', scenarioId, responseId, response }
//   { kind: 'user-click', label, link }
//   { kind: 'user-utterance', text }
//   { kind: 'system', text }   // URL 이동/오류/API 실행 안내
//
// 외부 호출.
//   createSession({ scenarios, variables }) → 봇의 첫 시나리오 트리거에서 시작
//   clickButton(session, label, link)       → 버튼 클릭 처리
//   sendUtterance(session, text)            → 자유 발화 기록만 (매칭은 추후)
//   restart(session)                        → 세션 초기화
//   advanceApiIfNeeded(session) async       → 활성 봇 응답이 API mode 면 fetch 후 다음 응답으로

const TRIGGER_TARGET = 'trigger'

/** 봇 변수 배열 → 초기 메모리 객체 (sampleValue 를 그대로 가져옴) */
function initialMemoryFromVariables(variables) {
  const memory = {}
  if (!Array.isArray(variables)) return memory
  for (const v of variables) {
    if (v?.originalKey) memory[v.originalKey] = v.sampleValue ?? ''
    if (v?.displayName?.trim()) memory[v.displayName.trim()] = v.sampleValue ?? ''
  }
  return memory
}

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

/** 봇의 첫 시나리오 트리거에서 시작 — scenarios[0] 이 봇의 진입점.
 *  payload: { scenarios, variables?, apis? } — 구포맷(배열만 전달) 도 호환. */
export function createSession(payload) {
  const scenarios = Array.isArray(payload) ? payload : payload?.scenarios ?? []
  const variables = Array.isArray(payload) ? [] : payload?.variables ?? []
  const apis = Array.isArray(payload) ? [] : payload?.apis ?? []
  const memory = initialMemoryFromVariables(variables)
  const base = { scenarios, variables, apis, memory }

  if (scenarios.length === 0) {
    return { ...base, history: [], ended: true, error: '봇에 시나리오가 없습니다' }
  }
  const entry = scenarios[0]
  const entryTarget = entry.triggerTargetResponseId || entry.responses?.[0]?.id
  if (!entryTarget) {
    return {
      ...base,
      history: [{ kind: 'system', text: `'${entry.name}' 시나리오에 응답이 없습니다.` }],
      ended: true,
    }
  }
  const resolved = resolveResponse(scenarios, entry.id, entryTarget)
  if (resolved.error) {
    return { ...base, history: [{ kind: 'system', text: resolved.error }], ended: true }
  }
  return {
    ...base,
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

/** 세션 재시작 — scenarios/variables/apis 는 그대로 두고 history+memory 초기화 */
export function restart(session) {
  return createSession({
    scenarios: session.scenarios,
    variables: session.variables,
    apis: session.apis,
  })
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

/** memory + variables 를 합쳐 봇 변수 형태로 반환 — interpolate 에 넘기기 위함 */
export function effectiveVariables(session) {
  const memory = session.memory ?? {}
  // memory 가 가진 키들로 가상 변수 만들기 (originalKey 만 채움)
  const memoryVars = Object.entries(memory).map(([k, v]) => ({
    originalKey: k,
    sampleValue: v == null ? '' : String(v),
  }))
  // 등록된 변수에 displayName 정보 보존 — 같은 originalKey 면 memory 값으로 덮어쓰기
  const declared = (session.variables ?? []).map((v) => ({
    ...v,
    sampleValue: memory[v.originalKey] ?? memory[v.displayName?.trim() ?? ''] ?? v.sampleValue ?? '',
  }))
  return [...memoryVars, ...declared]
}

/** 응답 트리에서 sourcePath 값 추출 — apiCaller.getValueAtPath 와 동형 (런타임 의존 없게 inline) */
function valueAtPath(obj, path) {
  if (!obj || !path) return undefined
  const parts = path.split('.')
  let cur = obj
  for (const p of parts) {
    if (cur == null) return undefined
    cur = cur[p]
  }
  return cur
}

/** 활성 봇 응답이 API mode 면 등록 API 를 찾아 실제 호출 후 변수 채움 + 다음 응답으로 진행.
 *  callApi 는 외부에서 주입 (apiCaller.callApi 를 SimulatorChat 이 전달). */
export async function advanceApiIfNeeded(session, callApi) {
  if (session.ended) return session
  const active = getActiveResponse(session)
  if (!active) return session
  const cfg = active.response.messageConfig
  if (cfg?.mode !== 'api') return session

  const apiId = cfg.api?.apiId
  const apiEntry = (session.apis ?? []).find((a) => a.id === apiId)

  // API 미선택/미존재 — 시스템 메시지만 남기고 nextLink 따라 진행 (있다면)
  if (!apiEntry) {
    const nextLink = cfg.api?.nextLink
    const sysEv = { kind: 'system', text: '연결된 API 가 없습니다. (좌측 패널에서 API 등록 후 응답에서 선택)' }
    if (nextLink?.type === 'bot' && nextLink.targetScenarioId && nextLink.targetResponseId) {
      const resolved = resolveResponse(session.scenarios, nextLink.targetScenarioId, nextLink.targetResponseId)
      if (resolved.error) {
        return { ...session, history: [...session.history, sysEv, { kind: 'system', text: resolved.error }], ended: true }
      }
      return {
        ...session,
        history: [
          ...session.history,
          sysEv,
          { kind: 'bot', scenarioId: resolved.scenarioId, responseId: resolved.responseId, response: resolved.response },
        ],
      }
    }
    return { ...session, history: [...session.history, sysEv] }
  }

  // 1) 등록 API 의 설정으로 호출 (현재 메모리/변수로 치환)
  const result = await callApi(apiEntry, effectiveVariables(session))

  // 2) 성공 시 이 API 가 소스인 변수들의 sourcePath 로 메모리 갱신
  const nextMemory = { ...session.memory }
  const systemEvents = []
  if (result.ok && result.body && typeof result.body === 'object') {
    for (const v of session.variables ?? []) {
      const isFromThisApi =
        v.sourceType === 'api' && (v.sourceApiId === apiId || v.sourceId === apiId)
      if (isFromThisApi && v.sourcePath) {
        const val = valueAtPath(result.body, v.sourcePath)
        if (val !== undefined) {
          nextMemory[v.originalKey] = String(val)
          if (v.displayName?.trim()) nextMemory[v.displayName.trim()] = String(val)
        }
      }
    }
    systemEvents.push({ kind: 'system', text: `${apiEntry.name} 호출 완료 (${result.status})` })
  } else if (result.error) {
    systemEvents.push({ kind: 'system', text: `${apiEntry.name} 호출 실패: ${result.error}` })
  } else {
    systemEvents.push({ kind: 'system', text: `${apiEntry.name} 응답 오류 (${result.status})` })
  }

  // 3) nextLink 가 있으면 다음 응답으로 진행. 없으면 대화 종료.
  const nextLink = cfg.api?.nextLink
  if (nextLink?.type === 'bot' && nextLink.targetScenarioId && nextLink.targetResponseId) {
    const resolved = resolveResponse(
      session.scenarios,
      nextLink.targetScenarioId,
      nextLink.targetResponseId,
    )
    if (resolved.error) {
      return {
        ...session,
        memory: nextMemory,
        history: [...session.history, ...systemEvents, { kind: 'system', text: resolved.error }],
        ended: true,
      }
    }
    return {
      ...session,
      memory: nextMemory,
      history: [
        ...session.history,
        ...systemEvents,
        {
          kind: 'bot',
          scenarioId: resolved.scenarioId,
          responseId: resolved.responseId,
          response: resolved.response,
        },
      ],
    }
  }
  // nextLink 미설정 — 시스템 메시지만 추가하고 대기
  return {
    ...session,
    memory: nextMemory,
    history: [...session.history, ...systemEvents],
  }
}
