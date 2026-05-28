// SSO 로그인 응답 설정 UI — 인스펙터에 노출.
//
// 외부 props.
//   config: { ssoUrl, exchangeUrl, tokenVariableId, memberCodeVariableId, nextLink }
//   onChange(patch): 부분 업데이트
//   variables: 등록된 봇 변수 (토큰/회원코드 매핑용 picker 옵션)
//   scenarioOptions/currentScenarioId/currentResponseId: nextLink 의 LinkEditor 용

import Textfield from '../design-system/components/Textfield/Textfield.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import { LinkEditor } from './ChatMessageConfig.jsx'
import MenuSelect from './MenuSelect.jsx'
import './SsoConfig.css'

export default function SsoConfig({
  config,
  onChange,
  variables = [],
  scenarioOptions = [],
  currentScenarioId = null,
  currentResponseId = null,
}) {
  const update = (patch) => onChange({ ...config, ...patch })

  const variableOptions = variables.map((v) => ({
    value: v.id,
    label: `{{$${v.displayName?.trim() || v.originalKey}}}`,
  }))

  return (
    <div className="sso-config">
      <section className="sso-config__section">
        <Typography variant="body-2-normal" weight="semibold" color="var(--color-label-neutral)" as="div">
          팝업 SSO 페이지
        </Typography>
        <Textfield
          heading="SSO URL"
          required
          placeholder="예: http://localhost:5178/mock-sso/login"
          value={config.ssoUrl}
          onChange={(e) => update({ ssoUrl: e.target.value })}
          description="새 창으로 열릴 로그인 페이지. 로그인 완료 시 부모 창으로 postMessage 를 보내야 합니다."
        />
        <Textfield
          heading="토큰 교환 URL"
          required
          placeholder="예: http://localhost:5178/api/mock/auth/exchange"
          value={config.exchangeUrl}
          onChange={(e) => update({ exchangeUrl: e.target.value })}
          description="SSO 가 돌려준 authCode 를 accessToken 으로 바꾸는 API 엔드포인트."
        />
      </section>

      <section className="sso-config__section">
        <Typography variant="body-2-normal" weight="semibold" color="var(--color-label-neutral)" as="div">
          저장할 변수
        </Typography>
        <Typography variant="label-1-normal" color="var(--color-label-alternative)" as="div">
          교환 API 응답의 accessToken 과 memberCode 를 어느 변수에 저장할지 선택. (선택 안 한 항목은 메모리에 안 들어갑니다.)
        </Typography>
        <div className="sso-config__field">
          <Typography variant="label-1-normal" weight="medium" color="var(--color-label-neutral)" as="div">
            accessToken 저장 변수
          </Typography>
          <MenuSelect
            value={config.tokenVariableId ?? ''}
            onChange={(id) => update({ tokenVariableId: id })}
            options={variableOptions}
            placeholder={
              variableOptions.length === 0 ? '먼저 변수를 등록해주세요' : '변수 선택'
            }
            disabled={variableOptions.length === 0}
          />
        </div>
        <div className="sso-config__field">
          <Typography variant="label-1-normal" weight="medium" color="var(--color-label-neutral)" as="div">
            memberCode 저장 변수
          </Typography>
          <MenuSelect
            value={config.memberCodeVariableId ?? ''}
            onChange={(id) => update({ memberCodeVariableId: id })}
            options={variableOptions}
            placeholder={
              variableOptions.length === 0 ? '먼저 변수를 등록해주세요' : '변수 선택'
            }
            disabled={variableOptions.length === 0}
          />
        </div>
      </section>

      <section className="sso-config__section">
        <Typography variant="body-2-normal" weight="semibold" color="var(--color-label-neutral)" as="div">
          로그인 완료 후 진행할 응답
        </Typography>
        <LinkEditor
          link={config.nextLink}
          onChange={(nextLink) => update({ nextLink })}
          scenarioOptions={scenarioOptions}
          currentScenarioId={currentScenarioId}
          currentResponseId={currentResponseId}
          isEnabled
        />
      </section>
    </div>
  )
}
