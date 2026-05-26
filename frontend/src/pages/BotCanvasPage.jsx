// 봇 빌더 페이지 — 좌측 단계 목록 · 중앙 캔버스 · 우측 응답 설정 (3 패널)
// botId 별 localStorage 영속 + isDirty 추적 + Outlet context 로 저장 핸들러 노출.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import StepList from '../canvas/StepList.jsx'
import StepInspector from '../canvas/StepInspector.jsx'
import StepNode from '../canvas/nodes/StepNode.jsx'
import { createEmptyStep } from '../lib/stepTypes.js'
import './BotCanvasPage.css'

const STORAGE_PREFIX = 'harunohi.bot.'

function storageKey(botId) {
  return `${STORAGE_PREFIX}${botId}`
}

/** steps → React Flow nodes (저장된 위치가 있으면 사용, 없으면 그리드 배치) */
function stepsToNodes(steps, { selectedId = null, positions = {} } = {}) {
  return steps.map((step, idx) => ({
    id: step.id,
    type: 'step',
    position:
      positions[step.id] ?? {
        x: 80 + (idx % 3) * 460,
        y: 80 + Math.floor(idx / 3) * 760,
      },
    data: { step },
    selected: step.id === selectedId,
  }))
}

/** 저장 가능한 형태로 직렬화 (안정 비교용 정렬 키 포함) */
function snapshotOf(steps, edges, nodes) {
  const positions = {}
  for (const n of nodes) positions[n.id] = n.position
  return JSON.stringify({ steps, edges, positions })
}

function loadFromStorage(botId) {
  try {
    const raw = window.localStorage.getItem(storageKey(botId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.steps)) return null
    return {
      steps: parsed.steps,
      edges: Array.isArray(parsed.edges) ? parsed.edges : [],
      positions: parsed.positions ?? {},
    }
  } catch {
    return null
  }
}

function CanvasInner() {
  const { botId } = useParams()
  const layoutCtx = useOutletContext() // { registerSaver, setDirty } — BotWorkspaceLayout 제공

  /* 초기 상태 — localStorage 우선, 없으면 빈 봇 */
  const initial = useMemo(() => loadFromStorage(botId) ?? { steps: [], edges: [], positions: {} }, [botId])

  const [steps, setSteps] = useState(initial.steps)
  const [selectedId, setSelectedId] = useState(null)

  const [nodes, setNodes, onNodesChange] = useNodesState(
    stepsToNodes(initial.steps, { positions: initial.positions }),
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges)

  /* 마지막 저장 시점의 직렬화 스냅샷 — 이걸 현재와 비교해 dirty 판정 */
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    snapshotOf(initial.steps, initial.edges, stepsToNodes(initial.steps, { positions: initial.positions })),
  )

  const nodeTypes = useMemo(() => ({ step: StepNode }), [])

  const selectedStep = useMemo(
    () => steps.find((s) => s.id === selectedId) ?? null,
    [steps, selectedId],
  )

  /* 인스펙터에서 "연결할 단계" 선택지로 노출 — 현재 편집 중인 단계는 제외 (self-loop 금지) */
  const availableSteps = useMemo(
    () =>
      steps
        .filter((s) => s.id !== selectedId)
        .map((s) => ({ value: s.id, label: s.name || '(이름 없음)' })),
    [steps, selectedId],
  )

  /* 현재 상태의 직렬화 (메모이제이션) */
  const currentSnapshot = useMemo(
    () => snapshotOf(steps, edges, nodes),
    [steps, edges, nodes],
  )
  const isDirty = currentSnapshot !== savedSnapshot

  /* 저장 — 항상 최신 currentSnapshot 을 참조하도록 ref 사용 */
  const currentSnapshotRef = useRef(currentSnapshot)
  currentSnapshotRef.current = currentSnapshot

  const handleSave = useCallback(() => {
    const snap = currentSnapshotRef.current
    try {
      window.localStorage.setItem(storageKey(botId), snap)
      setSavedSnapshot(snap)
      return true
    } catch {
      return false
    }
  }, [botId])

  /* BotWorkspaceLayout 에 dirty 상태 + 저장 핸들러 등록 */
  useEffect(() => {
    layoutCtx?.setDirty?.(isDirty)
  }, [isDirty, layoutCtx])

  useEffect(() => {
    layoutCtx?.registerSaver?.(handleSave)
    return () => layoutCtx?.registerSaver?.(null)
  }, [handleSave, layoutCtx])

  const syncStepToNode = useCallback(
    (updated) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === updated.id ? { ...n, data: { step: updated } } : n)),
      )
    },
    [setNodes],
  )

  const handleStepChange = useCallback(
    (updated) => {
      setSteps((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
      syncStepToNode(updated)
    },
    [syncStepToNode],
  )

  const handleAddStep = useCallback(() => {
    const next = createEmptyStep()
    setSteps((prev) => [...prev, next])
    // 기존 노드 위치 유지 — 새 노드만 그리드의 다음 빈자리에 append
    setNodes((nds) => {
      const idx = nds.length
      const newNode = {
        id: next.id,
        type: 'step',
        position: { x: 80 + (idx % 3) * 460, y: 80 + Math.floor(idx / 3) * 760 },
        data: { step: next },
        selected: true,
      }
      return nds.map((n) => ({ ...n, selected: false })).concat(newNode)
    })
    setSelectedId(next.id)
  }, [setNodes])

  const handleDeleteStep = useCallback(
    (stepId) => {
      // 데이터 모델과 캔버스 노드 양쪽에서 해당 stepId 만 제거 — 나머지 위치 보존
      setSteps((prev) => prev.filter((s) => s.id !== stepId))
      setNodes((nds) => nds.filter((n) => n.id !== stepId))
      setEdges((eds) => eds.filter((e) => e.source !== stepId && e.target !== stepId))
      setSelectedId(null)
    },
    [setNodes, setEdges],
  )

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: false }, eds)),
    [setEdges],
  )

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

  return (
    <div className="bot-canvas">
      <StepList
        steps={steps}
        selectedId={selectedId}
        onSelect={handleSelectFromList}
        onAdd={handleAddStep}
        onDelete={handleDeleteStep}
      />

      <div className="bot-canvas__flow">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={onSelectionChange}
          nodeTypes={nodeTypes}
          fitView
          defaultEdgeOptions={{ animated: false, style: { strokeWidth: 1.5 } }}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={20} size={1} color="rgba(112,115,124,0.18)" />
          <Controls
            position="bottom-right"
            showInteractive={false}
            showFitView={false}
          />
        </ReactFlow>
      </div>

      <StepInspector
        step={selectedStep}
        onChange={handleStepChange}
        onClose={() => setSelectedId(null)}
        onDelete={handleDeleteStep}
        availableSteps={availableSteps}
      />
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
