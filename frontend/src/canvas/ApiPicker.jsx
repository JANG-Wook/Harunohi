// 응답의 API mode 인스펙터 UI — 4 블록 구성.
//   1) 이 시점의 메모리        : scenarioReach 로 활성/비활성 추정 + 전체 변수 노출
//   2) 이 API 가 사용할 변수    : apiVariableScan 으로 {{$xxx}} 추출 + 메모리 가용성 매칭
//   3) 이 API 가 채울 변수      : sourceApiId 가 일치하는 변수 (sourcePath 동반)
//   4) 호출 후 진행할 응답      : 기존 LinkEditor
//
// 메인 선택 UI(사용할 API + 편집 진입)는 1 블록 앞에 둔다. 분기 기능은 5-2 별건.

import { useMemo } from 'react'
import Icon from '../design-system/components/Icon/Icon.jsx'
import TextButton from '../design-system/components/TextButton/TextButton.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import { resolveVariableByKey, scanApiVariables } from '../lib/apiVariableScan.js'
import { computeFilledVariableIds } from '../lib/scenarioReach.js'
import './ApiPicker.css'
import { LinkEditor } from './ChatMessageConfig.jsx'
import MenuSelect from './MenuSelect.jsx'

/** 변수 출처 칩 — SimulatorSidePanel 의 토큰 팔레트와 동일한 컨벤션 */
function SourceChip({ sourceType }) {
  const map = {
    manual: { label: '수동', cls: 'manual' },
    form: { label: '폼', cls: 'form' },
    api: { label: 'API', cls: 'api' },
  }
  const entry = map[sourceType] || map.manual
  return <span className={`api-picker__chip api-picker__chip--${entry.cls}`}>{entry.label}</span>
}

/** 변수의 3 상태 판정.
 *   'flow'   — upstream 의 폼/API/SSO 가 채움
 *   'sample' — manual 변수에 sampleValue 가 있어 기본값으로 치환 가능
 *   'empty'  — 어떤 출처도 없음 */
function variableState(variable, flowFilledIds) {
  if (flowFilledIds.has(variable.id)) return 'flow'
  if (variable.sampleValue !== '' && variable.sampleValue != null) return 'sample'
  return 'empty'
}

/** 변수 한 줄 — 3 상태(흐름/기본값/비어있음) 시각화. 표시 이름은 displayName || originalKey */
function VariableRow({ variable, state }) {
  const name = variable.displayName?.trim() || variable.originalKey
  const mark = state === 'flow' ? '✓' : state === 'sample' ? '·' : '—'
  return (
    <div className={`api-picker__var is-${state}`}>
      <span className="api-picker__var-mark" aria-hidden="true">{mark}</span>
      <span className="api-picker__var-name">{name}</span>
      {state === 'sample' ? (
        <span className="api-picker__chip api-picker__chip--sample">기본값</span>
      ) : (
        <SourceChip sourceType={variable.sourceType} />
      )}
    </div>
  )
}

export default function ApiPicker({
  apiRef,
  onChange,
  registeredApis = [],
  onCreateApi,
  onEditApi,
  scenarioOptions = [],
  scenarios = [],
  currentScenarioId = null,
  currentResponseId = null,
  variables = [],
}) {
  const safeApi = apiRef ?? { apiId: '', nextLink: null }
  const selected = registeredApis.find((a) => a.id === safeApi.apiId)
  const options = registeredApis.map((a) => ({
    value: a.id,
    label: a.name || '(이름 없음)',
  }))

  /* 이 응답 도달 시점에 "흐름으로" 채워진 변수 id 셋 — manual sampleValue 는 포함하지 않음 */
  const flowFilledIds = useMemo(
    () => computeFilledVariableIds(scenarios, variables, currentScenarioId, currentResponseId),
    [scenarios, variables, currentScenarioId, currentResponseId],
  )

  /* 선택된 API 가 사용할 변수 키 → 실제 변수 객체 매칭 */
  const requestVariables = useMemo(() => {
    if (!selected) return []
    const keys = scanApiVariables(selected)
    return keys.map((key) => ({ key, variable: resolveVariableByKey(key, variables) }))
  }, [selected, variables])

  /* 선택된 API 가 채울 변수 — sourceApiId 일치 */
  const outputVariables = useMemo(() => {
    if (!selected) return []
    return variables.filter(
      (v) => v.sourceType === 'api' && (v.sourceApiId === selected.id || v.sourceId === selected.id),
    )
  }, [selected, variables])

  return (
    <div className="api-picker">
      {/* 선택 영역 — 기존 사용할 API + 편집 진입 */}
      <section className="api-picker__select">
        <Typography variant="body-2-normal" weight="semibold" color="var(--color-label-neutral)" as="div">
          사용할 API
        </Typography>
        <MenuSelect
          value={safeApi.apiId}
          onChange={(id) => onChange({ ...safeApi, apiId: id })}
          options={options}
          placeholder={options.length === 0 ? '등록된 API 가 없습니다.' : 'API 선택'}
          disabled={options.length === 0}
        />
        {options.length === 0 ? (
          <TextButton
            color="primary"
            size="small"
            label="새 API 등록하기"
            leadingIcon={<Icon name="plus" size={14} />}
            onClick={() => {
              const id = onCreateApi?.()
              if (id) onEditApi?.(id)
            }}
          />
        ) : selected ? (
          <div className="api-picker__endpoint">
            <span className="api-picker__method">{selected.method}</span>
            <span className="api-picker__url" title={selected.url}>
              {selected.url || '(URL 미설정)'}
            </span>
            <div className="api-picker__edit">
              <TextButton
                color="primary"
                size="small"
                label="편집"
                leadingIcon={<Icon name="pencil" size={12} />}
                onClick={() => onEditApi?.(selected.id)}
              />
            </div>
          </div>
        ) : null}
      </section>

      {/* 블록 1 — 이 시점의 메모리 (3 상태: flow ✓ / sample · / empty ✗) */}
      <section className="api-picker__block">
        <header className="api-picker__block-head">
          <Typography variant="body-2-normal" weight="semibold" color="var(--color-label-neutral)" as="span">
            이 시점의 메모리
          </Typography>
          <Typography variant="caption-1" color="var(--color-label-assistive)" as="span">
            흐름으로 채워짐 {flowFilledIds.size}개 / 전체 {variables.length}개
          </Typography>
        </header>
        {variables.length === 0 ? (
          <Typography variant="caption-1" color="var(--color-label-assistive)" as="div">
            등록된 변수가 없습니다.
          </Typography>
        ) : (
          <div className="api-picker__var-list">
            {/* 정렬: flow → sample → empty */}
            {['flow', 'sample', 'empty'].flatMap((state) =>
              variables
                .filter((v) => variableState(v, flowFilledIds) === state)
                .map((v) => <VariableRow key={v.id} variable={v} state={state} />),
            )}
          </div>
        )}
      </section>

      {/* 블록 2 — 이 API 가 사용할 변수 */}
      <section className="api-picker__block">
        <header className="api-picker__block-head">
          <Typography variant="body-2-normal" weight="semibold" color="var(--color-label-neutral)" as="span">
            이 API 가 사용할 변수
          </Typography>
        </header>
        {!selected ? (
          <Typography variant="caption-1" color="var(--color-label-assistive)" as="div">
            먼저 사용할 API 를 선택하세요.
          </Typography>
        ) : requestVariables.length === 0 ? (
          <Typography variant="caption-1" color="var(--color-label-assistive)" as="div">
            이 API 의 정의에 {'{{$변수}}'} 토큰이 없습니다.
          </Typography>
        ) : (
          <div className="api-picker__var-list">
            {requestVariables.map(({ key, variable }) => {
              if (!variable) {
                // 미등록 변수 — API 정의에 {{$xxx}} 가 있는데 봇 변수에 없음
                return (
                  <div key={key} className="api-picker__var is-unknown">
                    <span className="api-picker__var-mark" aria-hidden="true">!</span>
                    <span className="api-picker__var-name">{key}</span>
                    <span className="api-picker__chip api-picker__chip--unknown">미등록</span>
                  </div>
                )
              }
              const state = variableState(variable, flowFilledIds)
              return <VariableRow key={key} variable={variable} state={state} />
            })}
            {requestVariables.some(({ variable }) => !variable || variableState(variable, flowFilledIds) === 'empty') && (
              <div className="api-picker__warning">
                <Icon name="circleExclamationFill" size={12} color="var(--color-status-negative)" />
                <Typography variant="caption-1" color="var(--color-status-negative)" as="span">
                  값이 비어있거나 미등록된 변수가 있어요. 호출 전 입력 폼이나 다른 API 로 먼저 채워주세요.
                </Typography>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 블록 3 — 이 API 가 채울 변수 */}
      <section className="api-picker__block">
        <header className="api-picker__block-head">
          <Typography variant="body-2-normal" weight="semibold" color="var(--color-label-neutral)" as="span">
            이 API 가 채울 변수
          </Typography>
        </header>
        {!selected ? (
          <Typography variant="caption-1" color="var(--color-label-assistive)" as="div">
            먼저 사용할 API 를 선택하세요.
          </Typography>
        ) : outputVariables.length === 0 ? (
          <Typography variant="caption-1" color="var(--color-label-assistive)" as="div">
            이 API 의 응답값을 받아올 변수가 없습니다. API 를 한 번 테스트 호출한 뒤 응답 트리에서
            값을 변수로 등록하세요.
          </Typography>
        ) : (
          <div className="api-picker__var-list">
            {outputVariables.map((v) => (
              <div key={v.id} className="api-picker__var is-output">
                <span className="api-picker__var-mark" aria-hidden="true">↓</span>
                <span className="api-picker__var-name">
                  {v.displayName?.trim() || v.originalKey}
                </span>
                {v.sourcePath ? (
                  <span className="api-picker__path" title={v.sourcePath}>{v.sourcePath}</span>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 블록 4 — 호출 후 진행할 응답 */}
      <section className="api-picker__block">
        <header className="api-picker__block-head">
          <Typography variant="body-2-normal" weight="semibold" color="var(--color-label-neutral)" as="span">
            호출 후 진행할 응답
          </Typography>
        </header>
        <LinkEditor
          link={safeApi.nextLink}
          onChange={(nextLink) => onChange({ ...safeApi, nextLink })}
          scenarioOptions={scenarioOptions}
          currentScenarioId={currentScenarioId}
          currentResponseId={currentResponseId}
          isEnabled
        />
      </section>
    </div>
  )
}
