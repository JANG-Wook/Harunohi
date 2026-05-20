/**
 * PaginationNavigation 컴포넌트
 *
 * 페이지 위치 표시와 이동을 위한 내비게이션입니다.
 *
 * Props:
 *  count           — 전체 페이지 수                              기본: 1
 *  value           — 현재 인덱스 (0-based)                      기본: 0
 *  onChange        — (index: number) => void
 *  variant         — 'extended' | 'compact' | 'minimize'        기본: 'compact'
 *                    extended:  넓은 레이아웃, leadingContent/trailingContent 슬롯 제공
 *                    compact:   모바일/좁은 레이아웃
 *                    minimize:  < 현재/전체 > 형태의 최소 표시
 *  leadingContent  — ReactNode  왼쪽 절대 슬롯 (extended only)
 *  trailingContent — ReactNode  오른쪽 절대 슬롯 (extended only)
 *  className       — 추가 클래스
 *
 * 사용 예:
 *  <PaginationNavigation count={10} value={2} onChange={setPage} />
 *  <PaginationNavigation count={50} value={24} onChange={setPage} variant="extended" />
 *  <PaginationNavigation count={20} value={9} onChange={setPage} variant="minimize" />
 */

import { useState } from 'react'

/* ── 윈도우 알고리즘 ──────────────────────────────────────────
 * windowSize=9 (extended): count ≤ 11 이면 전체 표시
 * windowSize=5 (compact):  count ≤ 7  이면 전체 표시
 * 반환값: Array<{ page: number } | { ellipsis: true }>
 */
function getVisiblePages(count, value, windowSize) {
  const total   = Math.max(1, count)
  const current = Math.max(0, Math.min(value, total - 1)) + 1

  if (total <= windowSize + 2) {
    return Array.from({ length: total }, (_, i) => ({ page: i + 1 }))
  }

  const half     = Math.floor(windowSize / 2)
  const winStart = Math.max(2, Math.min(current - half, total - windowSize - 1))
  const winEnd   = Math.min(total - 1, winStart + windowSize - 1)

  const items = [{ page: 1 }]
  if (winStart > 2)       items.push({ ellipsis: true })
  for (let p = winStart; p <= winEnd; p++) items.push({ page: p })
  if (winEnd < total - 1) items.push({ ellipsis: true })
  items.push({ page: total })

  return items
}

/* ── 인라인 SVG 아이콘 (피그마 스펙: 세로로 긴 직사각형) ──────
 * extended/minimize: 8×16px  compact: 12×24px
 */
function ChevronLeft() {   // 8×16
  return (
    <svg width="8" height="16" viewBox="0 0 8 16" fill="none" aria-hidden="true">
      <path d="M5 3L2.5 8L5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRight() {  // 8×16
  return (
    <svg width="8" height="16" viewBox="0 0 8 16" fill="none" aria-hidden="true">
      <path d="M3 3L5.5 8L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronLeftRegular() {   // 12×24
  return (
    <svg width="12" height="24" viewBox="0 0 12 24" fill="none" aria-hidden="true">
      <path d="M7.5 6L4.5 12L7.5 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRightRegular() {  // 12×24
  return (
    <svg width="12" height="24" viewBox="0 0 12 24" fill="none" aria-hidden="true">
      <path d="M4.5 6L7.5 12L4.5 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ── 인터랙션 오버레이 opacity ───────────────────────────────── */
const OVERLAY_OPACITY = { hovered: 0.05, focused: 0.08, pressed: 0.12 }

/* ── 서브컴포넌트: 이전/다음 아이콘 버튼 ──────────────────── */
function NavButton({ direction, disabled, btnWidth, btnHeight, isRegular, onClick }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const overlayOpacity = disabled    ? 0
    : isPressed                      ? OVERLAY_OPACITY.pressed
    : isFocused                      ? OVERLAY_OPACITY.focused
    : isHovered                      ? OVERLAY_OPACITY.hovered
    : 0

  const isLeft = direction === 'left'
  const color  = disabled
    ? 'var(--color-label-disable)'
    : 'var(--color-label-neutral)'

  return (
    <button
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        position:       'relative',
        width:          btnWidth,
        height:         btnHeight,
        background:     'none',
        border:         'none',
        cursor:         disabled ? 'not-allowed' : 'pointer',
        color,
        flexShrink:     0,
        padding:        0,
        outline:        'none',
      }}
      disabled={disabled}
      onClick={onClick}
      aria-label={isLeft ? '이전 페이지' : '다음 페이지'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false) }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => { setIsFocused(false); setIsPressed(false) }}
    >
      <div style={{ position: 'absolute', inset: 'calc(var(--spacing-8) * -1)', pointerEvents: 'none' }} aria-hidden="true">
        <div style={{
          position:        'absolute',
          inset:           0,
          borderRadius:    'var(--radius-full)',
          backgroundColor: `color-mix(in srgb, var(--color-label-normal) ${Math.round(overlayOpacity * 100)}%, transparent)`,
          transition:      'background-color 0.15s ease',
        }} />
      </div>
      {isLeft
        ? (isRegular ? <ChevronLeftRegular  /> : <ChevronLeft  />)
        : (isRegular ? <ChevronRightRegular /> : <ChevronRight />)
      }
    </button>
  )
}

/* ── 서브컴포넌트: 페이지 번호 버튼 ────────────────────────── */
function PageButton({ page, isActive, onClick }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const overlayOpacity = isPressed ? OVERLAY_OPACITY.pressed
    : isFocused                    ? OVERLAY_OPACITY.focused
    : isHovered                    ? OVERLAY_OPACITY.hovered
    : 0

  return (
    <button
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        position:       'relative',
        width:          'var(--spacing-20)',
        height:         'calc(var(--spacing-24) + var(--spacing-6))',
        paddingTop:     'var(--spacing-4)',
        paddingBottom:  'var(--spacing-4)',
        background:     'none',
        border:         'none',
        borderRadius:   'var(--spacing-4)',
        cursor:         'pointer',
        flexShrink:     0,
        boxSizing:      'border-box',
        fontSize:       'var(--font-size-body-2)',
        lineHeight:     'var(--line-height-body-2-normal)',
        letterSpacing:  'var(--letter-spacing-body-2)',
        fontWeight:          isActive ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)',
        color:               isActive ? 'var(--color-label-strong)' : 'var(--color-label-neutral)',
        textAlign:           'center',
        whiteSpace:          'nowrap',
        outline:             'none',
        fontFeatureSettings: "'ss10' 1",
      }}
      onClick={() => onClick?.(page - 1)}
      aria-current={isActive ? 'page' : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false) }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => { setIsFocused(false); setIsPressed(false) }}
    >
      <div style={{
        position:        'absolute',
        top:             '50%',
        left:            'calc(var(--spacing-7) * -1)',
        right:           'calc(var(--spacing-7) * -1)',
        height:          'var(--spacing-32)',
        transform:       'translateY(-50%)',
        borderRadius:    'var(--spacing-6)',
        overflow:        'hidden',
        backgroundColor: `color-mix(in srgb, var(--color-label-normal) ${Math.round(overlayOpacity * 100)}%, transparent)`,
        pointerEvents:   'none',
        transition:      'background-color 0.15s ease',
      }} aria-hidden="true" />
      {page}
    </button>
  )
}

/* ── 서브컴포넌트: 페이지 목록 ─────────────────────────────── */
function PageList({ items, currentPage, onPageClick }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-16)', paddingLeft: 'var(--spacing-16)', paddingRight: 'var(--spacing-16)' }}>
      {items.map((item, i) =>
        item.ellipsis
          ? (
            <span
              key={`ellipsis-${i}`}
              style={{
                fontSize:            'var(--font-size-body-2)',
                lineHeight:          'var(--line-height-body-2-normal)',
                letterSpacing:       'var(--letter-spacing-body-2)',
                fontWeight:          'var(--font-weight-regular)',
                color:               'var(--color-label-alternative)',
                userSelect:          'none',
                fontFeatureSettings: "'ss10' 1",
              }}
            >
              …
            </span>
          )
          : (
            <PageButton
              key={item.page}
              page={item.page}
              isActive={item.page === currentPage}
              onClick={onPageClick}
            />
          )
      )}
    </div>
  )
}

/* ── 메인 컴포넌트 ──────────────────────────────────────────── */
export default function PaginationNavigation({
  count           = 1,
  value           = 0,
  onChange,
  variant         = 'compact',
  leadingContent,
  trailingContent,
  className       = '',
}) {
  const total       = Math.max(1, count)
  const current     = Math.max(0, Math.min(value, total - 1))
  const currentPage = current + 1

  const isFirst = current === 0
  const isLast  = current === total - 1

  const goPrev = () => !isFirst && onChange?.(current - 1)
  const goNext = () => !isLast  && onChange?.(current + 1)

  /* ── Minimize ─────────────────────────────────────────────── */
  if (variant === 'minimize') {
    return (
      <div
        style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-12)' }}
        className={className}
      >
        <NavButton direction="left"  disabled={isFirst} btnWidth="var(--spacing-8)" btnHeight="var(--spacing-16)" onClick={goPrev} />
        <span style={{
          fontSize:            'var(--font-size-label-2)',
          lineHeight:          'var(--line-height-label-2)',
          letterSpacing:       'var(--letter-spacing-label-2)',
          fontWeight:          'var(--font-weight-medium)',
          color:               'var(--color-label-neutral)',
          whiteSpace:          'nowrap',
          fontFeatureSettings: "'ss10' 1",
        }}>
          {currentPage}/{total}
        </span>
        <NavButton direction="right" disabled={isLast}  btnWidth="var(--spacing-8)" btnHeight="var(--spacing-16)" onClick={goNext} />
      </div>
    )
  }

  /* ── Compact / Extended 공통 ────────────────────────────────── */
  const windowSize = variant === 'extended' ? 9 : 5
  // extended: 8×16px 아이콘, compact: 12×24px 아이콘 (피그마 스펙)
  const btnWidth   = variant === 'extended' ? 'var(--spacing-8)'  : 'var(--spacing-12)'
  const btnHeight  = variant === 'extended' ? 'var(--spacing-16)' : 'var(--spacing-24)'
  const isRegular  = variant === 'compact'
  const items      = getVisiblePages(total, current, windowSize)

  const navStyle = {
    display:    'inline-flex',
    alignItems: 'center',
    gap:        'var(--spacing-4)',
    height:     'var(--spacing-32)',
  }

  /* ── Compact ──────────────────────────────────────────────── */
  if (variant === 'compact') {
    return (
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        className={className}
      >
        <div style={navStyle}>
          <NavButton direction="left"  disabled={isFirst} btnWidth={btnWidth} btnHeight={btnHeight} isRegular={isRegular} onClick={goPrev} />
          <PageList items={items} currentPage={currentPage} onPageClick={onChange} />
          <NavButton direction="right" disabled={isLast}  btnWidth={btnWidth} btnHeight={btnHeight} isRegular={isRegular} onClick={goNext} />
        </div>
      </div>
    )
  }

  /* ── Extended — disabled nav 숨김, flex 레이아웃 ─────────────── */
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', width: '100%' }}
      className={className}
    >
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
        {leadingContent}
      </div>

      <div style={navStyle}>
        <NavButton direction="left"  disabled={isFirst} btnWidth={btnWidth} btnHeight={btnHeight} isRegular={isRegular} onClick={goPrev} />
        <PageList items={items} currentPage={currentPage} onPageClick={onChange} />
        <NavButton direction="right" disabled={isLast}  btnWidth={btnWidth} btnHeight={btnHeight} isRegular={isRegular} onClick={goNext} />
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        {trailingContent}
      </div>
    </div>
  )
}
