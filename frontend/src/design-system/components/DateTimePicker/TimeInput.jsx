// 시간 입력 트리거 — Textfield 모양 + 시계 아이콘, 클릭 시 TimeSlotChips 팝오버

import { useState, useRef, useEffect } from 'react'
import Icon from '../Icon/Icon'
import TimeSlotChips from './TimeSlotChips'

const toKorean = (slot) => {
  if (!slot) return ''
  const [h, m] = slot.split(':').map(Number)
  const period = h < 12 ? '오전' : '오후'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${period} ${hour12}:${String(m).padStart(2, '0')}`
}

export default function TimeInput({
  value,
  onChange,
  slots,
  placeholder = '시간 선택',
  heading,
  disabled    = false,
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const display = toKorean(value)
  const hasValue = !!display

  const handleChange = (v) => {
    onChange?.(v)
    setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      {heading && (
        <p style={{
          fontSize:      'var(--font-size-label-1)',
          lineHeight:    'var(--line-height-label-1-normal)',
          fontWeight:    'var(--font-weight-semibold)',
          color:         'var(--color-label-normal)',
          letterSpacing: 'var(--letter-spacing-label-1)',
          margin:        '0 0 var(--spacing-8) 0',
        }}>{heading}</p>
      )}
      <button
        type="button"
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        style={{
          display:         'flex',
          alignItems:      'center',
          gap:             'var(--spacing-8)',
          width:           '100%',
          padding:         'var(--spacing-12)',
          borderRadius:    'var(--spacing-12)',
          border:          'none',
          outline:         open ? `2px solid color-mix(in srgb, var(--color-primary-normal) 43%, transparent)` : 'none',
          outlineOffset:   open ? '-1px' : '0',
          backgroundColor: disabled
            ? 'var(--color-fill-alternative)'
            : 'var(--color-bg-transparent)',
          backdropFilter:  'blur(32px)',
          boxShadow:       open
            ? 'var(--shadow-normal-xsmall)'
            : `inset 0 0 0 1px var(--color-line-neutral), var(--shadow-normal-xsmall)`,
          opacity:         disabled ? 0.4 : 1,
          cursor:          disabled ? 'not-allowed' : 'pointer',
          fontFamily:      'var(--font-family-base)',
          textAlign:       'left',
        }}
      >
        <Icon name="clock" size={20} color="var(--color-label-alternative)" />
        <span style={{
          flex:          1,
          minWidth:      0,
          overflow:      'hidden',
          textOverflow:  'ellipsis',
          whiteSpace:    'nowrap',
          fontSize:      'var(--font-size-body-1)',
          lineHeight:    'var(--line-height-body-1-normal)',
          letterSpacing: 'var(--letter-spacing-body-1)',
          color:         hasValue ? 'var(--color-label-normal)' : 'var(--color-label-assistive)',
        }}>{hasValue ? display : placeholder}</span>
      </button>

      {open && (
        <div style={{
          position:        'absolute',
          top:             'calc(100% + var(--spacing-4))',
          left:            0,
          right:           0,
          zIndex:          10,
          padding:         'var(--spacing-16)',
          backgroundColor: 'var(--color-bg-normal)',
          borderRadius:    'var(--spacing-12)',
          boxShadow:       'var(--shadow-normal-medium)',
          border:          '1px solid var(--color-line-alternative)',
        }}>
          <TimeSlotChips slots={slots} value={value} onChange={handleChange} columns={4} />
        </div>
      )}
    </div>
  )
}
