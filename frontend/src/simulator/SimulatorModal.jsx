// 시뮬레이터 모달 — 좌측 챗 영역 + 우측 사이드 패널 + 헤더(재시작·닫기)
//
// 외부에서 isOpen, scenarios, botName 을 받아 열고, 닫힘은 onClose 콜백.
// DS 에 모달/스플릿 컴포넌트가 없어 backdrop 과 레이아웃은 토큰으로 직접 구현.

import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../design-system/components/Icon/Icon.jsx'
import IconButtonNormal from '../design-system/components/IconButton/IconButtonNormal.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import {
  createSession,
  clickButton,
  restart,
  sendUtterance,
  submitForm,
  clearMemory,
  advanceApiIfNeeded,
  advanceSsoIfNeeded,
  effectiveVariables,
  getActiveResponse,
} from '../lib/simulatorRuntime.js'
import { callApi } from '../lib/apiCaller.js'
import { runSsoFlow } from '../lib/ssoFlow.js'
import { useFocusTrap } from '../lib/useFocusTrap.js'
import SimulatorChat from './SimulatorChat.jsx'
import SimulatorSidePanel from './SimulatorSidePanel.jsx'
import './SimulatorModal.css'

export default function SimulatorModal({
  isOpen,
  onClose,
  scenarios,
  variables = [],
  apis = [],
  botName,
}) {
  /* 시뮬레이터 세션 — 모달 열릴 때 scenarios/variables/apis 로 초기화 */
  const [session, setSession] = useState(() =>
    createSession({ scenarios: scenarios ?? [], variables, apis }),
  )

  // 열릴 때마다 세션 새로 시작 — 항상 깨끗한 상태로 진입
  useEffect(() => {
    if (isOpen) setSession(createSession({ scenarios: scenarios ?? [], variables, apis }))
  }, [isOpen, scenarios, variables, apis])

  /* 활성 봇 응답이 API mode 면 자동으로 API 호출 → 다음 응답 진행.
     중복 호출 방지 — responseId 가 바뀔 때마다 한 번만 실행 */
  const lastApiResponseIdRef = useRef(null)
  useEffect(() => {
    const active = getActiveResponse(session)
    if (!active || session.ended) return
    if (active.response.messageConfig?.mode !== 'api') return
    if (lastApiResponseIdRef.current === active.responseId) return
    lastApiResponseIdRef.current = active.responseId
    // 비동기 호출 — 결과 받으면 setSession
    advanceApiIfNeeded(session, callApi).then((next) => {
      setSession(next)
    })
  }, [session])

  /* 활성 봇 응답이 SSO mode 면 자동으로 팝업 흐름 실행 → 토큰 저장 + 다음 응답 진행.
     API 와 같은 중복 방지 패턴 */
  const lastSsoResponseIdRef = useRef(null)
  useEffect(() => {
    const active = getActiveResponse(session)
    if (!active || session.ended) return
    if (active.response.messageConfig?.mode !== 'sso') return
    if (lastSsoResponseIdRef.current === active.responseId) return
    lastSsoResponseIdRef.current = active.responseId
    advanceSsoIfNeeded(session, runSsoFlow).then((next) => {
      setSession(next)
    })
  }, [session])

  /* Esc 닫기 + 배경 스크롤 잠금 */
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [isOpen, onClose])

  const handleClickButton = (label, link) => {
    setSession((prev) => clickButton(prev, label, link))
  }
  const handleSubmitForm = (value) => {
    setSession((prev) => submitForm(prev, value))
  }
  const handleSendUtterance = (text) => {
    setSession((prev) => sendUtterance(prev, text))
  }
  const handleRestart = () => {
    lastApiResponseIdRef.current = null
    lastSsoResponseIdRef.current = null
    setSession(restart(session))
  }
  const handleClearMemory = () => {
    setSession((prev) => clearMemory(prev))
  }

  // 봇명 표시는 props 우선, 없으면 시나리오 이름으로 fallback
  const headerName = useMemo(() => botName || '챗봇 미리보기', [botName])

  const dialogRef = useRef(null)
  useFocusTrap(dialogRef, isOpen)

  if (!isOpen) return null

  return (
    <div
      className="sim-modal__backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="sim-modal"
        role="dialog"
        aria-modal="true"
        aria-label="시뮬레이터"
        ref={dialogRef}
        tabIndex={-1}
      >
        <header className="sim-modal__head">
          <div className="sim-modal__title">
            <Icon name="play" size={16} color="var(--color-primary-normal)" />
            <Typography variant="headline-2" weight="semibold" as="span">
              시뮬레이터
            </Typography>
            <span className="sim-modal__bot">— {headerName}</span>
          </div>
          <div className="sim-modal__head-actions">
            <button
              type="button"
              className="sim-modal__restart"
              onClick={handleRestart}
              aria-label="대화 재시작"
            >
              <Icon name="refresh" size={14} />
              <span>재시작</span>
            </button>
            <IconButtonNormal
              icon={<Icon name="close" size={18} />}
              onClick={onClose}
              aria-label="시뮬레이터 닫기"
            />
          </div>
        </header>

        <div className="sim-modal__body">
          <SimulatorChat
            session={session}
            variables={effectiveVariables(session)}
            onClickButton={handleClickButton}
            onSubmitForm={handleSubmitForm}
            onSendUtterance={handleSendUtterance}
            botName={headerName}
          />
          <SimulatorSidePanel session={session} onClearMemory={handleClearMemory} />
        </div>
      </div>
    </div>
  )
}
