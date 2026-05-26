// 버튼 링크 모델 마이그레이션 — 레거시 { targetStepId } → 신포맷 { targetScenarioId, targetResponseId }
//
// 시나리오 도입 이전에는 모든 응답이 평면이라 응답 id 하나로 충분했으나,
// 시나리오 간 점프를 지원하면서 (시나리오, 응답) 페어로 식별이 필요해졌다.
// 이 모듈은 저장소에서 읽은 버전을 받아 모든 링크 필드를 신포맷으로 표준화한다.

const TRIGGER_TARGET = 'trigger'

/** 시나리오들 안의 모든 응답 id 를 훑어 responseId → scenarioId 매핑 생성 */
function buildResponseToScenarioMap(scenarios) {
  const map = new Map()
  for (const sc of scenarios) {
    for (const r of sc.responses ?? []) map.set(r.id, sc.id)
  }
  return map
}

/** 링크 하나 마이그레이션 — 신포맷 필드가 채워져 있으면 그대로 둠 */
function migrateLink(link, responseToScenario, currentScenarioId) {
  if (!link) return link
  // 이미 신포맷
  if (link.targetScenarioId && link.targetResponseId) {
    return { type: link.type ?? null, targetScenarioId: link.targetScenarioId, targetResponseId: link.targetResponseId, url: link.url ?? '' }
  }
  const legacyId = link.targetStepId
  if (legacyId) {
    // 레거시 id 가 'trigger' 면 자기 시나리오의 트리거로 (호환). 일반 응답이면 매핑 찾기
    if (legacyId === TRIGGER_TARGET) {
      return { type: link.type ?? null, targetScenarioId: currentScenarioId, targetResponseId: TRIGGER_TARGET, url: link.url ?? '' }
    }
    const targetScId = responseToScenario.get(legacyId)
    if (targetScId) {
      return { type: link.type ?? null, targetScenarioId: targetScId, targetResponseId: legacyId, url: link.url ?? '' }
    }
    // 매핑 못 찾으면(고아 참조) 비워둠
    return { type: link.type ?? null, targetScenarioId: '', targetResponseId: '', url: link.url ?? '' }
  }
  // 빈 링크 — 신포맷 기본값 채우기
  return {
    type: link.type ?? null,
    targetScenarioId: link.targetScenarioId ?? '',
    targetResponseId: link.targetResponseId ?? '',
    url: link.url ?? '',
  }
}

/** 한 응답(step)의 모든 messageConfig 안 링크를 마이그레이션 */
function migrateResponse(response, responseToScenario, currentScenarioId) {
  const cfg = response.messageConfig
  if (!cfg) return response

  const migrate = (l) => migrateLink(l, responseToScenario, currentScenarioId)

  // 단일 모드 texts.mainLink / subLink
  const nextTexts = cfg.texts
    ? { ...cfg.texts, mainLink: migrate(cfg.texts.mainLink), subLink: migrate(cfg.texts.subLink) }
    : cfg.texts

  // 캐로셀 카드들의 mainLink / subLink
  const nextCarousel = (cfg.carouselCards ?? []).map((c) => ({
    ...c,
    mainLink: migrate(c.mainLink),
    subLink: migrate(c.subLink),
  }))

  // 모드별 quickList 의 link
  const nextPerMode = {}
  for (const [modeKey, extras] of Object.entries(cfg.perMode ?? {})) {
    nextPerMode[modeKey] = {
      ...extras,
      quickList: (extras.quickList ?? []).map((q) => ({ ...q, link: migrate(q.link) })),
    }
  }

  return {
    ...response,
    messageConfig: {
      ...cfg,
      texts: nextTexts,
      carouselCards: nextCarousel,
      perMode: nextPerMode,
    },
  }
}

/** 한 시나리오의 모든 응답 안 링크를 마이그레이션 */
export function migrateScenarioLinks(scenario, responseToScenario) {
  return {
    ...scenario,
    responses: (scenario.responses ?? []).map((r) =>
      migrateResponse(r, responseToScenario, scenario.id),
    ),
  }
}

/** 한 버전 전체(scenarios[]) 의 모든 링크를 마이그레이션 — 응답→시나리오 매핑은 한 번만 빌드 */
export function migrateVersionLinks(version) {
  if (!Array.isArray(version.scenarios)) return version
  const map = buildResponseToScenarioMap(version.scenarios)
  return {
    ...version,
    scenarios: version.scenarios.map((sc) => migrateScenarioLinks(sc, map)),
  }
}
