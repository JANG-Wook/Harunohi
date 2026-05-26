// 대시보드 페이지 — 봇 목록 + 봇 생성 모달
// localStorage 의 harunohi.bot.* 키들을 스캔해 저장된 봇을 카드로 노출.

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '../design-system/components/Alert/Alert.jsx'
import Button from '../design-system/components/Button/Button.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import IconButtonNormal from '../design-system/components/IconButton/IconButtonNormal.jsx'
import Snackbar from '../design-system/components/Snackbar/Snackbar.jsx'
import Textfield from '../design-system/components/Textfield/Textfield.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import './DashboardPage.css'

const STORAGE_PREFIX = 'harunohi.bot.'
const TOAST_DURATION = 2400

/** ISO 문자열 → "2026.05.23 14:30" 형식 */
function formatDate(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** localStorage 에서 저장된 봇 목록을 읽어옴 */
function loadBotList() {
  if (typeof window === 'undefined') return []
  const list = []
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i)
    if (!key?.startsWith(STORAGE_PREFIX)) continue
    const botId = key.slice(STORAGE_PREFIX.length)
    try {
      const raw = window.localStorage.getItem(key)
      const parsed = JSON.parse(raw)
      // 신규 포맷(versions[].scenarios[].responses[]) + 중간 포맷(versions[].steps[]) + 레거시(steps[]) 모두 지원
      const activeVersion = Array.isArray(parsed?.versions)
        ? parsed.versions.find((v) => v.id === parsed.currentVersionId) ?? parsed.versions[0]
        : null
      let responseCount = 0
      if (Array.isArray(activeVersion?.scenarios)) {
        // 시나리오별 응답 수 합산
        for (const sc of activeVersion.scenarios) {
          if (Array.isArray(sc?.responses)) responseCount += sc.responses.length
        }
      } else if (Array.isArray(activeVersion?.steps)) {
        responseCount = activeVersion.steps.length
      } else if (Array.isArray(parsed?.steps)) {
        responseCount = parsed.steps.length
      }
      // 생성일/수정일 — versions[] 의 savedAt 최소·최대값. 레거시 포맷에는 정보가 없어 null.
      let createdAt = null
      let updatedAt = null
      if (Array.isArray(parsed?.versions) && parsed.versions.length > 0) {
        const times = parsed.versions
          .map((v) => v?.savedAt)
          .filter(Boolean)
          .sort()
        createdAt = times[0] ?? null
        updatedAt = times[times.length - 1] ?? null
      }
      list.push({
        id: botId,
        name: decodeURIComponent(botId),
        responseCount,
        status: parsed?.status === 'active' ? 'active' : 'draft',
        createdAt,
        updatedAt,
      })
    } catch {
      // 손상된 항목은 무시
    }
  }
  // 이름 가나다순
  list.sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  return list
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [botName, setBotName] = useState('')
  const [nameError, setNameError] = useState('')

  /* 대시보드 진입 시 봇 목록 로드. modalOpen 이 false 로 닫히면 재로드해서 갓 생성된 봇 반영 */
  const [bots, setBots] = useState(() => loadBotList())
  useEffect(() => {
    setBots(loadBotList())
  }, [modalOpen])

  /* 삭제 확인 다이얼로그 — null 이면 닫힘, 객체면 그 봇을 삭제 후보로 표시 */
  const [deleteTarget, setDeleteTarget] = useState(null)

  /* 이름 변경 모달 — null 이면 닫힘, 객체면 그 봇 이름을 수정 중 */
  const [renameTarget, setRenameTarget] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [renameError, setRenameError] = useState('')

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

  const submitBot = () => {
    const trimmed = botName.trim()
    if (!trimmed) return
    // 이름 중복 체크 — 저장 키가 디코딩된 봇 이름(useParams 디코딩 결과)이라 trimmed 그대로 검사
    if (window.localStorage.getItem(STORAGE_PREFIX + trimmed)) {
      setNameError('이미 사용 중인 봇 이름입니다.')
      return
    }
    setModalOpen(false)
    // URL 은 인코딩해 안전하게 전달 (라우터가 디코딩해서 useParams 로 전달)
    navigate(`/app/bots/${encodeURIComponent(trimmed)}/canvas`)
  }

  /* 입력값이 바뀌면 이전 에러 클리어 */
  const handleNameChange = (e) => {
    setBotName(e.target.value)
    if (nameError) setNameError('')
  }

  const handleDelete = (botId) => {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(STORAGE_PREFIX + botId)
    setBots(loadBotList())
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
  const submitRename = () => {
    if (!renameTarget) return
    const trimmed = renameValue.trim()
    if (!trimmed) return
    if (trimmed === renameTarget.name) {
      closeRename()
      return
    }
    // 저장 키가 디코딩된 이름이라 trimmed 그대로 검사
    if (window.localStorage.getItem(STORAGE_PREFIX + trimmed)) {
      setRenameError('이미 사용 중인 봇 이름입니다.')
      return
    }
    const oldKey = STORAGE_PREFIX + renameTarget.id
    const raw = window.localStorage.getItem(oldKey)
    if (raw == null) {
      // 데이터가 사라진 경우 — 안전하게 모달만 닫기
      closeRename()
      return
    }
    window.localStorage.setItem(STORAGE_PREFIX + trimmed, raw)
    window.localStorage.removeItem(oldKey)
    closeRename()
    setBots(loadBotList())
    showToast(`'${trimmed}' 봇으로 이름이 변경되었습니다`)
  }
  const handleRenameChange = (e) => {
    setRenameValue(e.target.value)
    if (renameError) setRenameError('')
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    const name = deleteTarget.name
    handleDelete(deleteTarget.id)
    setDeleteTarget(null)
    showToast(`'${name}' 봇이 삭제되었습니다`)
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
          봇 목록
        </Typography>
        <Button
          variant="solid"
          color="primary"
          size="medium"
          label="봇 만들기"
          onClick={openModal}
        />
      </div>

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
                <Typography variant="caption-1" color="var(--color-label-assistive)" as="span">
                  응답 {bot.responseCount}개
                </Typography>
              </div>
              {/* 최초 생성일 / 마지막 수정일 — versions[] 의 savedAt 기준 */}
              <div className="dashboard__card-dates">
                <Typography variant="caption-1" color="var(--color-label-assistive)" as="span">
                  최초 생성일 {formatDate(bot.createdAt)}
                </Typography>
                <Typography variant="caption-1" color="var(--color-label-assistive)" as="span">
                  마지막 수정일 {formatDate(bot.updatedAt)}
                </Typography>
              </div>
              {/* 호버 시 우측 상단 액션 버튼들 — DS 에 24px 타이트 아이콘 버튼이 없어 토큰으로 직접 구현 */}
              <div className="dashboard__card-actions">
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="봇 이름 변경"
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

        <button
          type="button"
          className="dashboard__card dashboard__card--ghost"
          onClick={openModal}
        >
          <Typography variant="headline-2" weight="semibold" as="span">
            봇 만들기
          </Typography>
        </button>
      </div>

      {modalOpen && (
        <div
          className="dashboard__modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          <div className="dashboard__modal" role="dialog" aria-modal="true">
            <header className="dashboard__modal-head">
              <Typography variant="headline-1" weight="semibold" as="span">
                봇 만들기
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
                heading="봇 이름"
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

      {/* 삭제 확인 다이얼로그 — HailMary Alert 컴포넌트 + 자체 backdrop */}
      {deleteTarget && (
        <div
          className="dashboard__modal-backdrop"
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
          <div className="dashboard__modal" role="dialog" aria-modal="true">
            <header className="dashboard__modal-head">
              <Typography variant="headline-1" weight="semibold" as="span">
                봇 이름 변경
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
                heading="봇 이름"
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
