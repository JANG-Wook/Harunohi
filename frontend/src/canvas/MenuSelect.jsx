// Select 트리거 + Menu 드롭다운 결합 헬퍼 — 외부 클릭 시 자동 닫힘
// DS 의 Select 는 트리거만 담당하므로 이 wrapper 가 부모-제어 패턴을 캡슐화한다.

import { useEffect, useRef, useState } from 'react'
import Menu from '../design-system/components/Menu/Menu.jsx'
import Select from '../design-system/components/Select/Select.jsx'

export default function MenuSelect({
  value,
  onChange,
  options,
  placeholder = '값',
  status = 'normal',
  disabled = false,
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <Select
        placeholder={placeholder}
        value={selected?.label ?? ''}
        onClick={disabled ? undefined : () => setOpen((v) => !v)}
        forceFocused={open}
        status={status}
        disabled={disabled}
      />
      {open && !disabled && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 30 }}>
          <Menu
            items={options.map((o) => ({
              label: o.label,
              active: o.value === value,
              onClick: () => {
                onChange(o.value)
                setOpen(false)
              },
            }))}
          />
        </div>
      )}
    </div>
  )
}
