// 봇 작업 화면 레이아웃 — 탑바(뒤로가기, 봇명, 버전 셀렉터, 저장/시뮬레이터/발행) + 본문(Outlet)
// 자식 페이지가 outlet context 로 saver 등록 · 버전 정보 보고 · loader 등록을 한다.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import Alert from '../design-system/components/Alert/Alert.jsx'
import Button from '../design-system/components/Button/Button.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import IconButtonNormal from '../design-system/components/IconButton/IconButtonNormal.jsx'
import IconButtonOutlined from '../design-system/components/IconButton/IconButtonOutlined.jsx'
import Snackbar from '../design-system/components/Snackbar/Snackbar.jsx'
import SimulatorModal from '../simulator/SimulatorModal.jsx'
import { useTheme } from '../lib/useTheme.js'
import './BotWorkspaceLayout.css'

const TOAST_DURATION = 2400
const STORAGE_PREFIX = 'harunohi.bot.'

/** 이름 입력 너비 추정 — 한글 등 전각 문자는 약 2배 폭. 시각 폭(ch) 기준 floor 16 */
function nameInputCh(s) {
  let w = 0
  for (const ch of s) {
    w += /[ᄀ-ᇿ⺀-鿿　-〿㄰-㆏가-힣＀-￯]/.test(ch) ? 2 : 1
  }
  return Math.max(w, 16) + 2
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
  const simulatorPayloadRef = useRef(null)
  const registerSaver = useCallback((fn) => {
    saverRef.current = fn
  }, [])
  const registerVersionLoader = useCallback((fn) => {
    versionLoaderRef.current = fn
  }, [])
  const registerPublisher = useCallback((fn) => {
    publisherRef.current = fn
  }, [])
  const registerSimulatorPayload = useCallback((fn) => {
    simulatorPayloadRef.current = fn
  }, [])

  /* 시뮬레이터 모달 상태 + 열 때 현재 봇의 시나리오/변수/등록 API 스냅샷 */
  const [simulatorOpen, setSimulatorOpen] = useState(false)
  const [simulatorScenarios, setSimulatorScenarios] = useState([])
  const [simulatorVariables, setSimulatorVariables] = useState([])
  const [simulatorApis, setSimulatorApis] = useState([])
  const handleOpenSimulator = useCallback(() => {
    const payload = simulatorPayloadRef.current?.()
    // 구포맷(scenarios 만 반환) 호환을 위해 형태 분기
    if (Array.isArray(payload)) {
      setSimulatorScenarios(payload)
      setSimulatorVariables([])
      setSimulatorApis([])
    } else {
      setSimulatorScenarios(payload?.scenarios ?? [])
      setSimulatorVariables(payload?.variables ?? [])
      setSimulatorApis(payload?.apis ?? [])
    }
    setSimulatorOpen(true)
  }, [])

  /* 버전 정보 — 상단바 UI 제거됨. 자식(BotCanvasPage) 계약 유지를 위해 no-op 으로 둔다. */
  const setVersionInfo = useCallback(() => {}, [])

  /* 다이얼로그 상태 — 이탈 가드 + 토스트 */
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false)
  const [toast, setToast] = useState(null) // null 이면 닫힘, string 이면 표시
  const toastTimerRef = useRef(null)

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
    if (ok) showToast('배포되었습니다')
  }, [showToast])

  const handleBack = useCallback(() => {
    if (isDirty) setConfirmLeaveOpen(true)
    else navigate('/app/bots')
  }, [isDirty, navigate])

  /* 봇 이름 인라인 편집 — 저장 키가 곧 이름이라, 커밋 시 키를 이동하고 새 URL 로 replace.
     (BotCanvasPage 는 botId 변경에도 리마운트되지 않아 편집 중 상태는 보존된다) */
  const botName = decodeURIComponent(botId ?? '')
  const [nameDraft, setNameDraft] = useState(botName)
  const [editingName, setEditingName] = useState(false)
  const skipCommitRef = useRef(false) // Esc 취소 시 blur 커밋 방지
  useEffect(() => {
    setNameDraft(decodeURIComponent(botId ?? ''))
  }, [botId])

  const startRename = () => {
    setNameDraft(decodeURIComponent(botId ?? ''))
    setEditingName(true)
  }
  const cancelRename = () => {
    skipCommitRef.current = true
    setNameDraft(decodeURIComponent(botId ?? ''))
    setEditingName(false)
  }

  const commitRename = useCallback(() => {
    setEditingName(false)
    if (skipCommitRef.current) {
      skipCommitRef.current = false
      return
    }
    const trimmed = nameDraft.trim()
    const current = decodeURIComponent(botId ?? '')
    if (!trimmed || trimmed === current) {
      setNameDraft(current)
      return
    }
    if (window.localStorage.getItem(STORAGE_PREFIX + trimmed)) {
      showToast('이미 사용 중인 챗봇 이름입니다')
      setNameDraft(current)
      return
    }
    const raw = window.localStorage.getItem(STORAGE_PREFIX + current)
    if (raw == null) {
      setNameDraft(current)
      return
    }
    window.localStorage.setItem(STORAGE_PREFIX + trimmed, raw)
    window.localStorage.removeItem(STORAGE_PREFIX + current)
    navigate(`/app/bots/${encodeURIComponent(trimmed)}/canvas`, { replace: true })
    showToast(`'${trimmed}' 로 이름을 변경했어요`)
  }, [nameDraft, botId, navigate, showToast])

  const handleConfirmLeave = useCallback(() => {
    setConfirmLeaveOpen(false)
    navigate('/app/bots')
  }, [navigate])

  /* 이탈 가드 다이얼로그 열림 시 Esc 키 + 배경 스크롤 잠금 */
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

  const outletCtx = useMemo(
    () => ({
      setDirty,
      registerSaver,
      registerVersionLoader,
      setVersionInfo,
      registerPublisher,
      registerSimulatorPayload,
      setBotStatus,
    }),
    [
      registerSaver,
      registerVersionLoader,
      setVersionInfo,
      registerPublisher,
      registerSimulatorPayload,
    ],
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
          {editingName ? (
            <input
              type="text"
              className="bot-workspace__name-input"
              style={{ width: `${nameInputCh(nameDraft)}ch` }}
              value={nameDraft}
              autoFocus
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur()
                else if (e.key === 'Escape') cancelRename()
              }}
              aria-label="챗봇 이름"
            />
          ) : (
            <span className="bot-workspace__name">
              <span className="bot-workspace__name-text">{botName}</span>
              <button
                type="button"
                className="bot-workspace__name-edit-btn"
                aria-label="이름 변경"
                onClick={startRename}
              >
                <Icon name="pencil" size={14} />
              </button>
            </span>
          )}
          {isDirty && (
            <span className="bot-workspace__dirty-dot" aria-label="저장되지 않은 변경 사항">
              •
            </span>
          )}
        </div>

        {/* 중앙 — 비움(그리드 정렬 유지용). 배포 버튼은 일단 제거 */}
        <div className="bot-workspace__center" />

        {/* 우측 — 다크모드 + 시뮬레이터 + 저장 */}
        <div className="bot-workspace__actions">
          <IconButtonOutlined
            icon={<Icon name={isDark ? 'sun' : 'moon'} size={18} />}
            size="small"
            onClick={toggleTheme}
            aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
          />
          <Button
            variant="outlined"
            color="assistive"
            size="small"
            label="시뮬레이터"
            onClick={handleOpenSimulator}
          />
          <Button
            variant="solid"
            color="primary"
            size="small"
            label="저장"
            onClick={handleSave}
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

      {/* 시뮬레이터 모달 — Phase 1 (단일 메시지 + 버튼 클릭 흐름) */}
      <SimulatorModal
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        scenarios={simulatorScenarios}
        variables={simulatorVariables}
        apis={simulatorApis}
        botName={decodeURIComponent(botId ?? '')}
      />
    </div>
  )
}
