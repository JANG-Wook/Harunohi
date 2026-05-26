// 트리거 노드용 인스펙터 — 연결할 응답 하나만 선택 (현재 시나리오 내)
import Icon from '../design-system/components/Icon/Icon.jsx'
import IconButtonNormal from '../design-system/components/IconButton/IconButtonNormal.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import MenuSelect from './MenuSelect.jsx'
import './TriggerInspector.css'

export default function TriggerInspector({
  targetStepId,
  onChange,
  availableSteps = [],
  onClose,
}) {
  const noSteps = availableSteps.length === 0
  // target 이 실제로 존재하는 단계인지 검증 — 사라진 단계 참조면 미선택 취급
  const valid = !!targetStepId && availableSteps.some((s) => s.value === targetStepId)
  const showNegative = !valid

  return (
    <aside className="trigger-inspector">
      <header className="trigger-inspector__head">
        <div className="trigger-inspector__head-title">
          <Icon name="thunderFill" size={18} color="var(--color-primary-normal)" />
          <Typography variant="headline-2" weight="semibold" as="span">
            트리거
          </Typography>
        </div>
        <IconButtonNormal
          icon={<Icon name="close" size={18} />}
          size="small"
          onClick={onClose}
          aria-label="닫기"
        />
      </header>

      <div className="trigger-inspector__body">
        <Typography variant="body-2-reading" color="var(--color-label-alternative)" as="p">
          사용자가 챗봇과 대화를 시작할 때 어떤 응답으로 진입할지 선택하세요.
        </Typography>

        <div className="trigger-inspector__field">
          <Typography variant="label-1-normal" weight="medium" color="var(--color-label-neutral)" as="div">
            연결할 응답
          </Typography>
          <MenuSelect
            value={valid ? targetStepId : ''}
            onChange={onChange}
            options={availableSteps}
            placeholder={noSteps ? '연결할 수 있는 응답이 없습니다.' : '응답 선택'}
            disabled={noSteps}
            status={showNegative && !noSteps ? 'negative' : 'normal'}
          />
        </div>
      </div>
    </aside>
  )
}
