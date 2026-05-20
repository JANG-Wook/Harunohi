// 대시보드 페이지 — 봇 목록 + 봇 생성 모달
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../design-system/components/Button/Button.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import IconButtonNormal from '../design-system/components/IconButton/IconButtonNormal.jsx'
import Textfield from '../design-system/components/Textfield/Textfield.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import './DashboardPage.css'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [botName, setBotName] = useState('')

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
    </div>
  )
}
