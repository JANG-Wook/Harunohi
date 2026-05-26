// 대시보드 페이지 — 봇 목록 + 봇 생성 모달
// localStorage 의 harunohi.bot.* 키들을 스캔해 저장된 봇을 카드로 노출.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '../design-system/components/Alert/Alert.jsx'
import Button from '../design-system/components/Button/Button.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import IconButtonNormal from '../design-system/components/IconButton/IconButtonNormal.jsx'
import Textfield from '../design-system/components/Textfield/Textfield.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import './DashboardPage.css'

const STORAGE_PREFIX = 'harunohi.bot.'

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
      list.push({
        id: botId,
        name: decodeURIComponent(botId),
        stepCount: Array.isArray(parsed?.steps) ? parsed.steps.length : 0,
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

  /* 대시보드 진입 시 봇 목록 로드. modalOpen 이 false 로 닫히면 재로드해서 갓 생성된 봇 반영 */
  const [bots, setBots] = useState(() => loadBotList())
  useEffect(() => {
    setBots(loadBotList())
  }, [modalOpen])

  /* 삭제 확인 다이얼로그 — null 이면 닫힘, 객체면 그 봇을 삭제 후보로 표시 */
  const [deleteTarget, setDeleteTarget] = useState(null)

  const openModal = () => {
    setBotName('')
    setModalOpen(true)
  }

  const closeModal = () => setModalOpen(false)

  const submitBot = () => {
    const trimmed = botName.trim()
    if (!trimmed) return
    setModalOpen(false)
    navigate(`/app/bots/${encodeURIComponent(trimmed)}/canvas`)
  }

  const handleDelete = (botId) => {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(STORAGE_PREFIX + botId)
    setBots(loadBotList())
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    handleDelete(deleteTarget.id)
    setDeleteTarget(null)
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
          leadingIcon={<Icon name="plus" size={16} />}
          label="봇 생성"
          onClick={openModal}
        />
      </div>

      <div className="dashboard__grid">
        {bots.map((bot) => (
          <button
            key={bot.id}
            type="button"
            className="dashboard__card dashboard__card--bot"
            onClick={() => navigate(`/app/bots/${bot.id}/canvas`)}
          >
            <span className="dashboard__card-icon">
              <Icon name="agent" size={24} />
            </span>
            <Typography variant="headline-2" weight="semibold" as="span">
              {bot.name}
            </Typography>
            <Typography variant="caption-1" color="var(--color-label-assistive)" as="span">
              단계 {bot.stepCount}개
            </Typography>
            {/* 호버 시 우측 상단 삭제 버튼 */}
            <span
              role="button"
              tabIndex={0}
              aria-label="봇 삭제"
              className="dashboard__card-delete"
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
          </button>
        ))}

        <button
          type="button"
          className="dashboard__card dashboard__card--ghost"
          onClick={openModal}
        >
          <Icon name="plus" size={24} />
          <Typography variant="headline-2" weight="semibold" as="span">
            봇 생성
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
                새 봇 만들기
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
                onChange={(e) => setBotName(e.target.value)}
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
    </div>
  )
}
