// 대화 로그 조회 페이지 — 봇별 세션 목록(좌) + 선택 세션의 대화 트랜스크립트(우). 읽기 전용.

import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Icon from '../design-system/components/Icon/Icon.jsx'
import IconButtonNormal from '../design-system/components/IconButton/IconButtonNormal.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import { getBot, listSessions, listSessionMessages } from '../lib/botApi.js'
import { roleOf, summarizeContent } from '../lib/conversationLog.js'
import './ConversationLogPage.css'

/** ISO → "05.23 14:30" (목록/헤더 공용, 연도 생략) */
function formatDateTime(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

/** ISO → "14:30:05" (메시지 시각) */
function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

export default function ConversationLogPage() {
  const { botId } = useParams()
  const navigate = useNavigate()

  const [botName, setBotName] = useState('')
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedId, setSelectedId] = useState(null)
  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messagesError, setMessagesError] = useState('')

  /* 봇 이름 + 세션 목록 로드 */
  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    Promise.all([getBot(botId), listSessions(botId)])
      .then(([bot, list]) => {
        if (!alive) return
        setBotName(bot?.name ?? '')
        setSessions(list ?? [])
        if (list?.length) setSelectedId(list[0].publicId) // 첫 세션 자동 선택
      })
      .catch((e) => { if (alive) setError(e?.message ?? '대화 로그를 불러오지 못했습니다.') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [botId])

  /* 선택 세션의 메시지 로드 */
  useEffect(() => {
    if (!selectedId) { setMessages([]); return }
    let alive = true
    setMessagesLoading(true)
    setMessagesError('')
    listSessionMessages(botId, selectedId)
      .then((list) => { if (alive) setMessages(list ?? []) })
      .catch((e) => { if (alive) setMessagesError(e?.message ?? '대화 내용을 불러오지 못했습니다.') })
      .finally(() => { if (alive) setMessagesLoading(false) })
    return () => { alive = false }
  }, [botId, selectedId])

  const selected = useMemo(
    () => sessions.find((s) => s.publicId === selectedId) ?? null,
    [sessions, selectedId],
  )

  return (
    <div className="conv-log">
      <div className="conv-log__header">
        <IconButtonNormal
          icon={<Icon name="arrowLeft" size={20} />}
          size="small"
          onClick={() => navigate('/app/bots')}
          aria-label="챗봇 목록으로"
        />
        <Typography variant="title-2" weight="bold" as="h1">대화 로그</Typography>
        {botName && (
          <Typography variant="body-1-normal" color="var(--color-label-alternative)" as="span">
            {botName}
          </Typography>
        )}
      </div>

      {loading || error ? (
        <div className="conv-log__state">
          <Typography variant="body-1-normal" color="var(--color-label-alternative)" as="div">
            {error || '대화 로그를 불러오는 중입니다...'}
          </Typography>
        </div>
      ) : sessions.length === 0 ? (
        <div className="conv-log__state">
          <Typography variant="body-1-normal" color="var(--color-label-alternative)" as="div">
            아직 이 챗봇의 대화 기록이 없어요. 공개 대화방에서 대화가 이루어지면 여기에 쌓입니다.
          </Typography>
        </div>
      ) : (
        <div className="conv-log__body">
          {/* 좌: 세션 목록 */}
          <aside className="conv-log__sessions sidebar-scroll">
            {sessions.map((s) => (
              <button
                key={s.publicId}
                type="button"
                className={`conv-log__session${s.publicId === selectedId ? ' conv-log__session--active' : ''}`}
                onClick={() => setSelectedId(s.publicId)}
              >
                <Typography variant="label-1-normal" weight="medium" as="span">
                  {formatDateTime(s.startedAt)}
                </Typography>
                <Typography variant="caption-1" color="var(--color-label-alternative)" as="span">
                  메시지 {s.messageCount}개
                </Typography>
              </button>
            ))}
          </aside>

          {/* 우: 트랜스크립트 */}
          <section className="conv-log__transcript sidebar-scroll">
            {messagesLoading || messagesError ? (
              <div className="conv-log__state">
                <Typography variant="body-2-normal" color="var(--color-label-alternative)" as="div">
                  {messagesError || '대화 내용을 불러오는 중입니다...'}
                </Typography>
              </div>
            ) : (
              <>
                {selected && (
                  <div className="conv-log__transcript-head">
                    <Typography variant="caption-1" color="var(--color-label-alternative)" as="span">
                      {formatDateTime(selected.startedAt)} 시작 · 메시지 {selected.messageCount}개
                    </Typography>
                  </div>
                )}
                {messages.map((m, idx) => {
                  const role = roleOf(m.sender)
                  const text = summarizeContent(m.contentType, m.content)
                  if (!text) return null
                  return (
                    <div key={idx} className={`conv-log__msg conv-log__msg--${role}`}>
                      <div className="conv-log__bubble">
                        <Typography variant="body-2-normal" as="div" className="conv-log__bubble-text">
                          {text}
                        </Typography>
                      </div>
                      <Typography variant="caption-1" as="span" className="conv-log__msg-time">
                        {formatTime(m.createdAt)}
                      </Typography>
                    </div>
                  )
                })}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
