// 우측 응답 설정 패널 — 응답의 이름(inline 편집) + ChatMessageConfig 묶음
import Button from '../design-system/components/Button/Button.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import IconButtonNormal from '../design-system/components/IconButton/IconButtonNormal.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import ChatMessageConfig from './ChatMessageConfig.jsx'
import './StepInspector.css'

export default function StepInspector({
  step,
  onChange,
  onClose,
  onDelete,
  scenarioOptions = [],
  currentScenarioId = null,
}) {
  if (!step) {
    return (
      <aside className="step-inspector step-inspector--empty">
        <Typography variant="body-2-normal" color="var(--color-label-assistive)" as="span">
          좌측 목록 또는 캔버스에서 응답을 선택하세요.
        </Typography>
      </aside>
    )
  }

  const patch = (next) => onChange({ ...step, ...next })

  return (
    <aside className="step-inspector">
      <header className="step-inspector__head">
        {/* 단계 이름 inline 편집 — DS 에 "inline editable heading" 컴포넌트가 없어 토큰으로 직접 구현 */}
        {/* 호버/포커스 시 우측에 펜슬 아이콘 노출로 편집 가능 어포던스 제공 */}
        <label className="step-inspector__head-edit">
          <input
            type="text"
            className="step-inspector__head-input"
            value={step.name}
            onChange={(e) => patch({ name: e.target.value })}
            placeholder="응답 이름"
            aria-label="응답 이름"
          />
          <span className="step-inspector__head-edit-icon" aria-hidden="true">
            <Icon name="pencil" size={14} />
          </span>
        </label>
        <IconButtonNormal
          icon={<Icon name="close" size={18} />}
          size="small"
          onClick={onClose}
          aria-label="닫기"
        />
      </header>

      <ChatMessageConfig
        config={step.messageConfig}
        onChange={(nextConfig) => patch({ messageConfig: nextConfig })}
        scenarioOptions={scenarioOptions}
        currentScenarioId={currentScenarioId}
        currentResponseId={step.id}
      />

      <div className="step-inspector__footer">
        <Button
          variant="outlined"
          color="assistive"
          size="medium"
          leadingIcon={<Icon name="trash" size={16} />}
          label="응답 삭제"
          onClick={() => onDelete(step.id)}
        />
      </div>
    </aside>
  )
}
