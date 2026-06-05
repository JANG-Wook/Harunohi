// 플로팅 런처 버튼 — 디자인 버전 목록 페이지.
// 봇 목록과 동일한 카드 그리드 패턴. 만들기(이름 모달) → 에디터 진입, 카드 클릭 → 수정, 호버 액션으로 이름변경/삭제.

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '../design-system/components/Alert/Alert.jsx'
import Button from '../design-system/components/Button/Button.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import IconButtonNormal from '../design-system/components/IconButton/IconButtonNormal.jsx'
import Snackbar from '../design-system/components/Snackbar/Snackbar.jsx'
import Textfield from '../design-system/components/Textfield/Textfield.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import LauncherButtonPreview from './LauncherButtonPreview.jsx'
import {
  DEFAULT_LAUNCHER_ID,
  defaultLauncherConfig,
  deleteLauncher,
  ensureDefaultLauncher,
  isLauncherNameTaken,
  loadLauncherList,
  saveLauncher,
} from '../lib/launcherConfig.js'
import './LauncherListPage.css'

const TOAST_DURATION = 2400

/** ISO → "2026.05.29 09:51" */
function formatDate(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

function newId() {
  return `l_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export default function LauncherListPage() {
  const navigate = useNavigate()
  const [list, setList] = useState(() => {
    ensureDefaultLauncher(new Date().toISOString())
    return loadLauncherList()
  })
  const reload = () => setList(loadLauncherList())

  // 생성 모달
  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createError, setCreateError] = useState('')

  // 이름 변경 모달
  const [renameTarget, setRenameTarget] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [renameError, setRenameError] = useState('')

  // 삭제 확인
  const [deleteTarget, setDeleteTarget] = useState(null)

  // 토스트
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const showToast = (msg) => {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), TOAST_DURATION)
  }
  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  /* 생성 — 이름 모달 → 기본 설정으로 엔트리 만들고 에디터 진입 */
  const openCreate = () => {
    setCreateName('')
    setCreateError('')
    setCreateOpen(true)
  }
  const submitCreate = () => {
    const trimmed = createName.trim()
    if (!trimmed) return
    if (isLauncherNameTaken(trimmed)) {
      setCreateError('이미 사용 중인 이름이에요.')
      return
    }
    const id = newId()
    saveLauncher({ id, name: trimmed, config: defaultLauncherConfig(), nowIso: new Date().toISOString() })
    setCreateOpen(false)
    navigate(`/app/chatbot-ui/launcher/${id}`)
  }

  /* 이름 변경 */
  const openRename = (entry) => {
    setRenameTarget(entry)
    setRenameValue(entry.name)
    setRenameError('')
  }
  const submitRename = () => {
    if (!renameTarget) return
    const trimmed = renameValue.trim()
    if (!trimmed) return
    if (trimmed === renameTarget.name) {
      setRenameTarget(null)
      return
    }
    if (isLauncherNameTaken(trimmed, renameTarget.id)) {
      setRenameError('이미 사용 중인 이름이에요.')
      return
    }
    saveLauncher({
      id: renameTarget.id,
      name: trimmed,
      config: renameTarget.config,
      nowIso: new Date().toISOString(),
    })
    setRenameTarget(null)
    reload()
    showToast(`'${trimmed}' 로 이름을 변경했어요.`)
  }

  /* 삭제 */
  const confirmDelete = () => {
    if (!deleteTarget) return
    const name = deleteTarget.name
    deleteLauncher(deleteTarget.id)
    setDeleteTarget(null)
    reload()
    showToast(`'${name}' 을(를) 삭제했어요.`)
  }

  // 모달 Esc/Enter + 스크롤 잠금
  useEffect(() => {
    const anyOpen = createOpen || renameTarget || deleteTarget
    if (!anyOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setCreateOpen(false)
        setRenameTarget(null)
        setDeleteTarget(null)
      }
      if (e.key === 'Enter') {
        if (createOpen && createName.trim()) submitCreate()
        else if (renameTarget && renameValue.trim()) submitRename()
      }
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createOpen, renameTarget, deleteTarget, createName, renameValue])

  return (
    <div className="lc">
      <div className="lc__header">
        <Typography variant="title-2" weight="bold" as="h1">
          플로팅 런처 버튼
        </Typography>
        <Button variant="solid" color="primary" size="medium" label="런처 버튼 만들기" onClick={openCreate} />
      </div>

      <div className="lc__grid">
        {list.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className="lc__card"
            onClick={() => navigate(`/app/chatbot-ui/launcher/${entry.id}`)}
          >
            <div className="lc__card-preview">
              <LauncherButtonPreview config={entry.config} compact buttonOnly />
            </div>
            <Typography variant="headline-2" weight="semibold" as="span">
              {entry.name}
            </Typography>
            <div className="lc__card-dates">
              <Typography variant="caption-1" color="var(--color-label-assistive)" as="span">
                최초 생성일 {formatDate(entry.createdAt)}
              </Typography>
              <Typography variant="caption-1" color="var(--color-label-assistive)" as="span">
                마지막 수정일 {formatDate(entry.updatedAt)}
              </Typography>
            </div>
            <div className="lc__card-actions">
              <span
                role="button"
                tabIndex={0}
                aria-label="이름 변경"
                className="lc__card-action lc__card-action--edit"
                onClick={(e) => {
                  e.stopPropagation()
                  openRename(entry)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    e.stopPropagation()
                    openRename(entry)
                  }
                }}
              >
                <Icon name="pencil" size={14} />
              </span>
              {entry.id !== DEFAULT_LAUNCHER_ID && (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="삭제"
                  className="lc__card-action lc__card-action--delete"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteTarget(entry)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      setDeleteTarget(entry)
                    }
                  }}
                >
                  <Icon name="trash" size={14} />
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* 생성 모달 */}
      {createOpen && (
        <div className="lc__backdrop" onClick={(e) => e.target === e.currentTarget && setCreateOpen(false)}>
          <div className="lc__modal" role="dialog" aria-modal="true">
            <div className="lc__modal-head">
              <Typography variant="headline-2" weight="semibold" as="span">
                런처 버튼 만들기
              </Typography>
              <IconButtonNormal icon={<Icon name="close" size={18} />} size="small" onClick={() => setCreateOpen(false)} />
            </div>
            <div className="lc__modal-body">
              <Textfield
                heading="이름"
                required
                placeholder="예: 기본 런처, 이벤트용 핑크 런처"
                value={createName}
                onChange={(e) => {
                  setCreateName(e.target.value)
                  if (createError) setCreateError('')
                }}
                status={createError ? 'negative' : 'normal'}
                description={createError || undefined}
              />
            </div>
            <div className="lc__modal-foot">
              <Button variant="outlined" color="assistive" size="medium" label="취소" onClick={() => setCreateOpen(false)} />
              <Button variant="solid" color="primary" size="medium" label="만들기" onClick={submitCreate} disabled={!createName.trim()} />
            </div>
          </div>
        </div>
      )}

      {/* 이름 변경 모달 */}
      {renameTarget && (
        <div className="lc__backdrop" onClick={(e) => e.target === e.currentTarget && setRenameTarget(null)}>
          <div className="lc__modal" role="dialog" aria-modal="true">
            <div className="lc__modal-head">
              <Typography variant="headline-2" weight="semibold" as="span">
                이름 변경
              </Typography>
              <IconButtonNormal icon={<Icon name="close" size={18} />} size="small" onClick={() => setRenameTarget(null)} />
            </div>
            <div className="lc__modal-body">
              <Textfield
                heading="이름"
                required
                value={renameValue}
                onChange={(e) => {
                  setRenameValue(e.target.value)
                  if (renameError) setRenameError('')
                }}
                status={renameError ? 'negative' : 'normal'}
                description={renameError || undefined}
              />
            </div>
            <div className="lc__modal-foot">
              <Button variant="outlined" color="assistive" size="medium" label="취소" onClick={() => setRenameTarget(null)} />
              <Button variant="solid" color="primary" size="medium" label="저장" onClick={submitRename} disabled={!renameValue.trim()} />
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 — DS Alert */}
      {deleteTarget && (
        <div className="lc__backdrop" onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}>
          <Alert
            platform="web"
            title="런처 버튼을 삭제할까요?"
            body={`'${deleteTarget.name}' 의 저장된 디자인이 사라집니다.`}
            primaryAction={{ label: '삭제', variant: 'negative', onClick: confirmDelete }}
            secondaryAction={{ label: '취소', onClick: () => setDeleteTarget(null) }}
          />
        </div>
      )}

      {toast && (
        <div className="lc__toast">
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
