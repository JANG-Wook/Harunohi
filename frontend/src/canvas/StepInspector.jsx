// 우측 응답 설정 패널 — 단계의 이름 + ChatMessageConfig 를 묶음
import Button from '../design-system/components/Button/Button.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import IconButtonNormal from '../design-system/components/IconButton/IconButtonNormal.jsx'
import Textfield from '../design-system/components/Textfield/Textfield.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import ChatMessageConfig from './ChatMessageConfig.jsx'
import './StepInspector.css'

export default function StepInspector({ step, onChange, onClose, onDelete }) {
  if (!step) {
    return (
      <aside className="step-inspector step-inspector--empty">
        <Typography variant="body-2-normal" color="var(--color-label-assistive)" as="span">
          좌측 목록 또는 캔버스에서 단계를 선택하세요.
        </Typography>
      </aside>
    )
  }

  const patch = (next) => onChange({ ...step, ...next })

  return (
    <aside className="step-inspector">
      <header className="step-inspector__head">
        <div className="step-inspector__head-title">
          <span className="step-inspector__letter">{step.letter}</span>
          <Typography variant="headline-2" weight="semibold" as="span">
            {step.name}
          </Typography>
        </div>
        <IconButtonNormal
          icon={<Icon name="close" size={18} />}
          size="small"
          onClick={onClose}
          aria-label="닫기"
        />
      </header>

      <div className="step-inspector__name-field">
        <Textfield
          heading="단계 이름"
          placeholder="단계 이름"
          value={step.name}
          onChange={(e) => patch({ name: e.target.value })}
        />
      </div>

      <ChatMessageConfig
        config={step.messageConfig}
        onChange={(nextConfig) => patch({ messageConfig: nextConfig })}
      />

      <div className="step-inspector__footer">
        <Button
          variant="outlined"
          color="assistive"
          size="medium"
          leadingIcon={<Icon name="trash" size={16} />}
          label="단계 삭제"
          onClick={() => onDelete(step.id)}
        />
      </div>
    </aside>
  )
}
