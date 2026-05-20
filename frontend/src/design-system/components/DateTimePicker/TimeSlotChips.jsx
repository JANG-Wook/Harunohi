// 시간 슬롯 칩 — 정해진 시간 슬롯 중 하나를 선택 (DS Chip 그리드)

import Chip from '../Chip/Chip'

const defaultSlots = [
  '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30',
]

export default function TimeSlotChips({
  slots         = defaultSlots,
  value,
  onChange,
  disabledSlots = [],
  columns       = 4,
}) {
  return (
    <div style={{
      display:             'grid',
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      gap:                 'var(--spacing-8)',
      width:               '100%',
    }}>
      {slots.map(slot => {
        const isActive   = slot === value
        const isDisabled = disabledSlots.includes(slot)
        return (
          <div key={slot} style={{ display: 'flex' }}>
            <Chip
              variant="outlined"
              size="small"
              label={slot}
              active={isActive}
              disabled={isDisabled}
              onClick={() => onChange?.(slot)}
              className="ds-fullwidth"
            />
          </div>
        )
      })}
    </div>
  )
}
