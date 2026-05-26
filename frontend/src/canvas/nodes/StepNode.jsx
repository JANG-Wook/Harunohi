// 캔버스 위 응답 노드 — 헤더(이름) + 챗봇 메시지 미리보기 + cross-scenario 링크 배지
import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import Icon from '../../design-system/components/Icon/Icon.jsx'
import Typography from '../../design-system/components/Typography/Typography.jsx'
import ChatMessagePreview from '../ChatMessagePreview.jsx'
import './StepNode.css'

/** cross-scenario 타겟 요약 — 시나리오별로 묶어 "시나리오명 · 응답명, 응답명" 형식 라인으로 변환 */
function summarizeCrossTargets(targets) {
  // 같은 시나리오로 가는 여러 타겟을 묶기
  const grouped = new Map()
  for (const t of targets) {
    if (!grouped.has(t.scenarioId)) {
      grouped.set(t.scenarioId, { scenarioName: t.scenarioName, labels: [] })
    }
    grouped.get(t.scenarioId).labels.push(t.responseLabel)
  }
  return [...grouped.values()]
}

function StepNode({ data, selected }) {
  const step = data?.step
  if (!step) return null
  const crossTargets = data?.crossTargets ?? null
  const crossGroups = crossTargets ? summarizeCrossTargets(crossTargets) : []

  return (
    <div className={['step-node', selected && 'step-node--selected'].filter(Boolean).join(' ')}>
      {/* 핸들 — 좌 = 들어오는 연결(target), 우 = 나가는 연결(source) */}
      <Handle type="target" position={Position.Left} className="step-node__handle" />
      <Handle type="source" position={Position.Right} className="step-node__handle" />

      <div className="step-node__header">
        <Typography variant="label-1-normal" weight="semibold" as="span">
          {step.name}
        </Typography>
      </div>

      {crossGroups.length > 0 && (
        <div className="step-node__cross" aria-label="다른 시나리오로 연결됨">
          <span className="step-node__cross-icon">
            <Icon name="arrowUpRight" size={12} />
          </span>
          <div className="step-node__cross-body">
            {crossGroups.map((g, i) => (
              <div key={i} className="step-node__cross-line">
                <span className="step-node__cross-scenario">{g.scenarioName}</span>
                <span className="step-node__cross-sep">·</span>
                <span className="step-node__cross-labels">{g.labels.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="step-node__preview">
        <ChatMessagePreview config={step.messageConfig} height="640px" compact />
      </div>
    </div>
  )
}

export default memo(StepNode)
