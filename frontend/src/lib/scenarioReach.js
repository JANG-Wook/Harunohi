// 시나리오 그래프 정적 분석 — 특정 응답에 도달했을 때 "흐름으로 채워진" 변수 ID 셋을 추정.
//
// 사용자 멘탈모델: 메모리는 "대화 흐름이 진행되면서 쌓이는 값". manual sampleValue 는 시뮬레이터
// 미리보기용 기본값이지 흐름이 채운 값이 아니므로 여기서는 포함하지 않는다 (UI 에서 별도 상태로 표시).
//
// 추정 규칙.
//   1) 입력 폼 응답을 거쳐왔다면 그 폼의 memoryVariableId → 채워짐.
//   2) API 응답을 거쳐왔다면 그 API(apiId) 를 sourceApiId 로 갖는 변수들 → 채워짐.
//   3) SSO 응답을 거쳐왔다면 tokenVariableId, memberCodeVariableId → 채워짐.
//
// 그래프 정의.
//   - 노드: (scenarioId, responseId).
//   - 엣지: 각 응답이 가진 모든 bot 타입 link (mainLink/subLink/quickList/카드/form.nextLink/api.nextLink/sso.nextLink)
//          + 시나리오 트리거가 triggerTargetResponseId 로 지목한 첫 응답.
//
// 알고리즘: 타깃 응답에서 역방향 BFS. 모든 응답을 한 번씩 훑어 outgoing 링크가 visited 셋에 닿는 응답을
// 후보(predecessor) 로 끌어들이는 방식. 시나리오 수가 적어 비용은 신경 안 써도 된다.

/** 한 응답의 messageConfig 에서 outgoing bot 링크의 (scenarioId, responseId) 목록을 모은다. */
function collectOutgoingTargets(response) {
  const cfg = response?.messageConfig
  if (!cfg) return []
  const out = []
  const push = (link) => {
    if (link?.type === 'bot' && link.targetScenarioId && link.targetResponseId) {
      out.push({ scenarioId: link.targetScenarioId, responseId: link.targetResponseId })
    }
  }
  const texts = cfg.texts ?? {}
  push(texts.mainLink)
  push(texts.subLink)
  for (const card of cfg.carouselCards ?? []) {
    push(card?.mainLink)
    push(card?.subLink)
  }
  const perMode = cfg.perMode?.[cfg.mode]
  for (const q of perMode?.quickList ?? []) push(q?.link)
  push(cfg.form?.nextLink)
  push(cfg.api?.nextLink)
  push(cfg.sso?.nextLink)
  return out
}

/** 노드 키 헬퍼 */
const nk = (s, r) => `${s}::${r}`

/**
 * 타깃(scenarioId, responseId) 까지 도달 가능한 모든 (scenarioId, responseId) 의 집합 반환.
 * 타깃 자신은 포함하지 않는다 (그 응답 "전" 까지 채워진 변수를 보고 싶기 때문).
 */
function findUpstreamNodes(scenarios, targetScenarioId, targetResponseId) {
  if (!targetScenarioId || !targetResponseId) return new Set()

  // 시나리오 트리거 → 첫 응답 가상 엣지 표현용. predecessor 가 시나리오 트리거인 경우는
  // 변수 채움이 없으므로 visited 에만 넣고 본문 분석은 생략한다.
  const allResponses = []
  for (const sc of scenarios ?? []) {
    for (const r of sc.responses ?? []) {
      allResponses.push({ scenarioId: sc.id, response: r })
    }
  }

  const visited = new Set()
  visited.add(nk(targetScenarioId, targetResponseId))
  const queue = [{ scenarioId: targetScenarioId, responseId: targetResponseId }]

  while (queue.length > 0) {
    const cur = queue.shift()
    const curKey = nk(cur.scenarioId, cur.responseId)

    // 1) 일반 응답 predecessor — outgoing 링크가 cur 을 가리키는 응답들
    for (const { scenarioId, response } of allResponses) {
      const targets = collectOutgoingTargets(response)
      const hit = targets.some(
        (t) => t.scenarioId === cur.scenarioId && t.responseId === cur.responseId,
      )
      if (!hit) continue
      const key = nk(scenarioId, response.id)
      if (visited.has(key)) continue
      visited.add(key)
      queue.push({ scenarioId, responseId: response.id })
    }

    // 2) 시나리오 트리거 predecessor — triggerTargetResponseId 가 cur 을 가리키면
    //    트리거 자체는 변수를 채우지 않으니 visited 만 표시하고 큐엔 안 넣음.
    //    단, 트리거에 도달하면 그 시나리오의 진입로가 다른 시나리오의 cross-link 일 가능성은
    //    이미 위의 일반 응답 predecessor 검사로 커버되므로 추가 작업 불필요.
    for (const sc of scenarios ?? []) {
      if (sc.triggerTargetResponseId === cur.responseId && sc.id === cur.scenarioId) {
        visited.add(nk(sc.id, 'trigger'))
      }
    }

    // curKey 가 시작점이 아니라면 이미 위에서 처리됨. 단순한 자기 자신 제외만 보장.
    if (curKey === nk(targetScenarioId, targetResponseId)) {
      // no-op — 타깃 자기 자신은 결과에서 제외할 거라서 visited 에는 두되 응답 본문 분석은 제외.
    }
  }

  return visited
}

/**
 * 타깃 응답에 도달했을 때 채워졌을 변수 id 의 Set 을 반환.
 *
 *   scenarios:        Scenario[]
 *   variables:        Variable[]
 *   targetScenarioId / targetResponseId: 검사 대상 응답
 *
 * 반환: Set<variableId>.
 */
export function computeFilledVariableIds(scenarios, variables, targetScenarioId, targetResponseId) {
  const filled = new Set()
  const vars = Array.isArray(variables) ? variables : []

  if (!targetScenarioId || !targetResponseId) return filled

  const upstreamKeys = findUpstreamNodes(scenarios, targetScenarioId, targetResponseId)
  // 타깃 자신은 채움 대상에서 제외 (이 응답 "도착 직전" 시점)
  upstreamKeys.delete(nk(targetScenarioId, targetResponseId))

  // 업스트림 노드의 응답이 채우는 변수 누적
  for (const sc of scenarios ?? []) {
    for (const r of sc.responses ?? []) {
      if (!upstreamKeys.has(nk(sc.id, r.id))) continue
      const cfg = r.messageConfig
      if (!cfg) continue

      // 입력 폼 — memoryVariableId
      if (cfg.mode === 'inputForm' && cfg.form?.memoryVariableId) {
        filled.add(cfg.form.memoryVariableId)
      }

      // API — sourceApiId 가 일치하는 변수 모두
      if (cfg.mode === 'api' && cfg.api?.apiId) {
        const apiId = cfg.api.apiId
        for (const v of vars) {
          if (v.sourceType === 'api' && (v.sourceApiId === apiId || v.sourceId === apiId)) {
            filled.add(v.id)
          }
        }
      }

      // SSO — token / memberCode 변수
      if (cfg.mode === 'sso' && cfg.sso) {
        if (cfg.sso.tokenVariableId) filled.add(cfg.sso.tokenVariableId)
        if (cfg.sso.memberCodeVariableId) filled.add(cfg.sso.memberCodeVariableId)
      }
    }
  }

  return filled
}
