// 봇 빌더 페이지 — 좌측 시나리오/응답 패널 · 중앙 캔버스 · 우측 응답 설정 (3 패널)
// botId 별 localStorage 영속 + 버전 히스토리 + isDirty 추적.
// 데이터 모델: 봇 → versions[] → scenarios[] → responses[]. 시나리오마다 트리거 1개.
// 엣지는 각 응답 버튼 링크에서 자동 도출 (수동 연결 없음, 현재 시나리오 안에서만).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  useNodesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import ScenarioPanel from '../canvas/ScenarioPanel.jsx'
import StepInspector from '../canvas/StepInspector.jsx'
import TriggerInspector from '../canvas/TriggerInspector.jsx'
import StepNode from '../canvas/nodes/StepNode.jsx'
import TriggerNode from '../canvas/nodes/TriggerNode.jsx'
import { createEmptyScenario, createEmptyStep } from '../lib/stepTypes.js'
import { migrateVersionLinks } from '../lib/linkMigration.js'
import './BotCanvasPage.css'

const STORAGE_PREFIX = 'harunohi.bot.'
const TRIGGER_NODE_ID = 'trigger'
const DEFAULT_TRIGGER_POSITION = { x: -380, y: 200 }

function storageKey(botId) {
  return `${STORAGE_PREFIX}${botId}`
}

/** 응답 → React Flow 노드 (저장된 위치가 있으면 사용, 없으면 그리드 배치) */
function responsesToNodes(responses, { selectedId = null, positions = {}, crossTargets = null } = {}) {
  return responses.map((step, idx) => ({
    id: step.id,
    type: 'step',
    position:
      positions[step.id] ?? {
        x: 80 + (idx % 3) * 460,
        y: 80 + Math.floor(idx / 3) * 760,
      },
    data: { step, crossTargets: crossTargets?.get(step.id) ?? null },
    selected: step.id === selectedId,
  }))
}

/** 트리거 + 응답 노드를 합쳐서 반환 — 트리거는 삭제 불가, 선택 가능 */
function buildAllNodes(responses, options = {}) {
  const {
    positions = {},
    selectedId = null,
    triggerPosition = DEFAULT_TRIGGER_POSITION,
  } = options
  const triggerNode = {
    id: TRIGGER_NODE_ID,
    type: 'trigger',
    position: triggerPosition,
    data: {},
    deletable: false,
    selected: selectedId === TRIGGER_NODE_ID,
  }
  return [triggerNode, ...responsesToNodes(responses, options)]
}

/** 신규 봇용 기본 시나리오 + 웰컴 응답 자동 생성 */
function makeDefaultScenarioWithWelcome() {
  const welcome = { ...createEmptyStep(), name: '웰컴메시지' }
  const sc = createEmptyScenario('기본 시나리오')
  return {
    ...sc,
    responses: [welcome],
    triggerTargetResponseId: welcome.id,
  }
}

/** 시나리오의 직렬화 — 안정 비교용. 엣지는 도출이라 저장 대상 아님 */
function scenarioPayload(sc, nodes) {
  // 현재 캔버스 노드에서 위치를 끌어와 시나리오에 반영 — 다른 시나리오는 그대로 유지
  const positions = { ...sc.positions }
  let triggerPos = sc.triggerPosition ?? DEFAULT_TRIGGER_POSITION
  for (const n of nodes) {
    if (n.id === TRIGGER_NODE_ID) triggerPos = n.position
    else positions[n.id] = n.position
  }
  return {
    id: sc.id,
    name: sc.name,
    responses: sc.responses,
    positions,
    triggerPosition: triggerPos,
    triggerTargetResponseId: sc.triggerTargetResponseId ?? null,
  }
}

/** 버전 전체 직렬화 — 현재 시나리오의 위치는 nodes 에서 끌어오고 나머지는 그대로 */
function versionPayload(scenarios, currentScenarioId, nodes) {
  return {
    scenarios: scenarios.map((sc) =>
      sc.id === currentScenarioId ? scenarioPayload(sc, nodes) : sc,
    ),
    currentScenarioId,
  }
}

/** 버튼 링크 한 개를 엣지 후보로 변환 — type==='bot' 이고 같은 시나리오 내 응답일 때만 시각화 */
function pushEdgeIfLinked(edges, sourceId, linkKey, link, currentScenarioId, responseIdSet) {
  if (!link || link.type !== 'bot') return
  if (link.targetScenarioId !== currentScenarioId) return // cross-scenario 는 엣지로 안 그림
  const target = link.targetResponseId
  if (!target || target === 'trigger') return // 트리거 점프는 엣지 생략 (시작점 방향이라 시각 노이즈)
  if (!responseIdSet.has(target)) return
  edges.push({
    id: `${sourceId}__${linkKey}__${target}`,
    source: sourceId,
    target,
    deletable: false,
  })
}

/** 한 응답의 모든 버튼 링크를 순회 — callback(link, key) 으로 콜백 */
function forEachLink(response, callback) {
  const cfg = response.messageConfig
  if (!cfg) return
  if (cfg.mode === 'single') {
    callback(cfg.texts?.mainLink, 'main')
    callback(cfg.texts?.subLink, 'sub')
  } else if (cfg.mode === 'carousel') {
    cfg.carouselCards?.forEach((card, idx) => {
      callback(card.mainLink, `card${idx}-main`)
      callback(card.subLink, `card${idx}-sub`)
    })
  }
  const modeExtras = cfg.perMode?.[cfg.mode]
  modeExtras?.quickList?.forEach((q) => callback(q.link, `quick-${q.id}`))
}

/** 현재 시나리오의 응답 데이터에서 모든 버튼 링크를 순회해 엣지 배열 도출 */
function computeEdgesFromResponses(responses, currentScenarioId) {
  const edges = []
  const responseIdSet = new Set(responses.map((r) => r.id))
  for (const step of responses) {
    forEachLink(step, (link, key) => {
      pushEdgeIfLinked(edges, step.id, key, link, currentScenarioId, responseIdSet)
    })
  }
  return edges
}

/** 응답별 cross-scenario 타겟 요약 — 노드 배지용. responseId → [{scenarioId, scenarioName, responseLabel}] */
function computeCrossScenarioTargets(responses, currentScenarioId, scenarios) {
  const scNameById = new Map(scenarios.map((s) => [s.id, s.name]))
  const responseNameMap = new Map()
  for (const sc of scenarios) {
    for (const r of sc.responses ?? []) responseNameMap.set(r.id, r.name)
  }
  const out = new Map()
  for (const step of responses) {
    const targets = []
    const seen = new Set() // 같은 (sc,resp) 중복 제거
    forEachLink(step, (link) => {
      if (!link || link.type !== 'bot') return
      if (!link.targetScenarioId || link.targetScenarioId === currentScenarioId) return
      const key = `${link.targetScenarioId}::${link.targetResponseId}`
      if (seen.has(key)) return
      seen.add(key)
      targets.push({
        scenarioId: link.targetScenarioId,
        scenarioName: scNameById.get(link.targetScenarioId) ?? '(삭제된 시나리오)',
        responseLabel:
          link.targetResponseId === 'trigger'
            ? '트리거'
            : responseNameMap.get(link.targetResponseId) ?? '(삭제된 응답)',
      })
    })
    if (targets.length > 0) out.set(step.id, targets)
  }
  return out
}

/** 시나리오로 들어오는 cross-scenario 링크 — 삭제 가드용. 다른 시나리오의 응답에서 이 시나리오로 향하는 링크 수집 */
function findIncomingLinks(targetScenarioId, scenarios) {
  const scNameById = new Map(scenarios.map((s) => [s.id, s.name]))
  const result = []
  for (const sc of scenarios) {
    if (sc.id === targetScenarioId) continue
    for (const r of sc.responses ?? []) {
      forEachLink(r, (link) => {
        if (link?.type === 'bot' && link.targetScenarioId === targetScenarioId) {
          result.push({
            fromScenarioName: scNameById.get(sc.id) ?? sc.name,
            fromResponseName: r.name,
          })
        }
      })
    }
  }
  return result
}

/** 레거시 버전(steps[]) → 시나리오 1개로 감싸기 */
function migrateLegacyVersion(v) {
  if (Array.isArray(v.scenarios)) return v
  const responses = Array.isArray(v.steps) ? v.steps : []
  const positions = v.positions ?? {}
  // 레거시 위치 객체에 'trigger' 키가 있을 수 있어 분리
  const triggerPosition = positions[TRIGGER_NODE_ID] ?? DEFAULT_TRIGGER_POSITION
  const responsePositions = { ...positions }
  delete responsePositions[TRIGGER_NODE_ID]
  const defaultSc = {
    id: `sc_legacy_${v.id}`,
    name: '기본 시나리오',
    responses,
    positions: responsePositions,
    triggerPosition,
    triggerTargetResponseId: v.triggerTargetStepId ?? null,
  }
  return {
    id: v.id,
    savedAt: v.savedAt,
    scenarios: [defaultSc],
    currentScenarioId: defaultSc.id,
  }
}

function loadFromStorage(botId) {
  try {
    const raw = window.localStorage.getItem(storageKey(botId))
    if (!raw) return { versions: [], currentVersionId: null, status: 'draft' }
    const parsed = JSON.parse(raw)
    if (parsed && Array.isArray(parsed.versions)) {
      // 시나리오 마이그레이션(steps→scenarios) 후 링크 마이그레이션(targetStepId→{scenarioId,responseId})
      const versions = parsed.versions.map((v) => migrateVersionLinks(migrateLegacyVersion(v)))
      return {
        versions,
        currentVersionId:
          parsed.currentVersionId ?? parsed.versions[parsed.versions.length - 1]?.id ?? null,
        status: parsed.status === 'active' ? 'active' : 'draft',
      }
    }
    // 더 오래된 포맷 — versions 자체가 없고 steps 만 있음
    if (parsed && Array.isArray(parsed.steps)) {
      const legacy = migrateVersionLinks(
        migrateLegacyVersion({
          id: `v_${Date.now()}_legacy`,
          savedAt: new Date().toISOString(),
          steps: parsed.steps,
          positions: parsed.positions ?? {},
          triggerTargetStepId: parsed.triggerTargetStepId ?? null,
        }),
      )
      return { versions: [legacy], currentVersionId: legacy.id, status: 'draft' }
    }
  } catch {
    // ignore
  }
  return { versions: [], currentVersionId: null, status: 'draft' }
}

function writeToStorage(botId, versions, currentVersionId, status) {
  window.localStorage.setItem(
    storageKey(botId),
    JSON.stringify({ versions, currentVersionId, status }),
  )
}

let versionSeq = 0
function nextVersionId() {
  return `v_${Date.now().toString(36)}_${versionSeq++}`
}

/** 시나리오 이름 중복 회피 — 같은 이름이 있으면 ' 사본' 또는 숫자 suffix */
function uniqueScenarioName(scenarios, base) {
  const names = new Set(scenarios.map((s) => s.name))
  if (!names.has(base)) return base
  for (let i = 2; i < 1000; i++) {
    const candidate = `${base} ${i}`
    if (!names.has(candidate)) return candidate
  }
  return `${base} ${Date.now()}`
}

function CanvasInner() {
  const { botId } = useParams()
  const layoutCtx = useOutletContext()

  const initial = useMemo(() => loadFromStorage(botId), [botId])
  const initialVersion =
    initial.versions.find((v) => v.id === initial.currentVersionId) ??
    initial.versions[initial.versions.length - 1] ??
    null

  /* 신규 봇이면 기본 시나리오 + 웰컴 응답 자동 생성 */
  const initialScenarios = useMemo(() => {
    if (initialVersion?.scenarios?.length) return initialVersion.scenarios
    return [makeDefaultScenarioWithWelcome()]
  }, [initialVersion])

  const [versions, setVersions] = useState(initial.versions)
  const [currentVersionId, setCurrentVersionId] = useState(initial.currentVersionId)
  const [botStatus, setBotStatus] = useState(initial.status)

  const [scenarios, setScenarios] = useState(initialScenarios)
  const [currentScenarioId, setCurrentScenarioId] = useState(
    initialVersion?.currentScenarioId ?? initialScenarios[0]?.id ?? null,
  )
  const [selectedId, setSelectedId] = useState(null)

  const currentScenario = useMemo(
    () => scenarios.find((s) => s.id === currentScenarioId) ?? scenarios[0] ?? null,
    [scenarios, currentScenarioId],
  )
  const responses = currentScenario?.responses ?? []

  const [nodes, setNodes, onNodesChange] = useNodesState(
    buildAllNodes(currentScenario?.responses ?? [], {
      positions: currentScenario?.positions ?? {},
      triggerPosition: currentScenario?.triggerPosition,
    }),
  )

  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    JSON.stringify(
      versionPayload(
        initialScenarios,
        initialVersion?.currentScenarioId ?? initialScenarios[0]?.id ?? null,
        buildAllNodes(initialScenarios[0]?.responses ?? [], {
          positions: initialScenarios[0]?.positions ?? {},
          triggerPosition: initialScenarios[0]?.triggerPosition,
        }),
      ),
    ),
  )

  const nodeTypes = useMemo(() => ({ step: StepNode, trigger: TriggerNode }), [])

  /* 트리거 연결 대상 해석 — 명시 설정 > 현재 시나리오의 responses[0] fallback */
  const resolvedTriggerTarget = useMemo(() => {
    const target = currentScenario?.triggerTargetResponseId
    if (target && responses.some((r) => r.id === target)) return target
    return responses[0]?.id ?? null
  }, [currentScenario, responses])

  /* 엣지 — 현재 시나리오의 응답 안에서만 도출 + 트리거→target */
  const derivedEdges = useMemo(() => {
    const edges = computeEdgesFromResponses(responses, currentScenarioId)
    if (resolvedTriggerTarget) {
      edges.push({
        id: `${TRIGGER_NODE_ID}__to__${resolvedTriggerTarget}`,
        source: TRIGGER_NODE_ID,
        target: resolvedTriggerTarget,
        deletable: false,
      })
    }
    return edges
  }, [responses, resolvedTriggerTarget, currentScenarioId])

  /* 응답 노드 코너에 표시할 cross-scenario 링크 요약 */
  const crossScenarioTargets = useMemo(
    () => computeCrossScenarioTargets(responses, currentScenarioId, scenarios),
    [responses, currentScenarioId, scenarios],
  )

  /* LinkEditor 에 넘길 시나리오 옵션 — 모든 시나리오 + 각자의 응답 목록(트리거 포함) */
  const scenarioOptions = useMemo(
    () =>
      scenarios.map((sc) => ({
        id: sc.id,
        name: sc.name,
        responses: sc.responses.map((r) => ({ value: r.id, label: r.name || '(이름 없음)' })),
      })),
    [scenarios],
  )

  const selectedStep = useMemo(
    () => responses.find((s) => s.id === selectedId) ?? null,
    [responses, selectedId],
  )

  /* 트리거 인스펙터의 응답 선택 옵션 — 현재 시나리오 응답만 (트리거는 시나리오 내 응답만 가리킴) */
  const triggerAvailableResponses = useMemo(
    () => responses.map((s) => ({ value: s.id, label: s.name || '(이름 없음)' })),
    [responses],
  )

  const currentSnapshot = useMemo(
    () => JSON.stringify(versionPayload(scenarios, currentScenarioId, nodes)),
    [scenarios, currentScenarioId, nodes],
  )
  const isDirty = currentSnapshot !== savedSnapshot

  const stateRef = useRef({
    scenarios,
    currentScenarioId,
    nodes,
    versions,
    currentVersionId,
    botStatus,
  })
  stateRef.current = {
    scenarios,
    currentScenarioId,
    nodes,
    versions,
    currentVersionId,
    botStatus,
  }

  const handleSave = useCallback(() => {
    const {
      scenarios: scs,
      currentScenarioId: curScId,
      nodes: n,
      versions: vs,
      botStatus: bs,
    } = stateRef.current
    const payload = versionPayload(scs, curScId, n)
    const newVersion = {
      id: nextVersionId(),
      savedAt: new Date().toISOString(),
      ...payload,
    }
    const nextVersions = [...vs, newVersion]
    try {
      writeToStorage(botId, nextVersions, newVersion.id, bs)
      setVersions(nextVersions)
      setCurrentVersionId(newVersion.id)
      setSavedSnapshot(JSON.stringify(payload))
      // 위치 반영을 다음 currentScenario 에도 영속 — scenarios state 도 갱신
      setScenarios(payload.scenarios)
      return true
    } catch {
      return false
    }
  }, [botId])

  const handlePublish = useCallback(() => {
    const { versions: vs, currentVersionId: cur } = stateRef.current
    try {
      writeToStorage(botId, vs, cur, 'active')
      setBotStatus('active')
      return true
    } catch {
      return false
    }
  }, [botId])

  /* 시뮬레이터 페이로드 getter — 저장 안 한 변경분도 즉시 시뮬 가능하도록 최신 stateRef 반환 */
  const getSimulatorPayload = useCallback(() => {
    return stateRef.current.scenarios
  }, [])

  const handleLoadVersion = useCallback(
    (versionId) => {
      const target = stateRef.current.versions.find((v) => v.id === versionId)
      if (!target) return
      const targetScs = target.scenarios ?? []
      const targetCurId = target.currentScenarioId ?? targetScs[0]?.id ?? null
      const targetSc = targetScs.find((s) => s.id === targetCurId) ?? targetScs[0] ?? null
      setScenarios(targetScs)
      setCurrentScenarioId(targetCurId)
      setNodes(
        buildAllNodes(targetSc?.responses ?? [], {
          positions: targetSc?.positions ?? {},
          triggerPosition: targetSc?.triggerPosition,
        }),
      )
      setSelectedId(null)
      setCurrentVersionId(target.id)
      setSavedSnapshot(JSON.stringify(versionPayload(targetScs, targetCurId, [])))
    },
    [setNodes],
  )

  useEffect(() => {
    layoutCtx?.setDirty?.(isDirty)
  }, [isDirty, layoutCtx])

  useEffect(() => {
    layoutCtx?.registerSaver?.(handleSave)
    return () => layoutCtx?.registerSaver?.(null)
  }, [handleSave, layoutCtx])

  useEffect(() => {
    layoutCtx?.registerVersionLoader?.(handleLoadVersion)
    return () => layoutCtx?.registerVersionLoader?.(null)
  }, [handleLoadVersion, layoutCtx])

  useEffect(() => {
    layoutCtx?.registerPublisher?.(handlePublish)
    return () => layoutCtx?.registerPublisher?.(null)
  }, [handlePublish, layoutCtx])

  useEffect(() => {
    layoutCtx?.registerSimulatorPayload?.(getSimulatorPayload)
    return () => layoutCtx?.registerSimulatorPayload?.(null)
  }, [getSimulatorPayload, layoutCtx])

  useEffect(() => {
    layoutCtx?.setBotStatus?.(botStatus)
  }, [botStatus, layoutCtx])

  useEffect(() => {
    layoutCtx?.setVersionInfo?.(
      versions.map((v) => ({ id: v.id, savedAt: v.savedAt })),
      currentVersionId,
    )
  }, [versions, currentVersionId, layoutCtx])

  /* ── 응답 편집 헬퍼 ─────────────────────────────────────────── */

  const syncStepToNode = useCallback(
    (updated) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === updated.id ? { ...n, data: { ...n.data, step: updated } } : n,
        ),
      )
    },
    [setNodes],
  )

  /* crossScenarioTargets 변경(다른 시나리오/응답 추가·삭제·이름변경)을 노드 data 에 반영 */
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === TRIGGER_NODE_ID
          ? n
          : { ...n, data: { ...n.data, crossTargets: crossScenarioTargets.get(n.id) ?? null } },
      ),
    )
  }, [crossScenarioTargets, setNodes])

  /* 응답 변경 — 현재 시나리오의 responses 만 갱신 */
  const handleStepChange = useCallback(
    (updated) => {
      setScenarios((prev) =>
        prev.map((sc) =>
          sc.id !== currentScenarioId
            ? sc
            : { ...sc, responses: sc.responses.map((r) => (r.id === updated.id ? updated : r)) },
        ),
      )
      syncStepToNode(updated)
    },
    [currentScenarioId, syncStepToNode],
  )

  const handleAddStep = useCallback(() => {
    const next = createEmptyStep()
    setScenarios((prev) =>
      prev.map((sc) =>
        sc.id !== currentScenarioId ? sc : { ...sc, responses: [...sc.responses, next] },
      ),
    )
    setNodes((nds) => {
      // 트리거 이후 응답들의 개수로 그리드 인덱스 계산
      const responseCount = nds.filter((n) => n.id !== TRIGGER_NODE_ID).length
      const newNode = {
        id: next.id,
        type: 'step',
        position: {
          x: 80 + (responseCount % 3) * 460,
          y: 80 + Math.floor(responseCount / 3) * 760,
        },
        data: { step: next },
        selected: true,
      }
      return nds.map((n) => ({ ...n, selected: false })).concat(newNode)
    })
    setSelectedId(next.id)
  }, [currentScenarioId, setNodes])

  const handleDeleteStep = useCallback(
    (stepId) => {
      setScenarios((prev) =>
        prev.map((sc) =>
          sc.id !== currentScenarioId
            ? sc
            : {
                ...sc,
                responses: sc.responses.filter((r) => r.id !== stepId),
                // 트리거 타겟이 삭제된 응답이면 해제 (자동 fallback)
                triggerTargetResponseId:
                  sc.triggerTargetResponseId === stepId ? null : sc.triggerTargetResponseId,
              },
        ),
      )
      setNodes((nds) => nds.filter((n) => n.id !== stepId))
      setSelectedId(null)
    },
    [currentScenarioId, setNodes],
  )

  /* 트리거 타겟 변경 — 현재 시나리오의 triggerTargetResponseId 갱신 */
  const handleTriggerTargetChange = useCallback(
    (responseId) => {
      setScenarios((prev) =>
        prev.map((sc) =>
          sc.id !== currentScenarioId ? sc : { ...sc, triggerTargetResponseId: responseId },
        ),
      )
    },
    [currentScenarioId],
  )

  /* ── 시나리오 CRUD ──────────────────────────────────────────── */

  /** 시나리오 전환 — 현재 시나리오의 노드 위치를 먼저 저장하고 다음 시나리오를 로드 */
  const switchScenario = useCallback(
    (nextScId) => {
      if (nextScId === currentScenarioId) return
      // 현재 nodes 의 위치를 현재 시나리오에 반영
      const currentNodes = stateRef.current.nodes
      setScenarios((prev) =>
        prev.map((sc) => (sc.id === currentScenarioId ? scenarioPayload(sc, currentNodes) : sc)),
      )
      const target = scenarios.find((s) => s.id === nextScId)
      if (!target) return
      setCurrentScenarioId(nextScId)
      setSelectedId(null)
      setNodes(
        buildAllNodes(target.responses, {
          positions: target.positions ?? {},
          triggerPosition: target.triggerPosition,
        }),
      )
    },
    [currentScenarioId, scenarios, setNodes],
  )

  const handleAddScenario = useCallback(() => {
    setScenarios((prev) => {
      const name = uniqueScenarioName(prev, '새 시나리오')
      const sc = createEmptyScenario(name)
      // 현재 노드 위치를 기존 시나리오에 먼저 반영
      const currentNodes = stateRef.current.nodes
      const updated = prev.map((s) =>
        s.id === currentScenarioId ? scenarioPayload(s, currentNodes) : s,
      )
      setCurrentScenarioId(sc.id)
      setSelectedId(null)
      setNodes(
        buildAllNodes(sc.responses, {
          positions: sc.positions,
          triggerPosition: sc.triggerPosition,
        }),
      )
      return [...updated, sc]
    })
  }, [currentScenarioId, setNodes])

  const handleRenameScenario = useCallback((scId, name) => {
    setScenarios((prev) => prev.map((s) => (s.id === scId ? { ...s, name } : s)))
  }, [])

  const handleDeleteScenario = useCallback(
    (scId) => {
      setScenarios((prev) => {
        if (prev.length <= 1) return prev
        const next = prev.filter((s) => s.id !== scId)
        // 현재 시나리오가 삭제되면 다음 시나리오로 전환
        if (scId === currentScenarioId) {
          const fallback = next[0]
          setCurrentScenarioId(fallback.id)
          setSelectedId(null)
          setNodes(
            buildAllNodes(fallback.responses, {
              positions: fallback.positions ?? {},
              triggerPosition: fallback.triggerPosition,
            }),
          )
        }
        return next
      })
    },
    [currentScenarioId, setNodes],
  )

  /* ── 선택 핸들러 ────────────────────────────────────────────── */

  const onSelectionChange = useCallback(({ nodes: selected }) => {
    setSelectedId(selected[0]?.id ?? null)
  }, [])

  const handleSelectFromList = useCallback(
    (stepId) => {
      setSelectedId(stepId)
      setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === stepId })))
    },
    [setNodes],
  )

  const handleSelectTrigger = useCallback(() => {
    setSelectedId(TRIGGER_NODE_ID)
    setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === TRIGGER_NODE_ID })))
  }, [setNodes])

  return (
    <div className="bot-canvas">
      <ScenarioPanel
        scenarios={scenarios}
        currentScenarioId={currentScenarioId}
        onSelectScenario={switchScenario}
        onAddScenario={handleAddScenario}
        onRenameScenario={handleRenameScenario}
        onDeleteScenario={handleDeleteScenario}
        getIncomingLinks={(scId) => findIncomingLinks(scId, scenarios)}
        responses={responses}
        selectedResponseId={selectedId === TRIGGER_NODE_ID ? null : selectedId}
        onSelectResponse={handleSelectFromList}
        onAddResponse={handleAddStep}
        onDeleteResponse={handleDeleteStep}
        triggerSelected={selectedId === TRIGGER_NODE_ID}
        onSelectTrigger={handleSelectTrigger}
      />

      <div className="bot-canvas__flow">
        <ReactFlow
          nodes={nodes}
          edges={derivedEdges}
          onNodesChange={onNodesChange}
          onSelectionChange={onSelectionChange}
          nodeTypes={nodeTypes}
          fitView
          nodesConnectable={false}
          edgesReconnectable={false}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: false,
            style: { strokeWidth: 1.5, stroke: 'var(--color-interaction-inactive)' },
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={20} size={1} color="rgba(112,115,124,0.18)" />
          <Controls position="bottom-right" showInteractive={false} showFitView={false} />
        </ReactFlow>
      </div>

      {selectedId === TRIGGER_NODE_ID ? (
        <TriggerInspector
          targetStepId={resolvedTriggerTarget}
          onChange={handleTriggerTargetChange}
          availableSteps={triggerAvailableResponses}
          onClose={() => setSelectedId(null)}
        />
      ) : (
        <StepInspector
          step={selectedStep}
          onChange={handleStepChange}
          onClose={() => setSelectedId(null)}
          onDelete={handleDeleteStep}
          scenarioOptions={scenarioOptions}
          currentScenarioId={currentScenarioId}
        />
      )}
    </div>
  )
}

export default function BotCanvasPage() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  )
}
