// 챗봇 채널 목록 — 봇 + 챗봇 설정을 묶은 채널을 카드로 노출. 만들기 모달 / 상세 모달(호출 URL·HTML 복사) 포함.

import { useEffect, useRef, useState } from 'react'
import Alert from '../design-system/components/Alert/Alert.jsx'
import Button from '../design-system/components/Button/Button.jsx'
import ContentBadge from '../design-system/components/ContentBadge/ContentBadge.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import IconButtonNormal from '../design-system/components/IconButton/IconButtonNormal.jsx'
import Snackbar from '../design-system/components/Snackbar/Snackbar.jsx'
import Switch from '../design-system/components/Switch/Switch.jsx'
import Textfield from '../design-system/components/Textfield/Textfield.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import MenuSelect from '../canvas/MenuSelect.jsx'
import { useFocusTrap } from '../lib/useFocusTrap.js'
import {
  channelChatUrl,
  channelEmbedHtml,
  channelTypeLabel,
  createChannel,
  deleteChannel,
  isChannelNameTaken,
  loadChannelList,
} from '../lib/channelConfig.js'
import { listBots } from '../lib/botApi.js'
import {
  ensureDefaultLauncher,
  loadLauncherList,
} from '../lib/launcherConfig.js'
import './ChannelListPage.css'

const TOAST_DURATION = 2400

/** ISO → "2026.06.30 14:30" */
function formatDate(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

/** 복사 박스 — 코드 텍스트 + 복사 버튼(성공 시 체크 피드백) */
function CopyRow({ value, onCopied }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef(null)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // 클립보드 권한 거부 등 — 폴백
      const ta = document.createElement('textarea')
      ta.value = value
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    onCopied?.()
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="cc__copy">
      <code className="cc__copy-text">{value}</code>
      <button
        type="button"
        className={['cc__copy-btn', copied && 'is-copied'].filter(Boolean).join(' ')}
        onClick={copy}
      >
        <Icon name={copied ? 'check' : 'copy'} size={14} />
        {copied ? '복사됨' : '복사'}
      </button>
    </div>
  )
}

export default function ChannelListPage() {
  const [list, setList] = useState(() => loadChannelList())
  const reload = () => setList(loadChannelList())

  // 셀렉트 옵션 — 모달 열 때 최신화
  const [botOptions, setBotOptions] = useState([])
  const [launcherOptions, setLauncherOptions] = useState([])

  // 만들기 모달
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [botId, setBotId] = useState('')
  const [launcherId, setLauncherId] = useState('')
  const [consulting, setConsulting] = useState(false)
  const [createError, setCreateError] = useState('')

  // 상세 모달 / 삭제 확인
  const [detailTarget, setDetailTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // 모달 포커스 트랩
  const dialogRef = useRef(null)
  useFocusTrap(dialogRef, createOpen || !!detailTarget)

  // 토스트
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const showToast = (msg) => {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), TOAST_DURATION)
  }
  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  /* 만들기 — 모달 즉시 오픈 후 서버 봇/런처 옵션 로드. 런처는 기본값 보장 */
  const openCreate = () => {
    ensureDefaultLauncher(new Date().toISOString())
    setLauncherOptions(loadLauncherList().map((l) => ({ value: l.id, label: l.name })))
    setName('')
    setBotId('')
    setLauncherId('')
    setConsulting(false)
    setCreateError('')
    setBotOptions([])
    setCreateOpen(true)
    // 서버 봇 목록(비동기) — publicId 를 값으로, 이름을 라벨로
    listBots()
      .then((bots) => setBotOptions(bots.map((b) => ({ value: b.publicId, label: b.name }))))
      .catch(() => setBotOptions([]))
  }

  const canSubmit = name.trim() && botId && launcherId

  const submitCreate = () => {
    const trimmed = name.trim()
    if (!trimmed || !botId || !launcherId) return
    if (isChannelNameTaken(trimmed)) {
      setCreateError('이미 사용 중인 이름이에요.')
      return
    }
    createChannel({
      name: trimmed,
      type: 'web',
      botId,
      botName: botOptions.find((o) => o.value === botId)?.label ?? '',
      launcherId,
      consultingEnabled: consulting,
      nowIso: new Date().toISOString(),
    })
    setCreateOpen(false)
    reload()
    showToast(`'${trimmed}' 채널을 만들었어요.`)
  }

  /* 삭제 */
  const confirmDelete = () => {
    if (!deleteTarget) return
    const n = deleteTarget.name
    deleteChannel(deleteTarget.id)
    setDeleteTarget(null)
    reload()
    showToast(`'${n}' 채널을 삭제했어요.`)
  }

  // 모달 Esc/Enter + 스크롤 잠금
  useEffect(() => {
    const anyOpen = createOpen || detailTarget || deleteTarget
    if (!anyOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setCreateOpen(false)
        setDetailTarget(null)
        setDeleteTarget(null)
      }
      if (e.key === 'Enter' && createOpen && canSubmit) submitCreate()
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createOpen, detailTarget, deleteTarget, name, botId, launcherId, consulting])

  /* 상세 — 봇 이름은 생성 시 저장한 값 사용(서버 재조회 없이), 런처는 로컬 목록 조회 */
  const resolveBotName = (ch) => ch.botName || '(이름 없음)'
  const resolveLauncherName = (id) =>
    loadLauncherList().find((l) => l.id === id)?.name ?? '(삭제됨)'

  return (
    <div className="cc">
      <div className="cc__header">
        <Typography variant="title-2" weight="bold" as="h1">
          챗봇 채널 목록
        </Typography>
        <Button variant="solid" color="primary" size="medium" label="채널 만들기" onClick={openCreate} />
      </div>

      {list.length === 0 ? (
        <div className="cc__empty">
          <Typography variant="body-1-normal" color="var(--color-label-alternative)" as="div">
            아직 만든 채널이 없어요. 채널을 만들어 챗봇을 외부에 연결해 보세요.
          </Typography>
        </div>
      ) : (
        <div className="cc__grid">
          {list.map((ch) => (
            <button
              key={ch.id}
              type="button"
              className="cc__card"
              onClick={() => setDetailTarget(ch)}
            >
              <div className="cc__card-top">
                <ContentBadge size="small" color="var(--color-accent-fg-cyan)">
                  {channelTypeLabel(ch.type)}
                </ContentBadge>
              </div>
              <Typography variant="headline-2" weight="semibold" as="span">
                {ch.name}
              </Typography>
              <div className="cc__card-meta">
                <Typography variant="caption-1" color="var(--color-label-alternative)" as="span">
                  사용 챗봇 / <span style={{ color: 'var(--color-label-normal)' }}>{resolveBotName(ch)}</span>
                </Typography>
                <Typography variant="caption-1" color="var(--color-label-alternative)" as="span">
                  사용 설정 / <span style={{ color: 'var(--color-label-normal)' }}>{resolveLauncherName(ch.launcherId)}</span>
                </Typography>
                <Typography variant="caption-1" color="var(--color-label-alternative)" as="span">
                  채팅 상담 / <span style={{ color: 'var(--color-label-normal)' }}>{ch.consultingEnabled ? 'ON' : 'OFF'}</span>
                </Typography>
              </div>
              <div className="cc__card-meta">
                <Typography variant="caption-1" color="var(--color-label-alternative)" as="span">
                  생성일 / <span style={{ color: 'var(--color-label-neutral)' }}>{formatDate(ch.createdAt)}</span>
                </Typography>
              </div>
              <div className="cc__card-actions">
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="삭제"
                  className="cc__card-action cc__card-action--delete"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteTarget(ch)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      setDeleteTarget(ch)
                    }
                  }}
                >
                  <Icon name="trash" size={14} />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 만들기 모달 */}
      {createOpen && (
        <div className="cc__backdrop" onClick={(e) => e.target === e.currentTarget && setCreateOpen(false)}>
          <div className="cc__modal" role="dialog" aria-modal="true" aria-labelledby="cc-create-title" ref={dialogRef} tabIndex={-1}>
            <div className="cc__modal-head">
              <Typography variant="headline-2" weight="semibold" as="span" id="cc-create-title">
                채널 만들기
              </Typography>
              <IconButtonNormal icon={<Icon name="close" size={18} />} size="small" aria-label="닫기" onClick={() => setCreateOpen(false)} />
            </div>
            <div className="cc__modal-body">
              <Textfield
                heading="채널명"
                required
                placeholder="예: 홈페이지 상담 채널"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (createError) setCreateError('')
                }}
                status={createError ? 'negative' : 'normal'}
                description={createError || undefined}
              />

              <div className="cc__field">
                <span className="cc__field-label">사용 챗봇</span>
                <MenuSelect
                  placeholder={botOptions.length ? '챗봇을 선택해 주세요' : '먼저 챗봇을 만들어 주세요'}
                  value={botId}
                  onChange={setBotId}
                  options={botOptions}
                  disabled={botOptions.length === 0}
                />
              </div>

              <div className="cc__field">
                <span className="cc__field-label">사용 설정</span>
                <MenuSelect
                  placeholder="챗봇 설정을 선택해 주세요"
                  value={launcherId}
                  onChange={setLauncherId}
                  options={launcherOptions}
                />
              </div>

              <div className="cc__switch-row">
                <span className="cc__field-label">채팅 상담 여부</span>
                <Switch active={consulting} onChange={() => setConsulting((v) => !v)} />
              </div>
            </div>
            <div className="cc__modal-foot">
              <Button variant="outlined" color="assistive" size="medium" label="취소" onClick={() => setCreateOpen(false)} />
              <Button variant="solid" color="primary" size="medium" label="만들기" onClick={submitCreate} disabled={!canSubmit} />
            </div>
          </div>
        </div>
      )}

      {/* 상세 모달 */}
      {detailTarget && (
        <div className="cc__backdrop" onClick={(e) => e.target === e.currentTarget && setDetailTarget(null)}>
          <div className="cc__modal" role="dialog" aria-modal="true" aria-labelledby="cc-detail-title" ref={dialogRef} tabIndex={-1}>
            <div className="cc__modal-head">
              <Typography variant="headline-2" weight="semibold" as="span" id="cc-detail-title">
                채널 상세
              </Typography>
              <IconButtonNormal icon={<Icon name="close" size={18} />} size="small" aria-label="닫기" onClick={() => setDetailTarget(null)} />
            </div>
            <div className="cc__modal-body">
              <div className="cc__detail">
                <div className="cc__detail-row">
                  <span className="cc__detail-label">채널명</span>
                  <span className="cc__detail-value">{detailTarget.name}</span>
                </div>
                <div className="cc__detail-row">
                  <span className="cc__detail-label">채널 유형</span>
                  <span className="cc__detail-value">{channelTypeLabel(detailTarget.type)}</span>
                </div>
                <div className="cc__detail-row">
                  <span className="cc__detail-label">사용 챗봇</span>
                  <span className="cc__detail-value">{resolveBotName(detailTarget)}</span>
                </div>
                <div className="cc__detail-row">
                  <span className="cc__detail-label">사용 설정</span>
                  <span className="cc__detail-value">{resolveLauncherName(detailTarget.launcherId)}</span>
                </div>
                <div className="cc__detail-row">
                  <span className="cc__detail-label">채팅 상담 여부</span>
                  <span className="cc__detail-value">{detailTarget.consultingEnabled ? 'ON' : 'OFF'}</span>
                </div>
                <div className="cc__detail-row">
                  <span className="cc__detail-label">생성일</span>
                  <span className="cc__detail-value">{formatDate(detailTarget.createdAt)}</span>
                </div>
                <div className="cc__detail-row">
                  <span className="cc__detail-label">대화방 호출 URL</span>
                  <CopyRow value={channelChatUrl(detailTarget.botId)} onCopied={() => showToast('호출 URL을 복사했어요.')} />
                </div>
                <div className="cc__detail-row">
                  <span className="cc__detail-label">대화방 호출 HTML</span>
                  <CopyRow value={channelEmbedHtml(detailTarget.botId)} onCopied={() => showToast('호출 HTML을 복사했어요.')} />
                </div>
              </div>
            </div>
            <div className="cc__modal-foot">
              <Button variant="solid" color="primary" size="medium" label="확인" onClick={() => setDetailTarget(null)} />
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 */}
      {deleteTarget && (
        <div className="cc__alert-backdrop" onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}>
          <Alert
            platform="web"
            title="채널을 삭제할까요?"
            body={`'${deleteTarget.name}' 채널이 사라집니다.`}
            primaryAction={{ label: '삭제', variant: 'negative', onClick: confirmDelete }}
            secondaryAction={{ label: '취소', onClick: () => setDeleteTarget(null) }}
          />
        </div>
      )}

      {toast && (
        <div className="cc__toast">
          <Snackbar
            message={toast}
            icon={<Icon name="circleCheckFill" size={20} color="var(--color-status-positive)" />}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </div>
  )
}
