// 캔버스 위 단계 노드 — 헤더(라벨·이름) + 챗봇 메시지 미리보기
import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import Chip from '../../design-system/components/Chip/Chip.jsx'
import Typography from '../../design-system/components/Typography/Typography.jsx'
import ChatMessagePreview from '../ChatMessagePreview.jsx'
import './StepNode.css'

function StepNode({ data, selected }) {
  const step = data?.step
  if (!step) return null

  return (
    <div className={['step-node', selected && 'step-node--selected'].filter(Boolean).join(' ')}>
      <Handle type="target" position={Position.Top} className="step-node__handle" />

      <div className="step-node__header">
        <Chip variant="solid" size="xsmall" label={step.letter} active />
        <Typography variant="label-1-normal" weight="semibold" as="span">
          {step.name}
        </Typography>
      </div>

      <div className="step-node__preview">
        <ChatMessagePreview config={step.messageConfig} height="640px" compact />
      </div>

      <Handle type="source" position={Position.Bottom} className="step-node__handle" />
    </div>
  )
}

export default memo(StepNode)
