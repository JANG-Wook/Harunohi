// 좌측 단계 목록 — 검색, 단계 추가, 단계 선택을 담당
import Button from '../design-system/components/Button/Button.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import Textfield from '../design-system/components/Textfield/Textfield.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import './StepList.css'

export default function StepList({ steps, selectedId, onSelect, onAdd, onDelete }) {
  return (
    <aside className="step-list">
      <div className="step-list__head">
        <Typography variant="headline-2" weight="semibold" as="span">
          단계 목록
        </Typography>
        <Button
          variant="solid"
          color="primary"
          size="small"
          leadingIcon={<Icon name="plus" size={14} />}
          label="단계 추가"
          onClick={onAdd}
        />
      </div>

      <div className="step-list__search">
        <Textfield placeholder="검색" icon="search" />
      </div>

      <div className="step-list__total">
        <Typography variant="caption-1" color="var(--color-label-assistive)" as="span">
          전체 {steps.length}개
        </Typography>
      </div>

      <ul className="step-list__items">
        {steps.map((step) => {
          const isSelected = step.id === selectedId
          const statusIcon =
            step.status === 'warning' ? 'triangleExclamationFill' : 'message'
          const statusColor =
            step.status === 'warning'
              ? 'var(--color-status-cautionary)'
              : 'var(--color-label-alternative)'

          return (
            <li
              key={step.id}
              className={[
                'step-list__item',
                isSelected && 'step-list__item--active',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSelect(step.id)}
            >
              <span className="step-list__item-icon" style={{ color: statusColor }}>
                <Icon name={statusIcon} size={16} />
              </span>
              <Typography variant="label-1-normal" weight="medium" as="span">
                {step.name}
              </Typography>
              {/* 단계 삭제 버튼 — 호버 시 노출. DS 에 24px 타이트 아이콘 버튼이 없어 토큰으로 직접 구현 */}
              <button
                type="button"
                className="step-list__item-action"
                aria-label="단계 삭제"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete?.(step.id)
                }}
              >
                <Icon name="close" size={14} />
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
