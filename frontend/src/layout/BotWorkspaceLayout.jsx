// 봇 작업 화면 레이아웃 — 탑바(뒤로가기, 봇명, 저장/시뮬레이터/발행) + 본문(Outlet)
// 자식 페이지가 outlet context 로 saver 등록과 dirty 보고를 한다.

import { useCallback, useEffect, useRef, useState } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import Button from '../design-system/components/Button/Button.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import IconButtonNormal from '../design-system/components/IconButton/IconButtonNormal.jsx'
import Snackbar from '../design-system/components/Snackbar/Snackbar.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import './BotWorkspaceLayout.css'

const TOAST_DURATION = 2400

export default function BotWorkspaceLayout() {
  const navigate = useNavigate()
  const { botId } = useParams()

  /* 자식(BotCanvasPage)이 보고하는 dirty 상태와 등록하는 save 함수 */
  const [isDirty, setDirty] = useState(false)
  const saverRef = useRef(null)
  const registerSaver = useCallback((fn) => {
    saverRef.current = fn
  }, [])

  /* 이탈 가드 모달 + 저장 성공 토스트 상태 */
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const toastTimerRef = useRef(null)

  const showSavedToast = useCallback(() => {
    setToastOpen(true)
    window.clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => setToastOpen(false), TOAST_DURATION)
  }, [])

  useEffect(() => () => window.clearTimeout(toastTimerRef.current), [])

  const handleSave = useCallback(() => {
    const ok = saverRef.current?.()
    if (ok) showSavedToast()
  }, [showSavedToast])

  const handleBack = useCallback(() => {
    if (isDirty) setConfirmLeaveOpen(true)
    else navigate('/app/bots')
  }, [isDirty, navigate])

  const handleConfirmLeave = useCallback(() => {
    setConfirmLeaveOpen(false)
    navigate('/app/bots')
  }, [navigate])

  /* Esc 로 모달 닫기 + 모달 열림 시 배경 스크롤 잠금 */
  useEffect(() => {
    if (!confirmLeaveOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setConfirmLeaveOpen(false)
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [confirmLeaveOpen])

  return (
    <div className="bot-workspace">
      <header className="bot-workspace__topbar">
        <div className="bot-workspace__left">
          <IconButtonNormal
            icon={<Icon name="chevronLeft" size={20} />}
            onClick={handleBack}
            aria-label="뒤로가기"
          />
          <Typography variant="heading-2" weight="semibold" as="span">
            {decodeURIComponent(botId ?? '')}
          </Typography>
          {isDirty && (
            <span className="bot-workspace__dirty-dot" aria-label="저장되지 않은 변경 사항">
              •
            </span>
          )}
        </div>

        <div className="bot-workspace__actions">
          <Button
            variant="outlined"
            color="assistive"
            size="small"
            label="저장"
            onClick={handleSave}
          />
          <Button
            variant="outlined"
            color="assistive"
            size="small"
            leadingIcon={<Icon name="play" size={16} />}
            label="시뮬레이터"
          />
          <Button variant="solid" color="primary" size="small" label="발행" />
        </div>
      </header>

      <main className="bot-workspace__body">
        <Outlet context={{ setDirty, registerSaver }} />
      </main>

      {/* 이탈 가드 모달 — DS 에 폼 모달이 없어 토큰으로 직접 구현 (DashboardPage 모달과 동일 패턴) */}
      {confirmLeaveOpen && (
        <div
          className="bot-workspace__modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmLeaveOpen(false)
          }}
        >
          <div className="bot-workspace__modal" role="dialog" aria-modal="true">
            <header className="bot-workspace__modal-head">
              <Typography variant="headline-1" weight="semibold" as="span">
                저장하지 않은 변경 사항이 있어요
              </Typography>
            </header>
            <div className="bot-workspace__modal-body">
              <Typography variant="body-2-reading" color="var(--color-label-alternative)" as="p">
                지금 나가면 변경한 내용이 사라집니다. 정말 나가시겠어요?
              </Typography>
            </div>
            <footer className="bot-workspace__modal-foot">
              <Button
                variant="outlined"
                color="assistive"
                size="medium"
                label="취소"
                onClick={() => setConfirmLeaveOpen(false)}
              />
              <Button
                variant="solid"
                color="primary"
                size="medium"
                label="나가기"
                onClick={handleConfirmLeave}
              />
            </footer>
          </div>
        </div>
      )}

      {/* 저장 성공 토스트 — Snackbar 자체엔 자동 dismiss 가 없어 setTimeout 으로 처리 */}
      {toastOpen && (
        <div className="bot-workspace__toast">
          <Snackbar
            message="저장되었습니다"
            icon={<Icon name="circleCheckFill" size={20} color="var(--color-status-positive)" />}
            onClose={() => setToastOpen(false)}
          />
        </div>
      )}
    </div>
  )
}
