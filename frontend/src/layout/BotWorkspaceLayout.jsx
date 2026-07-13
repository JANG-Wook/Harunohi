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
import SaveVersionModal from '../settings/SaveVersionModal.jsx'
import VersionManagerModal from '../settings/VersionManagerModal.jsx'
import MenuSelect from '../canvas/MenuSelect.jsx'
import { useTheme } from '../lib/useTheme.js'
import { loadLauncher, DEFAULT_LAUNCHER_ID } from '../lib/launcherConfig.js'
import { resolveChatUi } from '../lib/chatUiStyle.js'
import { getBot, patchBot } from '../lib/botApi.js'
import './BotWorkspaceLayout.css'

const TOAST_DURATION = 2400

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
  const [incomplete, setIncomplete] = useState(false)
  const [botStatus, setBotStatus] = useState('draft')
  const saverRef = useRef(null)
  const versionLoaderRef = useRef(null)
  const publisherRef = useRef(null)
  const versionActionsRef = useRef(null)
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
  const registerVersionActions = useCallback((fns) => {
    versionActionsRef.current = fns
  }, [])
  const registerSimulatorPayload = useCallback((fn) => {
    simulatorPayloadRef.current = fn
  }, [])

  /* 시뮬레이터 모달 상태 + 열 때 현재 봇의 시나리오/변수/등록 API 스냅샷 */
  const [simulatorOpen, setSimulatorOpen] = useState(false)
  const [simulatorScenarios, setSimulatorScenarios] = useState([])
  const [simulatorVariables, setSimulatorVariables] = useState([])
  const [simulatorApis, setSimulatorApis] = useState([])
  /* 적용된 챗봇 설정(런처)의 대화방 UI — 시뮬레이터 ChatRoom 에 동일 스킨 적용 */
  const [simulatorLauncherUi, setSimulatorLauncherUi] = useState(null)
  const handleOpenSimulator = useCallback(() => {
    const payload = simulatorPayloadRef.current?.()
    // 구포맷(scenarios 만 반환) 호환을 위해 형태 분기
    if (Array.isArray(payload)) {
      setSimulatorScenarios(payload)
      setSimulatorVariables([])
      setSimulatorApis([])
      setSimulatorLauncherUi(null)
    } else {
      setSimulatorScenarios(payload?.scenarios ?? [])
      setSimulatorVariables(payload?.variables ?? [])
      setSimulatorApis(payload?.apis ?? [])
      const launcher = loadLauncher(payload?.appliedLauncherId ?? DEFAULT_LAUNCHER_ID) ?? loadLauncher(DEFAULT_LAUNCHER_ID)
      setSimulatorLauncherUi(launcher?.config ? resolveChatUi(launcher.config) : null)
    }
    setSimulatorOpen(true)
  }, [])

  /* 버전 정보 — 자식(BotCanvasPage)이 보고하는 버전 목록/현재/배포 id */
  const [versionInfo, setVersionInfoState] = useState({ versions: [], currentVersionId: null, deployedVersionId: null })
  const setVersionInfo = useCallback((info) => {
    setVersionInfoState(info ?? { versions: [], currentVersionId: null, deployedVersionId: null })
  }, [])
  /* 버전 저장 모달 + 버전 관리 모달 + 미저장 변경 상태에서 버전 전환 확인 */
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [versionManagerOpen, setVersionManagerOpen] = useState(false)
  const [pendingVersionId, setPendingVersionId] = useState(null)

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

  /* 저장 — 버전명/설명을 받기 위해 모달을 연다 */
  const handleSave = useCallback(() => setSaveModalOpen(true), [])

  const handleVersionSubmit = useCallback(
    async ({ name, description }) => {
      setSaveModalOpen(false)
      const ok = await saverRef.current?.({ name, description })
      showToast(ok ? `'${name}' 버전으로 저장되었습니다` : '저장에 실패했습니다')
    },
    [showToast],
  )

  /* 버전 전환 — 미저장 변경이 있으면 확인 후 전환 */
  const applyVersion = useCallback((versionId) => {
    versionLoaderRef.current?.(versionId)
  }, [])
  const handleSelectVersion = useCallback(
    (versionId) => {
      if (versionId === versionInfo.currentVersionId) return
      if (isDirty) setPendingVersionId(versionId)
      else applyVersion(versionId)
    },
    [versionInfo.currentVersionId, isDirty, applyVersion],
  )

  const handlePublish = useCallback(async () => {
    const ok = await publisherRef.current?.()
    showToast(ok ? '배포되었습니다' : '배포에 실패했습니다')
  }, [showToast])

  const handleBack = useCallback(() => {
    if (isDirty) setConfirmLeaveOpen(true)
    else navigate('/app/bots')
  }, [isDirty, navigate])

  /* 봇 이름 인라인 편집 — 이름은 서버에서 로드하고, 변경은 patchBot(라우트=publicId 는 불변) */
  const [botName, setBotName] = useState('')
  const [nameDraft, setNameDraft] = useState('')
  const [editingName, setEditingName] = useState(false)
  const skipCommitRef = useRef(false) // Esc 취소 시 blur 커밋 방지
  useEffect(() => {
    let alive = true
    getBot(botId)
      .then((bot) => { if (alive) { setBotName(bot.name); setNameDraft(bot.name) } })
      .catch(() => {})
    return () => { alive = false }
  }, [botId])

  const startRename = () => {
    setNameDraft(botName)
    setEditingName(true)
  }
  const cancelRename = () => {
    skipCommitRef.current = true
    setNameDraft(botName)
    setEditingName(false)
  }

  const commitRename = useCallback(async () => {
    setEditingName(false)
    if (skipCommitRef.current) {
      skipCommitRef.current = false
      return
    }
    const trimmed = nameDraft.trim()
    if (!trimmed || trimmed === botName) {
      setNameDraft(botName)
      return
    }
    try {
      await patchBot(botId, { name: trimmed })
      setBotName(trimmed)
      setNameDraft(trimmed)
      showToast(`'${trimmed}' 로 이름을 변경했어요`)
    } catch (e) {
      setNameDraft(botName)
      showToast(e?.message ?? '이름 변경에 실패했습니다')
    }
  }, [nameDraft, botName, botId, showToast])

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
      setIncomplete,
      registerSaver,
      registerVersionLoader,
      setVersionInfo,
      registerPublisher,
      registerVersionActions,
      registerSimulatorPayload,
      setBotStatus,
    }),
    [
      registerSaver,
      registerVersionLoader,
      setVersionInfo,
      registerPublisher,
      registerVersionActions,
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

        {/* 중앙 — 버전 드롭다운(최신이 위) + 버전 관리 버튼 */}
        <div className="bot-workspace__center">
          {versionInfo.versions.length > 0 && (
            <>
              <div className="bot-workspace__version-select">
                <MenuSelect
                  value={versionInfo.currentVersionId}
                  onChange={handleSelectVersion}
                  options={versionInfo.versions.map((v) => ({ value: v.id, label: v.name })).reverse()}
                  placeholder="버전 선택"
                  size="small"
                />
              </div>
              <Button
                variant="outlined"
                color="assistive"
                size="small"
                label="버전 관리"
                onClick={() => setVersionManagerOpen(true)}
              />
            </>
          )}
        </div>

        {/* 우측 — (미완성 안내) + 다크모드 + 시뮬레이터 + 저장 */}
        <div className="bot-workspace__actions">
          {incomplete && (
            <span className="bot-workspace__save-hint">
              <Icon name="triangleExclamationFill" size={16} color="var(--color-accent-fg-red)" />
              비어 있는 항목이 있어 저장할 수 없어요
            </span>
          )}
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
            disabled={!isDirty || incomplete}
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

      {/* 버전 저장 모달 — 버전명/설명 입력 */}
      <SaveVersionModal
        open={saveModalOpen}
        versions={versionInfo.versions}
        onSubmit={handleVersionSubmit}
        onClose={() => setSaveModalOpen(false)}
      />

      {/* 버전 관리 모달 — 이름 변경 / 삭제 */}
      <VersionManagerModal
        open={versionManagerOpen}
        versions={versionInfo.versions}
        currentVersionId={versionInfo.currentVersionId}
        deployedVersionId={versionInfo.deployedVersionId}
        onEdit={(versionId, meta) => versionActionsRef.current?.edit?.(versionId, meta)}
        onDelete={(versionId) => versionActionsRef.current?.delete?.(versionId)}
        onClose={() => setVersionManagerOpen(false)}
        canEdit={false}
      />

      {/* 버전 전환 확인 — 미저장 변경이 있을 때 */}
      {pendingVersionId && (
        <div
          className="bot-workspace__modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPendingVersionId(null)
          }}
        >
          <Alert
            platform="web"
            title="저장하지 않은 변경 사항이 있어요"
            body="다른 버전으로 전환하면 저장하지 않은 변경 내용이 사라집니다. 전환할까요?"
            primaryAction={{
              label: '전환',
              variant: 'negative',
              onClick: () => {
                applyVersion(pendingVersionId)
                setPendingVersionId(null)
              },
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

      {/* 시뮬레이터 모달 — Phase 1 (단일 메시지 + 버튼 클릭 흐름) */}
      <SimulatorModal
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        scenarios={simulatorScenarios}
        variables={simulatorVariables}
        apis={simulatorApis}
        botName={botName}
        launcherUi={simulatorLauncherUi}
      />
    </div>
  )
}
