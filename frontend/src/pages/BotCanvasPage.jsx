// 봇 빌더 페이지 — 좌측 단계 목록 · 중앙 캔버스 · 우측 응답 설정 (3 패널)
import { useCallback, useMemo, useState } from 'react'
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
import { createEmptyStep, letterForIndex } from '../lib/stepTypes.js'
import './BotCanvasPage.css'

function stepsToNodes(steps, selectedId = null) {
  return steps.map((step, idx) => ({
    id: step.id,
    type: 'step',
    position: { x: 80 + (idx % 3) * 460, y: 80 + Math.floor(idx / 3) * 760 },
    data: { step },
    selected: step.id === selectedId,
  }))
}

function CanvasInner() {
  const [steps, setSteps] = useState(() => [])
  const [selectedId, setSelectedId] = useState(() => null)

  const [nodes, setNodes, onNodesChange] = useNodesState(stepsToNodes(steps))
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const nodeTypes = useMemo(() => ({ step: StepNode }), [])

  const selectedStep = useMemo(
    () => steps.find((s) => s.id === selectedId) ?? null,
    [steps, selectedId],
  )

  const syncStepToNode = useCallback((updated) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === updated.id ? { ...n, data: { step: updated } } : n)),
    )
  }, [setNodes])

  const handleStepChange = useCallback(
    (updated) => {
      setSteps((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
      syncStepToNode(updated)
    },
    [syncStepToNode],
  )

  const handleAddStep = useCallback(() => {
    const next = createEmptyStep(steps.length)
    next.letter = letterForIndex(steps.length)
    const all = [...steps, next]
    setSteps(all)
    setNodes(stepsToNodes(all, next.id))
    setSelectedId(next.id)
  }, [steps, setNodes])

  const handleDeleteStep = useCallback(
    (stepId) => {
      const all = steps.filter((s) => s.id !== stepId)
      setSteps(all)
      setNodes(stepsToNodes(all))
      setEdges((eds) => eds.filter((e) => e.source !== stepId && e.target !== stepId))
      setSelectedId(null)
    },
    [steps, setNodes, setEdges],
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
