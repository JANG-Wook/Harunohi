// 시뮬레이터 우측 사이드 — 현재 위치 + 메모리 (출처 칩, 하이라이트, 비우기) + 이벤트 로그.

import { useEffect, useMemo, useRef, useState } from 'react'
import ContentBadge from '../design-system/components/ContentBadge/ContentBadge.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import { getActiveResponse } from '../lib/simulatorRuntime.js'
import './SimulatorSidePanel.css'

const SOURCE_LABEL = {
  manual: '수동',
  api: 'API',
  form: '폼',
}

/** session.variables 를 모든 등록 변수 목록으로 사용, 각각의 현재 값/출처 결합 */
function buildMemoryRows(session) {
  const memory = session.memory ?? {}
  const variables = session.variables ?? []
  const lastUpdated = new Set(session.lastUpdatedKeys ?? [])

  // 등록된 변수 우선, 그 다음 변수에 없지만 memory 에만 있는 키 (외부에서 들어온 경우 — 표시는 함)
  const rows = []
  const seen = new Set()
  for (const v of variables) {
    const key = v.displayName?.trim() || v.originalKey
    if (!key || seen.has(key)) continue
    seen.add(key)
    const value = memory[key] ?? memory[v.originalKey] ?? ''
    const isEmpty = value === '' || value == null
    const highlighted = lastUpdated.has(key) || lastUpdated.has(v.originalKey)
    rows.push({
      key,
      value: String(value),
      isEmpty,
      highlighted,
      source: v.sourceType ?? 'manual',
    })
  }
  // 변수에 등록 안 됐지만 memory 에 있는 키 (예: 동적 추가) — 표시는 해주되 source 는 unknown
  for (const k of Object.keys(memory)) {
    if (seen.has(k)) continue
    seen.add(k)
    rows.push({
      key: k,
      value: String(memory[k] ?? ''),
      isEmpty: memory[k] == null || memory[k] === '',
      highlighted: lastUpdated.has(k),
      source: 'manual',
    })
  }
  return rows
}

/** at(timestamp) → "HH:MM:SS" */
function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/** history event → { icon, color, summary } for log display */
function describeEvent(event) {
  switch (event.kind) {
    case 'bot':
      return {
        icon: 'chat',
        color: 'var(--color-primary-normal)',
        summary: `봇: ${event.response?.name ?? '응답'}`,
      }
    case 'user-click':
      return {
        icon: 'arrowUpRight',
        color: 'var(--color-label-neutral)',
        summary: `사용자: "${event.label ?? '클릭'}"`,
      }
    case 'user-utterance':
      return {
        icon: 'keyboard',
        color: 'var(--color-label-neutral)',
        summary: `발화: "${event.text}"`,
      }
    case 'memory-update':
      return {
        icon: 'documentText',
        color: 'var(--color-status-positive)',
        summary: `메모리 갱신: ${(event.keys ?? []).join(', ')}`,
      }
    case 'system':
    default:
      return {
        icon: 'circleInfo',
        color: 'var(--color-label-alternative)',
        summary: event.text ?? '',
      }
  }
}

export default function SimulatorSidePanel({ session, onClearMemory }) {
  const active = getActiveResponse(session)
  const sc = active ? session.scenarios.find((s) => s.id === active.scenarioId) : null

  const memoryRows = useMemo(() => buildMemoryRows(session), [session])

  /* 이벤트 로그 — api-call(원문)은 우측 실제 로그 패널 전용이라 여기선 제외(기존 요약 유지) */
  const eventLog = useMemo(
    () => session.history.filter((e) => e.kind !== 'api-call'),
    [session.history],
  )

  /* 이벤트 로그 — 기본 접힘, 새 이벤트 추가 시 자동 스크롤 (펼침 상태일 때만) */
  const [logOpen, setLogOpen] = useState(true)
  const logScrollRef = useRef(null)
  useEffect(() => {
    if (!logOpen) return
    const el = logScrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [session.history.length, logOpen])

  return (
    <aside className="sim-side">
      {/* ── 현재 위치 ──────────────────────────────────────────── */}
      <div className="sim-side__section">
        <div className="sim-side__head">
          <Icon name="location" size={14} color="var(--color-label-assistive)" />
          <Typography variant="label-1-normal" weight="semibold" color="var(--color-label-neutral)" as="span">
            현재 위치
          </Typography>
        </div>
        {active ? (
          <div className="sim-side__crumb">
            <div className="sim-side__crumb-row">
              <Typography variant="caption-1" color="var(--color-label-alternative)" as="span" className="sim-side__crumb-label">
                시나리오
              </Typography>
              <Typography variant="label-1-normal" weight="medium" color="var(--color-label-normal)" as="span" className="sim-side__crumb-value">
                {sc?.name ?? '(이름 없음)'}
              </Typography>
            </div>
            <div className="sim-side__crumb-divider" aria-hidden="true" />
            <div className="sim-side__crumb-row">
              <Typography variant="caption-1" color="var(--color-label-alternative)" as="span" className="sim-side__crumb-label">
                응답
              </Typography>
              <Typography variant="label-1-normal" weight="medium" color="var(--color-label-normal)" as="span" className="sim-side__crumb-value">
                {active.response?.name ?? '(이름 없음)'}
              </Typography>
            </div>
          </div>
        ) : (
          <Typography variant="body-2-normal" color="var(--color-label-assistive)" as="div">
            아직 활성 응답이 없습니다.
          </Typography>
        )}
      </div>

      {session.ended && (
        <div className="sim-side__section sim-side__section--end">
          <Icon name="circleCheck" size={16} color="var(--color-status-positive)" />
          <Typography variant="label-1-normal" weight="medium" color="var(--color-label-normal)" as="span">
            대화가 종료되었어요
          </Typography>
          {session.error && (
            <Typography variant="caption-1" color="var(--color-label-alternative)" as="div">
              {session.error}
            </Typography>
          )}
        </div>
      )}

      {/* ── 메모리 — 출처 칩 + 하이라이트 + 빈 값 회색 + 비우기 ── */}
      <div className="sim-side__section">
        <div className="sim-side__head sim-side__head--actionable">
          <div className="sim-side__head-left">
            <Icon name="documentText" size={14} color="var(--color-label-assistive)" />
            <Typography variant="label-1-normal" weight="semibold" color="var(--color-label-neutral)" as="span">
              메모리
            </Typography>
          </div>
          {onClearMemory && memoryRows.length > 0 && (
            <button
              type="button"
              className="sim-side__head-action"
              onClick={onClearMemory}
              aria-label="메모리 비우기"
            >
              비우기
            </button>
          )}
        </div>
        {memoryRows.length === 0 ? (
          <Typography variant="caption-1" color="var(--color-label-assistive)" as="div">
            등록된 변수가 없어요.
          </Typography>
        ) : (
          <ul className="sim-side__memory sidebar-scroll">
            {memoryRows.map((row) => (
              <li
                key={row.key}
                className={[
                  'sim-side__memory-row',
                  row.highlighted && 'sim-side__memory-row--highlight',
                  row.isEmpty && 'sim-side__memory-row--empty',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className="sim-side__memory-key">{`{{$${row.key}}}`}</span>
                <span
                  className={[
                    'sim-side__memory-source',
                    `sim-side__memory-source--${row.source}`,
                  ].join(' ')}
                >
                  {SOURCE_LABEL[row.source] ?? row.source}
                </span>
                <span className="sim-side__memory-value" title={row.value}>
                  {row.isEmpty ? '—' : row.value}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── 이벤트 로그 — 접힘/펼침 토글 ──────────────────────── */}
      <div className="sim-side__section">
        <button
          type="button"
          className="sim-side__head sim-side__head--toggle"
          onClick={() => setLogOpen((v) => !v)}
          aria-expanded={logOpen}
        >
          <div className="sim-side__head-left">
            <Icon
              name={logOpen ? 'chevronDown' : 'chevronRight'}
              size={12}
              color="var(--color-label-assistive)"
            />
            <Typography variant="label-1-normal" weight="semibold" color="var(--color-label-neutral)" as="span">
              이벤트 로그
            </Typography>
          </div>
          <ContentBadge size="xsmall">{eventLog.length}</ContentBadge>
        </button>
        {logOpen && (
          <div className="sim-side__log sidebar-scroll" ref={logScrollRef}>
            {eventLog.length === 0 ? (
              <Typography variant="caption-1" color="var(--color-label-assistive)" as="div">
                아직 이벤트가 없어요.
              </Typography>
            ) : (
              eventLog.map((event, idx) => {
                const desc = describeEvent(event)
                return (
                  <div key={idx} className="sim-side__log-row">
                    <span className="sim-side__log-time">{formatTime(event.at)}</span>
                    <span className="sim-side__log-icon" style={{ color: desc.color }}>
                      <Icon name={desc.icon} size={12} />
                    </span>
                    <span className="sim-side__log-summary" title={desc.summary}>
                      {desc.summary}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
