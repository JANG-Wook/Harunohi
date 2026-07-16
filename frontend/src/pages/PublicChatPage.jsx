// 공개 대화방 — 무인증. 발행된 봇 배포 스냅샷을 로드해 방문자가 실제로 대화한다.
// 위젯(iframe)이 여는 화면. 세션/런타임은 시뮬레이터와 동일(simulatorRuntime), 렌더는 SimulatorChat 재사용.

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  createSession,
  clickButton,
  submitForm,
  sendUtterance,
  advanceApiIfNeeded,
  advanceSsoIfNeeded,
  getActiveResponse,
} from '../lib/simulatorRuntime.js'
import { callApi } from '../lib/apiCaller.js'
import { runSsoFlow } from '../lib/ssoFlow.js'
import { getPublicDeployment } from '../lib/botApi.js'
import { startSession, appendMessages, toLogMessage } from '../lib/chatLogApi.js'
import SimulatorChat from '../simulator/SimulatorChat.jsx'
import './PublicChatPage.css'

/** 스냅샷 JSON → { scenarios, variables, apis, launcherUi, botName } */
function parseSnapshot(dep) {
  let def = {}
  try {
    def = dep?.snapshotJson ? JSON.parse(dep.snapshotJson) : {}
  } catch {
    def = {}
  }
  return {
    scenarios: def.scenarios ?? [],
    variables: def.variables ?? [],
    apis: def.apis ?? [],
    launcherUi: def.launcherUi ?? null,
    botName: dep?.botName ?? '챗봇',
  }
}

export default function PublicChatPage() {
  const { botId } = useParams()
  const [snapshot, setSnapshot] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    setSnapshot(null)
    setError('')
    getPublicDeployment(botId)
      .then((dep) => { if (alive) setSnapshot(parseSnapshot(dep)) })
      .catch((e) => { if (alive) setError(e?.status === 404 ? '발행된 봇이 없습니다.' : (e?.message ?? '봇을 불러오지 못했습니다.')) })
    return () => { alive = false }
  }, [botId])

  if (error) return <div className="public-chat__state">{error}</div>
  if (!snapshot) return <div className="public-chat__state">불러오는 중입니다...</div>
  return <PublicChatRuntime key={botId} snapshot={snapshot} botPublicId={botId} />
}

/** 로드 완료 후 세션/런타임을 소유하는 내부 컴포넌트 (SimulatorModal 의 세션 로직과 동일 패턴) */
function PublicChatRuntime({ snapshot, botPublicId }) {
  const { scenarios, variables, apis, launcherUi, botName } = snapshot
  const [session, setSession] = useState(() => createSession({ scenarios, variables, apis }))

  /* 대화 로그 — 마운트 시 서버 세션 시작 후, history 증분만 전송(fire-and-forget) */
  const [logSessionId, setLogSessionId] = useState(null)
  const sentCountRef = useRef(0)
  useEffect(() => {
    let alive = true
    startSession(botPublicId).then((id) => { if (alive) setLogSessionId(id) })
    return () => { alive = false }
  }, [botPublicId])
  useEffect(() => {
    if (!logSessionId) return
    const history = session.history ?? []
    if (history.length < sentCountRef.current) {
      sentCountRef.current = history.length // 예기치 못한 축소(재시작 등) 시 중복 전송 방지
      return
    }
    if (history.length === sentCountRef.current) return
    const delta = history.slice(sentCountRef.current)
    sentCountRef.current = history.length
    appendMessages(logSessionId, delta.map(toLogMessage))
  }, [session, logSessionId])

  /* API mode 응답 자동 진행 — responseId 바뀔 때 한 번만 */
  const lastApiIdRef = useRef(null)
  useEffect(() => {
    const active = getActiveResponse(session)
    if (!active || session.ended) return
    if (active.response.messageConfig?.mode !== 'api') return
    if (lastApiIdRef.current === active.responseId) return
    lastApiIdRef.current = active.responseId
    advanceApiIfNeeded(session, callApi).then(setSession)
  }, [session])

  /* SSO mode 응답 자동 진행 */
  const lastSsoIdRef = useRef(null)
  useEffect(() => {
    const active = getActiveResponse(session)
    if (!active || session.ended) return
    if (active.response.messageConfig?.mode !== 'sso') return
    if (lastSsoIdRef.current === active.responseId) return
    lastSsoIdRef.current = active.responseId
    advanceSsoIfNeeded(session, runSsoFlow).then(setSession)
  }, [session])

  const effectiveVariables = useMemo(() => variables, [variables])

  return (
    <div className="public-chat">
      <SimulatorChat
        session={session}
        variables={effectiveVariables}
        onClickButton={(label, link) => setSession((prev) => clickButton(prev, label, link))}
        onSubmitForm={(value) => setSession((prev) => submitForm(prev, value))}
        onSendUtterance={(text) => setSession((prev) => sendUtterance(prev, text))}
        botName={botName}
        launcherUi={launcherUi}
      />
    </div>
  )
}
