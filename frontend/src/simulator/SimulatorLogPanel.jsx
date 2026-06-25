// 시뮬레이터 우측 실제 로그 — API 호출 요청/응답 원문(JSON)을 개발자용으로 표시.
// 이벤트 로그(요약)와 별개. history 의 kind:'api-call' 이벤트만 모아 펼침 카드로 렌더.

import { useEffect, useMemo, useRef, useState } from 'react'
import ContentBadge from '../design-system/components/ContentBadge/ContentBadge.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import './SimulatorLogPanel.css'

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ''
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

function formatJson(value) {
  if (value == null) return '—'
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

/** API 호출 1건 — 요청/응답 원문 펼침 카드 */
function LogCard({ entry, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const success = entry.ok && !entry.error
  const statusColor = entry.error
    ? 'var(--color-accent-fg-red)'
    : success
      ? 'var(--color-status-positive)'
      : 'var(--color-status-cautionary)'

  return (
    <div className="sim-log__card">
      <button type="button" className="sim-log__card-head" onClick={() => setOpen((v) => !v)}>
        <Icon name={open ? 'chevronDownSmall' : 'chevronRightSmall'} size={16} />
        <span className="sim-log__card-name" title={entry.apiName}>{entry.apiName}</span>
        <span className="sim-log__card-status" style={{ color: statusColor }}>
          {entry.error ? '실패' : entry.httpStatus || '-'}
        </span>
        <span className="sim-log__card-time">{formatTime(entry.calledAt || entry.at)}</span>
      </button>
      {open && (
        <div className="sim-log__card-body">
          <div className="sim-log__sub">
            <span className="sim-log__sub-label">요청</span>
            <pre className="sim-log__pre">{formatJson(entry.request)}</pre>
          </div>
          <div className="sim-log__sub">
            <span className="sim-log__sub-label">응답</span>
            <pre className="sim-log__pre">
              {formatJson(entry.error ? { error: entry.error } : { httpStatus: entry.httpStatus, body: entry.responseBody })}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SimulatorLogPanel({ session }) {
  const logs = useMemo(
    () => (session?.history ?? []).filter((e) => e.kind === 'api-call'),
    [session?.history],
  )
  const scrollRef = useRef(null)
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [logs.length])

  return (
    <aside className="sim-log">
      <div className="sim-log__head">
        <Icon name="code" size={14} color="var(--color-label-assistive)" />
        <Typography variant="label-1-normal" weight="semibold" color="var(--color-label-neutral)" as="span">실제 로그</Typography>
        <span className="sim-log__count"><ContentBadge size="xsmall">{String(logs.length)}</ContentBadge></span>
      </div>

      <div className="sim-log__body sidebar-scroll" ref={scrollRef}>
        {logs.length === 0 ? (
          <Typography variant="caption-1" color="var(--color-label-assistive)" as="div">
            API 호출이 발생하면 요청·응답 원문이 여기에 표시됩니다.
          </Typography>
        ) : (
          logs.map((entry, idx) => (
            <LogCard key={idx} entry={entry} defaultOpen={idx === logs.length - 1} />
          ))
        )}
      </div>
    </aside>
  )
}
