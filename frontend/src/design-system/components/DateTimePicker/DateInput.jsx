// 날짜 입력 트리거 — Textfield 모양 + 캘린더 아이콘, 클릭 시 Calendar 팝오버

import { useState, useRef, useEffect } from 'react'
import Icon from '../Icon/Icon'
import Calendar from './Calendar'

const pad = (n) => String(n).padStart(2, '0')
const formatDate = (d) => d
  ? `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
  : ''
const formatRange = (r) => {
  if (!r?.start) return ''
  const s = formatDate(r.start)
  const e = r.end ? formatDate(r.end) : ''
  return e ? `${s} ~ ${e}` : s
}

export default function DateInput({
  mode           = 'single',
  value,
  onChange,
  placeholder    = '날짜 선택',
  heading,
  disabled       = false,
  calendarWidth  = '320px',
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

  const display = mode === 'range' ? formatRange(value) : formatDate(value)
  const hasValue = !!display

  const handleChange = (v) => {
    onChange?.(v)
    if (mode === 'single') setOpen(false)
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
        <Icon name="calendar" size={20} color="var(--color-label-alternative)" />
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
          position: 'absolute',
          top:      'calc(100% + var(--spacing-4))',
          left:     0,
          ...(calendarWidth === '100%' ? { right: 0 } : { width: calendarWidth }),
          zIndex:   10,
        }}>
          <Calendar mode={mode} value={value} onChange={handleChange} width="100%" />
        </div>
      )}
    </div>
  )
}
