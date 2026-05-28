// API 호출 응답 — 캔버스 컴팩트 노드 미리보기.
// 일반 메시지 카드 대신 "백그라운드 단계" 임을 직관적으로 보여주는 작은 카드.
// 호출할 API 의 메서드/이름/URL + 호출 후 진행할 응답 요약을 한 화면에 노출.

import Icon from '../design-system/components/Icon/Icon.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import { LINK_TRIGGER_TARGET } from '../lib/chatMessageDefaults.js'
import './ApiNodePreview.css'

/** nextLink 객체 → "시나리오명 · 응답명" 요약. 미설정/타깃 없음/유효하지 않음은 null. */
function summarizeNextLink(link, scenarios) {
  if (!link || link.type !== 'bot') return null
  const { targetScenarioId, targetResponseId } = link
  if (!targetScenarioId || !targetResponseId) return null
  const sc = scenarios?.find((s) => s.id === targetScenarioId)
  if (!sc) return null
  if (targetResponseId === LINK_TRIGGER_TARGET) {
    return { scenarioName: sc.name, responseName: '(시작)' }
  }
  const r = sc.responses?.find((x) => x.id === targetResponseId)
  if (!r) return null
  return { scenarioName: sc.name, responseName: r.name }
}

export default function ApiNodePreview({ config, registeredApis = [], scenarios = [] }) {
  const apiRef = config?.api
  const selectedApi = registeredApis.find((a) => a.id === apiRef?.apiId) || null
  const next = summarizeNextLink(apiRef?.nextLink, scenarios)

  return (
    <div className="api-node">
      <div className="api-node__head">
        <span className="api-node__icon" aria-hidden="true">
          <Icon name="thunderFill" size={14} color="var(--color-primary-normal)" />
        </span>
        <Typography variant="label-1-normal" weight="semibold" color="var(--color-primary-normal)" as="span">
          API 호출
        </Typography>
      </div>

      <div className="api-node__body">
        {selectedApi ? (
          <>
            <Typography variant="body-2-normal" weight="semibold" color="var(--color-label-normal)" as="div">
              {selectedApi.name || '(이름 없음)'}
            </Typography>
            <div className="api-node__endpoint">
              <span className="api-node__method">{selectedApi.method || 'GET'}</span>
              <span className="api-node__url" title={selectedApi.url}>
                {selectedApi.url || '(URL 미설정)'}
              </span>
            </div>
          </>
        ) : (
          <Typography variant="label-1-normal" color="var(--color-label-assistive)" as="div">
            사용할 API 가 선택되지 않았습니다.
          </Typography>
        )}
      </div>

      <div className="api-node__divider" />

      <div className="api-node__next">
        <Typography variant="caption-1" color="var(--color-label-alternative)" as="span">
          호출 후 진행
        </Typography>
        {next ? (
          <div className="api-node__next-line">
            <Icon name="arrowUpRight" size={12} color="var(--color-label-alternative)" />
            <span className="api-node__next-scenario">{next.scenarioName}</span>
            <span className="api-node__next-sep">·</span>
            <span className="api-node__next-response">{next.responseName}</span>
          </div>
        ) : (
          <Typography variant="caption-1" color="var(--color-status-negative)" as="span">
            연결된 응답이 없습니다.
          </Typography>
        )}
      </div>
    </div>
  )
}
