// 봇 워크스페이스 시작 지점 — 항상 한 개만 존재, 사용자가 편집·삭제할 수 없는 고정 노드
import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import Chip from '../../design-system/components/Chip/Chip.jsx'
import Typography from '../../design-system/components/Typography/Typography.jsx'
import './TriggerNode.css'

function TriggerNode() {
  return (
    <div className="trigger-node">
      <div className="trigger-node__chip">
        <Chip variant="solid" size="xsmall" label="TRIGGER" active />
      </div>
      <Typography variant="headline-2" weight="semibold" as="div">
        시작
      </Typography>
      <Typography variant="label-2" color="var(--color-label-alternative)" as="div">
        사용자가 챗봇과 대화를 시작할 때 진입하는 첫 노드
      </Typography>
      <Handle type="source" position={Position.Right} className="trigger-node__handle" />
    </div>
  )
}

export default memo(TriggerNode)
