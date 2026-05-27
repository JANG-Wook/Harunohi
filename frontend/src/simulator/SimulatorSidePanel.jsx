// 시뮬레이터 우측 사이드 — 현재 위치(시나리오·응답) + 향후 메모리/이벤트 자리 예약

import Icon from '../design-system/components/Icon/Icon.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import { getActiveResponse } from '../lib/simulatorRuntime.js'
import './SimulatorSidePanel.css'

export default function SimulatorSidePanel({ session }) {
  const active = getActiveResponse(session)
  const sc = active
    ? session.scenarios.find((s) => s.id === active.scenarioId)
    : null

  return (
    <aside className="sim-side">
      <div className="sim-side__section">
        <div className="sim-side__head">
          <Icon name="location" size={14} color="var(--color-label-assistive)" />
          <Typography variant="label-1-normal" weight="semibold" color="var(--color-label-assistive)" as="span">
            현재 위치
          </Typography>
        </div>
        {active ? (
          <div className="sim-side__crumb">
            <Typography variant="caption-1" color="var(--color-label-alternative)" as="span">
              시나리오
            </Typography>
            <Typography variant="label-1-normal" weight="medium" color="var(--color-label-normal)" as="div">
              {sc?.name ?? '(이름 없음)'}
            </Typography>
            <div className="sim-side__sep" />
            <Typography variant="caption-1" color="var(--color-label-alternative)" as="span">
              응답
            </Typography>
            <Typography variant="label-1-normal" weight="medium" color="var(--color-label-normal)" as="div">
              {active.response?.name ?? '(이름 없음)'}
            </Typography>
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

      {/* 메모리 — 현재 세션의 변수 값 */}
      <div className="sim-side__section">
        <div className="sim-side__head">
          <Icon name="documentText" size={14} color="var(--color-label-assistive)" />
          <Typography variant="label-1-normal" weight="semibold" color="var(--color-label-assistive)" as="span">
            메모리
          </Typography>
        </div>
        {Object.keys(session.memory ?? {}).length === 0 ? (
          <Typography variant="caption-1" color="var(--color-label-assistive)" as="div">
            저장된 변수가 없습니다.
          </Typography>
        ) : (
          <ul className="sim-side__memory">
            {Object.entries(session.memory).map(([k, v]) => (
              <li key={k} className="sim-side__memory-row">
                <span className="sim-side__memory-key">{`{{$${k}}}`}</span>
                <span className="sim-side__memory-value" title={String(v ?? '')}>
                  {String(v ?? '') || '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
