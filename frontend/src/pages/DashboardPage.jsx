// 대시보드 페이지 — 봇 목록 + 봇 생성 모달
// 봇 메타는 서버(워크스페이스 스코프 REST)에서 로드한다. 카드 클릭 시 publicId 로 캔버스 진입.

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '../design-system/components/Alert/Alert.jsx'
import Button from '../design-system/components/Button/Button.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import IconButtonNormal from '../design-system/components/IconButton/IconButtonNormal.jsx'
import Snackbar from '../design-system/components/Snackbar/Snackbar.jsx'
import Textfield from '../design-system/components/Textfield/Textfield.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import { useFocusTrap } from '../lib/useFocusTrap.js'
import { listBots, createBot, deleteBot, patchBot } from '../lib/botApi.js'
import './DashboardPage.css'

const TOAST_DURATION = 2400

/** ISO 문자열 → "2026.05.23 14:30" 형식 */
function formatDate(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 서버 봇 메타 → 대시보드 카드 모델. 버전명/응답수는 버전 API 전환(②-b) 후 보강 예정 */
function toCard(bot) {
  return {
    id: bot.publicId,
    name: bot.name,
    responseCount: null,
    status: bot.status === 'active' ? 'active' : 'draft',
    createdAt: bot.createdAt,
    updatedAt: bot.updatedAt,
    latestVersionName: null,
    deployedVersionName: null,
  }
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [botName, setBotName] = useState('')
  const [nameError, setNameError] = useState('')

  /* 대시보드 진입 시 서버에서 봇 목록 로드 */
  const [bots, setBots] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const refreshBots = async () => {
    try {
      setLoadError('')
      const list = await listBots()
      setBots(list.map(toCard))
    } catch (e) {
      setLoadError(e?.message ?? '봇 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    refreshBots()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* 삭제 확인 다이얼로그 — null 이면 닫힘, 객체면 그 봇을 삭제 후보로 표시 */
  const [deleteTarget, setDeleteTarget] = useState(null)

  /* 이름 변경 모달 — null 이면 닫힘, 객체면 그 봇 이름을 수정 중 */
  const [renameTarget, setRenameTarget] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [renameError, setRenameError] = useState('')

  /* 모달 포커스 트랩 — 생성/이름변경 중 하나만 열림 */
  const dialogRef = useRef(null)
  useFocusTrap(dialogRef, modalOpen || !!renameTarget)

  /* 토스트 — 삭제 성공 시 노출 (BotWorkspaceLayout 저장 토스트와 같은 패턴) */
  const [toast, setToast] = useState(null) // null | string
  const toastTimerRef = useRef(null)
  const showToast = (message) => {
    setToast(message)
    window.clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => setToast(null), TOAST_DURATION)
  }
  useEffect(() => () => window.clearTimeout(toastTimerRef.current), [])

  const openModal = () => {
    setBotName('')
    setNameError('')
    setModalOpen(true)
  }

  const closeModal = () => setModalOpen(false)

  const submitBot = async () => {
    const trimmed = botName.trim()
    if (!trimmed) return
    // 이름 중복 체크 — 서버는 이름 중복을 막지 않으므로 목록 기준으로 소프트 검사
    if (bots.some((b) => b.name === trimmed)) {
      setNameError('이미 사용 중인 챗봇 이름입니다.')
      return
    }
    try {
      const created = await createBot(trimmed)
      setModalOpen(false)
      navigate(`/app/bots/${created.publicId}/canvas`)
    } catch (e) {
      setNameError(e?.message ?? '봇 생성에 실패했습니다.')
    }
  }

  /* 입력값이 바뀌면 이전 에러 클리어 */
  const handleNameChange = (e) => {
    setBotName(e.target.value)
    if (nameError) setNameError('')
  }

  const handleDelete = async (botId) => {
    await deleteBot(botId)
    await refreshBots()
  }

  const openRename = (bot) => {
    setRenameTarget(bot)
    setRenameValue(bot.name)
    setRenameError('')
  }
  const closeRename = () => {
    setRenameTarget(null)
    setRenameError('')
  }
  const submitRename = async () => {
    if (!renameTarget) return
    const trimmed = renameValue.trim()
    if (!trimmed) return
    if (trimmed === renameTarget.name) {
      closeRename()
      return
    }
    if (bots.some((b) => b.name === trimmed && b.id !== renameTarget.id)) {
      setRenameError('이미 사용 중인 챗봇 이름입니다.')
      return
    }
    try {
      await patchBot(renameTarget.id, { name: trimmed })
      closeRename()
      await refreshBots()
      showToast(`'${trimmed}' 봇으로 이름이 변경되었습니다`)
    } catch (e) {
      setRenameError(e?.message ?? '이름 변경에 실패했습니다.')
    }
  }
  const handleRenameChange = (e) => {
    setRenameValue(e.target.value)
    if (renameError) setRenameError('')
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const name = deleteTarget.name
    setDeleteTarget(null)
    try {
      await handleDelete(deleteTarget.id)
      showToast(`'${name}' 봇이 삭제되었습니다`)
    } catch (e) {
      showToast(e?.message ?? '삭제에 실패했습니다.')
    }
  }

  // Esc 닫기 + 모달 열림 시 배경 스크롤 잠금
  useEffect(() => {
    if (!modalOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeModal()
      if (e.key === 'Enter' && botName.trim()) submitBot()
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [modalOpen, botName])

  // 삭제 확인 다이얼로그 — Esc 로 닫기 + 배경 스크롤 잠금
  useEffect(() => {
    if (!deleteTarget) return
    const onKey = (e) => {
      if (e.key === 'Escape') setDeleteTarget(null)
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [deleteTarget])

  // 이름 변경 모달 — Esc 닫기, Enter 제출, 배경 스크롤 잠금
  useEffect(() => {
    if (!renameTarget) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeRename()
      if (e.key === 'Enter' && renameValue.trim()) submitRename()
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renameTarget, renameValue])

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <Typography variant="title-2" weight="bold" as="h1">
          챗봇 목록
        </Typography>
        <Button
          variant="solid"
          color="primary"
          size="medium"
          label="챗봇 만들기"
          onClick={openModal}
        />
      </div>

      {loading || loadError ? (
        <div className="dashboard__empty">
          <Typography variant="body-1-normal" color="var(--color-label-alternative)" as="div">
            {loadError || '봇 목록을 불러오는 중입니다...'}
          </Typography>
        </div>
      ) : bots.length === 0 ? (
        <div className="dashboard__empty">
          <Typography variant="body-1-normal" color="var(--color-label-alternative)" as="div">
            아직 만든 챗봇이 없어요. 챗봇을 만들어 대화 흐름을 설계해 보세요.
          </Typography>
        </div>
      ) : (
      <div className="dashboard__grid">
        {bots.map((bot) => {
          const isActive = bot.status === 'active'
          // 상태별 색상 — draft 는 cautionary(주황), active 는 positive(녹색)
          const statusColor = isActive
            ? 'var(--color-status-positive)'
            : 'var(--color-status-cautionary)'
          const statusLabel = isActive ? '운영 중' : '초안'
          return (
            <button
              key={bot.id}
              type="button"
              className="dashboard__card dashboard__card--bot"
              onClick={() => navigate(`/app/bots/${encodeURIComponent(bot.id)}/canvas`)}
            >
              <span className="dashboard__card-icon" style={{ color: statusColor }}>
                <Icon name="agent" size={24} />
              </span>
              <Typography variant="headline-2" weight="semibold" as="span">
                {bot.name}
              </Typography>
              <div className="dashboard__card-meta">
                {/* 상태 배지 — DS Chip 은 색 variant 가 없어 토큰으로 직접 구현 */}
                <span
                  className="dashboard__card-status"
                  style={{
                    color: statusColor,
                    background: `color-mix(in srgb, ${statusColor} 12%, transparent)`,
                  }}
                >
                  {statusLabel}
                </span>
                {bot.responseCount != null && (
                  <Typography variant="caption-1" color="var(--color-label-alternative)" as="span">
                    응답 {bot.responseCount}개
                  </Typography>
                )}
              </div>
              {/* 최신 버전 / 배포 버전 */}
              <div className="dashboard__card-versions">
                <Typography variant="caption-1" color="var(--color-label-alternative)" as="span">
                  최신 버전 / <span style={{ color: 'var(--color-label-normal)' }}>{bot.latestVersionName ?? '—'}</span>
                </Typography>
                <Typography variant="caption-1" color="var(--color-label-alternative)" as="span">
                  배포 버전 / <span style={{ color: 'var(--color-label-normal)' }}>{bot.deployedVersionName ?? '미배포'}</span>
                </Typography>
              </div>
              {/* 최초 생성일 / 마지막 수정일 — versions[] 의 savedAt 기준 */}
              <div className="dashboard__card-dates">
                <Typography variant="caption-1" color="var(--color-label-alternative)" as="span">
                  최초 생성일 / <span style={{ color: 'var(--color-label-neutral)' }}>{formatDate(bot.createdAt)}</span>
                </Typography>
                <Typography variant="caption-1" color="var(--color-label-alternative)" as="span">
                  마지막 수정일 / <span style={{ color: 'var(--color-label-neutral)' }}>{formatDate(bot.updatedAt)}</span>
                </Typography>
              </div>
              {/* 호버 시 우측 상단 액션 버튼들 — DS 에 24px 타이트 아이콘 버튼이 없어 토큰으로 직접 구현 */}
              <div className="dashboard__card-actions">
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="챗봇 이름 변경"
                  className="dashboard__card-action dashboard__card-action--edit"
                  onClick={(e) => {
                    e.stopPropagation()
                    openRename(bot)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      openRename(bot)
                    }
                  }}
                >
                  <Icon name="pencil" size={14} />
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="봇 삭제"
                  className="dashboard__card-action dashboard__card-action--delete"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteTarget(bot)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      setDeleteTarget(bot)
                    }
                  }}
                >
                  <Icon name="close" size={14} />
                </span>
              </div>
            </button>
          )
        })}
      </div>
      )}

      {modalOpen && (
        <div
          className="dashboard__modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          <div className="dashboard__modal" role="dialog" aria-modal="true" aria-labelledby="dashboard-create-title" ref={dialogRef} tabIndex={-1}>
            <header className="dashboard__modal-head">
              <Typography variant="headline-1" weight="semibold" as="span" id="dashboard-create-title">
                챗봇 만들기
              </Typography>
              <IconButtonNormal
                icon={<Icon name="close" size={18} />}
                size="small"
                onClick={closeModal}
                aria-label="닫기"
              />
            </header>

            <div className="dashboard__modal-body">
              <Textfield
                heading="챗봇 이름"
                required
                placeholder="예: AS 신청봇"
                value={botName}
                onChange={handleNameChange}
                status={nameError ? 'negative' : 'normal'}
                description={nameError}
                autoFocus
              />
            </div>

            <footer className="dashboard__modal-foot">
              <Button
                variant="outlined"
                color="assistive"
                size="medium"
                label="취소"
                onClick={closeModal}
              />
              <Button
                variant="solid"
                color="primary"
                size="medium"
                label="만들기"
                disabled={!botName.trim()}
                onClick={submitBot}
              />
            </footer>
          </div>
        </div>
      )}

      {/* 삭제 확인 다이얼로그 — Alert 가 자체 dimmer+카드를 그리므로 bare 래퍼 */}
      {deleteTarget && (
        <div
          className="dashboard__alert-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteTarget(null)
          }}
        >
          <Alert
            platform="web"
            title="봇을 삭제하시겠어요?"
            body={`'${deleteTarget.name}' 봇의 저장된 내용이 모두 사라집니다.`}
            primaryAction={{ label: '삭제', variant: 'negative', onClick: confirmDelete }}
            secondaryAction={{ label: '취소', onClick: () => setDeleteTarget(null) }}
          />
        </div>
      )}

      {/* 이름 변경 모달 — 생성 모달과 동일 패턴 */}
      {renameTarget && (
        <div
          className="dashboard__modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeRename()
          }}
        >
          <div className="dashboard__modal" role="dialog" aria-modal="true" aria-labelledby="dashboard-rename-title" ref={dialogRef} tabIndex={-1}>
            <header className="dashboard__modal-head">
              <Typography variant="headline-1" weight="semibold" as="span" id="dashboard-rename-title">
                챗봇 이름 변경
              </Typography>
              <IconButtonNormal
                icon={<Icon name="close" size={18} />}
                size="small"
                onClick={closeRename}
                aria-label="닫기"
              />
            </header>

            <div className="dashboard__modal-body">
              <Textfield
                heading="챗봇 이름"
                required
                placeholder="예: AS 신청봇"
                value={renameValue}
                onChange={handleRenameChange}
                status={renameError ? 'negative' : 'normal'}
                description={renameError}
                autoFocus
              />
            </div>

            <footer className="dashboard__modal-foot">
              <Button
                variant="outlined"
                color="assistive"
                size="medium"
                label="취소"
                onClick={closeRename}
              />
              <Button
                variant="solid"
                color="primary"
                size="medium"
                label="변경"
                disabled={!renameValue.trim()}
                onClick={submitRename}
              />
            </footer>
          </div>
        </div>
      )}

      {/* 삭제 성공 토스트 — Snackbar 자체엔 자동 dismiss 없어 setTimeout 으로 처리 */}
      {toast && (
        <div className="dashboard__toast">
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
