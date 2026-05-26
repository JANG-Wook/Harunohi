// 봇 작업 화면 레이아웃 — 탑바(뒤로가기, 봇명, 버전 셀렉터, 저장/시뮬레이터/발행) + 본문(Outlet)
// 자식 페이지가 outlet context 로 saver 등록 · 버전 정보 보고 · loader 등록을 한다.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import Alert from '../design-system/components/Alert/Alert.jsx'
import Button from '../design-system/components/Button/Button.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import IconButtonNormal from '../design-system/components/IconButton/IconButtonNormal.jsx'
import IconButtonOutlined from '../design-system/components/IconButton/IconButtonOutlined.jsx'
import Menu from '../design-system/components/Menu/Menu.jsx'
import Snackbar from '../design-system/components/Snackbar/Snackbar.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import { useTheme } from '../lib/useTheme.js'
import './BotWorkspaceLayout.css'

const TOAST_DURATION = 2400

/** ISO 문자열 → "2026.05.23 14:30" 형식 */
function formatVersionLabel(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function BotWorkspaceLayout() {
  const navigate = useNavigate()
  const { botId } = useParams()
  const { theme, toggle: toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  /* 자식(BotCanvasPage)이 보고하는 dirty 상태 + 등록하는 save/load/publish 함수 */
  const [isDirty, setDirty] = useState(false)
  const [botStatus, setBotStatus] = useState('draft')
  const saverRef = useRef(null)
  const versionLoaderRef = useRef(null)
  const publisherRef = useRef(null)
  const registerSaver = useCallback((fn) => {
    saverRef.current = fn
  }, [])
  const registerVersionLoader = useCallback((fn) => {
    versionLoaderRef.current = fn
  }, [])
  const registerPublisher = useCallback((fn) => {
    publisherRef.current = fn
  }, [])

  /* 버전 목록 + 현재 선택 (자식에서 보고) */
  const [versions, setVersions] = useState([])
  const [currentVersionId, setCurrentVersionId] = useState(null)
  const setVersionInfo = useCallback((vs, cur) => {
    setVersions(vs)
    setCurrentVersionId(cur)
  }, [])

  /* 다이얼로그 상태 — 이탈 가드 + 버전 변경 가드 + 토스트 */
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false)
  const [pendingVersionId, setPendingVersionId] = useState(null) // null 이면 다이얼로그 닫힘
  const [toast, setToast] = useState(null) // null 이면 닫힘, string 이면 표시
  const toastTimerRef = useRef(null)

  /* 버전 셀렉터 드롭다운 */
  const [versionMenuOpen, setVersionMenuOpen] = useState(false)
  const versionMenuRef = useRef(null)
  useEffect(() => {
    if (!versionMenuOpen) return
    const handler = (e) => {
      if (versionMenuRef.current && !versionMenuRef.current.contains(e.target)) {
        setVersionMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [versionMenuOpen])

  const showToast = useCallback((message) => {
    setToast(message)
    window.clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => setToast(null), TOAST_DURATION)
  }, [])

  useEffect(() => () => window.clearTimeout(toastTimerRef.current), [])

  const handleSave = useCallback(() => {
    const ok = saverRef.current?.()
    if (ok) showToast('저장되었습니다')
  }, [showToast])

  const handlePublish = useCallback(() => {
    const ok = publisherRef.current?.()
    if (ok) showToast('발행되었습니다')
  }, [showToast])

  const handleBack = useCallback(() => {
    if (isDirty) setConfirmLeaveOpen(true)
    else navigate('/app/bots')
  }, [isDirty, navigate])

  const handleConfirmLeave = useCallback(() => {
    setConfirmLeaveOpen(false)
    navigate('/app/bots')
  }, [navigate])

  /* 버전 항목 클릭 — dirty 면 확인 다이얼로그, 아니면 즉시 로드 */
  const handleVersionClick = useCallback(
    (versionId) => {
      setVersionMenuOpen(false)
      if (versionId === currentVersionId) return
      if (isDirty) {
        setPendingVersionId(versionId)
      } else {
        versionLoaderRef.current?.(versionId)
      }
    },
    [currentVersionId, isDirty],
  )

  const handleConfirmVersionLoad = useCallback(() => {
    if (pendingVersionId) versionLoaderRef.current?.(pendingVersionId)
    setPendingVersionId(null)
  }, [pendingVersionId])

  /* 다이얼로그 열림 시 Esc 키 + 배경 스크롤 잠금 */
  useEffect(() => {
    const open = confirmLeaveOpen || pendingVersionId !== null
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setConfirmLeaveOpen(false)
        setPendingVersionId(null)
      }
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [confirmLeaveOpen, pendingVersionId])

  /* 버전 셀렉터 라벨 — 가장 최근 정렬 (savedAt 기준 내림차순) */
  const sortedVersions = useMemo(
    () => [...versions].sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1)),
    [versions],
  )
  const currentVersion = versions.find((v) => v.id === currentVersionId) ?? null
  const versionLabel = currentVersion ? formatVersionLabel(currentVersion.savedAt) : '저장된 버전 없음'

  const outletCtx = useMemo(
    () => ({
      setDirty,
      registerSaver,
      registerVersionLoader,
      setVersionInfo,
      registerPublisher,
      setBotStatus,
    }),
    [registerSaver, registerVersionLoader, setVersionInfo, registerPublisher],
  )

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

        {/* 중앙 — 다크모드 + 버전 셀렉터 + 저장 버튼 */}
        <div className="bot-workspace__center">
          <IconButtonOutlined
            icon={<Icon name={isDark ? 'sun' : 'moon'} size={18} />}
            size="small"
            onClick={toggleTheme}
            aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
          />
          <div className="bot-workspace__version" ref={versionMenuRef}>
            <button
              type="button"
              className="bot-workspace__version-trigger"
              disabled={sortedVersions.length === 0}
              onClick={() => setVersionMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={versionMenuOpen}
            >
              <span className="bot-workspace__version-label">{versionLabel}</span>
              {sortedVersions.length > 0 && <Icon name="chevronDown" size={14} />}
            </button>
            {versionMenuOpen && sortedVersions.length > 0 && (
              <div className="bot-workspace__version-menu">
                <Menu
                  items={sortedVersions.map((v) => ({
                    label: formatVersionLabel(v.savedAt),
                    active: v.id === currentVersionId,
                    onClick: () => handleVersionClick(v.id),
                  }))}
                />
              </div>
            )}
          </div>
          <Button
            variant="outlined"
            color="assistive"
            size="small"
            label="저장"
            onClick={handleSave}
          />
        </div>

        <div className="bot-workspace__actions">
          <Button
            variant="outlined"
            color="assistive"
            size="small"
            leadingIcon={<Icon name="play" size={16} />}
            label="시뮬레이터"
          />
          <Button
            variant="solid"
            color="primary"
            size="small"
            label={botStatus === 'active' ? '운영 중' : '발행'}
            onClick={handlePublish}
          />
        </div>
      </header>

      <main className="bot-workspace__body">
        <Outlet context={outletCtx} />
      </main>

      {/* 이탈 가드 다이얼로그 */}
      {confirmLeaveOpen && (
        <div
          className="bot-workspace__modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmLeaveOpen(false)
          }}
        >
          <Alert
            platform="web"
            title="저장하지 않은 변경 사항이 있어요"
            body="지금 나가면 변경한 내용이 사라집니다. 정말 나가시겠어요?"
            primaryAction={{ label: '나가기', variant: 'negative', onClick: handleConfirmLeave }}
            secondaryAction={{ label: '취소', onClick: () => setConfirmLeaveOpen(false) }}
          />
        </div>
      )}

      {/* 버전 변경 가드 다이얼로그 */}
      {pendingVersionId !== null && (
        <div
          className="bot-workspace__modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPendingVersionId(null)
          }}
        >
          <Alert
            platform="web"
            title="저장하지 않은 변경 사항이 있어요"
            body="다른 버전을 불러오면 지금까지의 변경 사항이 사라집니다. 계속하시겠어요?"
            primaryAction={{
              label: '불러오기',
              variant: 'negative',
              onClick: handleConfirmVersionLoad,
            }}
            secondaryAction={{ label: '취소', onClick: () => setPendingVersionId(null) }}
          />
        </div>
      )}

      {/* 저장/발행 성공 토스트 */}
      {toast && (
        <div className="bot-workspace__toast">
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
