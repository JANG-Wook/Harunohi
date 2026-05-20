// 달력 컴포넌트 — 월 단위로 날짜를 표시하고 단일/기간 선택을 지원

import { useState } from 'react'
import Icon from '../Icon/Icon'
import IconButtonNormal from '../IconButton/IconButtonNormal'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

const startsAtSunday = (year, month) => new Date(year, month, 1).getDay()
const lastDateOf      = (year, month) => new Date(year, month + 1, 0).getDate()

const sameDay = (a, b) => !!(a && b)
  && a.getFullYear() === b.getFullYear()
  && a.getMonth()    === b.getMonth()
  && a.getDate()     === b.getDate()

const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

export default function Calendar({ mode = 'single', value, onChange, width = '320px' }) {
  // 초기 보기 월 — value 기준, 없으면 오늘
  const today  = new Date()
  const anchor = mode === 'range'
    ? (value?.start ?? today)
    : (value ?? today)

  const [view, setView] = useState({
    year:  anchor.getFullYear(),
    month: anchor.getMonth(),
  })

  const prevMonth = () => setView(v => {
    const d = new Date(v.year, v.month - 1, 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const nextMonth = () => setView(v => {
    const d = new Date(v.year, v.month + 1, 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  // 6주 × 7일 = 42셀 생성
  const firstWeekday = startsAtSunday(view.year, view.month)
  const totalDays    = lastDateOf(view.year, view.month)
  const prevTotal    = lastDateOf(view.year, view.month - 1)

  const cells = []
  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({
      date:         new Date(view.year, view.month - 1, prevTotal - i),
      currentMonth: false,
    })
  }
  for (let d = 1; d <= totalDays; d++) {
    cells.push({
      date:         new Date(view.year, view.month, d),
      currentMonth: true,
    })
  }
  let nextD = 1
  while (cells.length < 42) {
    cells.push({
      date:         new Date(view.year, view.month + 1, nextD++),
      currentMonth: false,
    })
  }

  const isSelected = (d) => mode === 'single'
    ? sameDay(value, d)
    : sameDay(value?.start, d) || sameDay(value?.end, d)

  const isInRange = (d) => {
    if (mode !== 'range') return false
    if (!value?.start || !value?.end) return false
    return d > value.start && d < value.end
  }

  const handleClick = (d) => {
    if (mode === 'single') {
      onChange?.(d)
      return
    }
    const r = value ?? {}
    if (!r.start || (r.start && r.end)) {
      onChange?.({ start: d, end: null })
    } else if (d < r.start) {
      onChange?.({ start: d, end: r.start })
    } else if (sameDay(d, r.start)) {
      onChange?.({ start: d, end: null })
    } else {
      onChange?.({ start: r.start, end: d })
    }
  }

  const cellTextColor = (cell, weekdayIdx, selected) => {
    if (selected)              return 'var(--color-static-white)'
    if (!cell.currentMonth)    return 'var(--color-label-assistive)'
    if (weekdayIdx === 0)      return 'var(--color-status-negative)'
    if (weekdayIdx === 6)      return 'var(--color-primary-normal)'
    return 'var(--color-label-normal)'
  }

  return (
    <div style={{
      width,
      padding:         'var(--spacing-20)',
      backgroundColor: 'var(--color-bg-normal)',
      borderRadius:    'var(--spacing-12)',
      boxShadow:       'var(--shadow-normal-medium)',
      border:          '1px solid var(--color-line-alternative)',
      boxSizing:       'border-box',
    }}>
      {/* 헤더 — 년월 + 네비 */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        marginBottom:   'var(--spacing-12)',
      }}>
        <span style={{
          fontSize:      'var(--font-size-headline-2)',
          lineHeight:    'var(--line-height-headline-2)',
          letterSpacing: 'var(--letter-spacing-headline-2)',
          fontWeight:    'var(--font-weight-bold)',
          color:         'var(--color-label-normal)',
        }}>{view.year}년 {view.month + 1}월</span>
        <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
          <div style={{ margin: 'calc(-1 * var(--spacing-4))' }}>
            <IconButtonNormal
              aria-label="이전 달"
              onClick={prevMonth}
              icon={<Icon name="chevronLeftSmall" size={20} />}
            />
          </div>
          <div style={{ margin: 'calc(-1 * var(--spacing-4))' }}>
            <IconButtonNormal
              aria-label="다음 달"
              onClick={nextMonth}
              icon={<Icon name="chevronRightSmall" size={20} />}
            />
          </div>
        </div>
      </div>

      {/* 요일 행 */}
      <div style={{
        display:              'grid',
        gridTemplateColumns:  'repeat(7, 1fr)',
        marginBottom:         'var(--spacing-4)',
      }}>
        {WEEKDAYS.map((w, i) => (
          <span key={w} style={{
            textAlign:     'center',
            fontSize:      'var(--font-size-label-1)',
            lineHeight:    'var(--line-height-label-1-normal)',
            fontWeight:    'var(--font-weight-medium)',
            color:         i === 0 ? 'var(--color-status-negative)'
                          : i === 6 ? 'var(--color-primary-normal)'
                          :           'var(--color-label-alternative)',
            paddingTop:    'var(--spacing-8)',
            paddingBottom: 'var(--spacing-8)',
          }}>{w}</span>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
      }}>
        {cells.map((cell, i) => {
          const weekdayIdx = i % 7
          const selected   = isSelected(cell.date)
          const inRange    = isInRange(cell.date)
          const isToday    = sameDay(cell.date, today)
          const textColor  = cellTextColor(cell, weekdayIdx, selected)

          // 기간 모드 — 시작/끝 셀의 한쪽만 배경을 채워 막대 연속성 표현
          const rangeBg = mode === 'range' && !!value?.start && !!value?.end
          const isStart = rangeBg && sameDay(cell.date, value.start)
          const isEnd   = rangeBg && sameDay(cell.date, value.end)
          let bandStyle = null
          if (inRange) {
            bandStyle = { left: 0, right: 0 }
          } else if (isStart && !sameDay(value.start, value.end)) {
            bandStyle = { left: '50%', right: 0 }
          } else if (isEnd && !sameDay(value.start, value.end)) {
            bandStyle = { left: 0, right: '50%' }
          }

          return (
            <button
              key={dayKey(cell.date)}
              onClick={() => handleClick(cell.date)}
              style={{
                position:        'relative',
                aspectRatio:     '1 / 1',
                background:      'none',
                border:          'none',
                cursor:          'pointer',
                padding:         0,
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                fontFamily:      'var(--font-family-base)',
              }}
            >
              {bandStyle && (
                <div aria-hidden="true" style={{
                  position:        'absolute',
                  top:             '50%',
                  transform:       'translateY(-50%)',
                  height:          'var(--spacing-32)',
                  backgroundColor: 'color-mix(in srgb, var(--color-primary-normal) 5%, transparent)',
                  ...bandStyle,
                }} />
              )}
              <span style={{
                position:        'relative',
                width:           'var(--spacing-32)',
                height:          'var(--spacing-32)',
                borderRadius:    'var(--radius-full)',
                backgroundColor: selected ? 'var(--color-primary-normal)' : 'transparent',
                color:           textColor,
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                fontSize:        'var(--font-size-body-2)',
                lineHeight:      'var(--line-height-body-2-normal)',
                letterSpacing:   'var(--letter-spacing-body-2)',
                fontWeight:      selected ? 'var(--font-weight-semibold)' : 'var(--font-weight-regular)',
              }}>
                {cell.date.getDate()}
                {isToday && !selected && (
                  <span aria-hidden="true" style={{
                    position:        'absolute',
                    bottom:          'calc(-1 * var(--spacing-4))',
                    width:           'var(--spacing-4)',
                    height:          'var(--spacing-4)',
                    borderRadius:    'var(--radius-full)',
                    backgroundColor: 'var(--color-primary-normal)',
                  }} />
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
