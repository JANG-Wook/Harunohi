// 응답의 API mode 인스펙터 UI — 등록된 API 선택 + 호출 후 진행할 응답 link.
// 인라인 API 설정은 더이상 없음 (등록 API 가 단일 출처). 편집은 좌측 패널에서.

import Icon from '../design-system/components/Icon/Icon.jsx'
import TextButton from '../design-system/components/TextButton/TextButton.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import { LinkEditor } from './ChatMessageConfig.jsx'
import MenuSelect from './MenuSelect.jsx'

export default function ApiPicker({
  apiRef,              // { apiId, nextLink } — 응답의 messageConfig.api
  onChange,            // (patch) => void — { apiId, nextLink } 부분 업데이트
  registeredApis = [], // 봇 전역 API 목록
  onCreateApi,         // () => string — 새 API 만들고 그 id 반환
  onEditApi,           // (apiId) => void — 좌측 패널 편집 모달 열기
  scenarioOptions = [],
  currentScenarioId = null,
  currentResponseId = null,
}) {
  const safeApi = apiRef ?? { apiId: '', nextLink: null }
  const selected = registeredApis.find((a) => a.id === safeApi.apiId)
  const options = registeredApis.map((a) => ({
    value: a.id,
    label: a.name || '(이름 없음)',
  }))

  return (
    <div style={{ padding: 'var(--spacing-16)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-16)' }}>
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-8)' }}>
            <span
              style={{
                fontFamily: "'SFMono-Regular', Consolas, monospace",
                fontSize: '10px',
                fontWeight: 700,
                padding: '1px var(--spacing-4)',
                borderRadius: 'var(--spacing-4)',
                background: 'color-mix(in srgb, var(--color-primary-normal) 12%, transparent)',
                color: 'var(--color-primary-normal)',
              }}
            >
              {selected.method}
            </span>
            <Typography variant="label-1-normal" color="var(--color-label-alternative)" as="span">
              {selected.url || '(URL 미설정)'}
            </Typography>
            <div style={{ marginLeft: 'auto' }}>
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

      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
        <Typography variant="body-2-normal" weight="semibold" color="var(--color-label-neutral)" as="div">
          호출 후 진행할 응답
        </Typography>
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
