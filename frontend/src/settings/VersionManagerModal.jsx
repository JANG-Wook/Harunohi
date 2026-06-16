// 버전 관리 모달 — 버전 목록에서 이름 변경 / 삭제. 런처·봇 공용(부모가 onRename/onDelete 제공).

import { useEffect, useRef, useState } from 'react'
import Alert from '../design-system/components/Alert/Alert.jsx'
import Button from '../design-system/components/Button/Button.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import IconButtonNormal from '../design-system/components/IconButton/IconButtonNormal.jsx'
import Textfield from '../design-system/components/Textfield/Textfield.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import './VersionManagerModal.css'

export default function VersionManagerModal({
  open,
  versions = [],
  currentVersionId,
  deployedVersionId,
  onRename,
  onDelete,
  onClose,
}) {
  const [editingId, setEditingId] = useState(null)
  const [draftName, setDraftName] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const dialogRef = useRef(null)

  // Esc 닫기 + 배경 스크롤 잠금
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  // 닫히면 편집/확인 상태 초기화
  useEffect(() => {
    if (!open) {
      setEditingId(null)
      setConfirmDeleteId(null)
    }
  }, [open])

  if (!open) return null

  const rows = [...versions].reverse() // 최신이 위
  const canDelete = versions.length > 1
  const deletingVersion = versions.find((v) => v.id === confirmDeleteId) ?? null

  const trimmed = draftName.trim()
  const duplicate = versions.some((v) => v.name === trimmed && v.id !== editingId)
  const nameError = duplicate ? '이미 사용 중인 버전명이에요.' : ''
  const canCommit = !!trimmed && !duplicate

  const startEdit = (v) => {
    setConfirmDeleteId(null)
    setEditingId(v.id)
    setDraftName(v.name)
  }
  const commitEdit = () => {
    if (!canCommit) return
    onRename(editingId, trimmed)
    setEditingId(null)
  }

  return (
    <>
    <div
      className="vmm__backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="vmm__modal" role="dialog" aria-modal="true" aria-labelledby="vmm-title" ref={dialogRef} tabIndex={-1}>
        <header className="vmm__head">
          <Typography variant="headline-1" weight="semibold" as="span" id="vmm-title">
            버전 관리
          </Typography>
          <IconButtonNormal icon={<Icon name="close" size={18} />} size="small" onClick={onClose} aria-label="닫기" />
        </header>

        <div className="vmm__body">
          {rows.map((v) => {
            const isEditing = editingId === v.id
            return (
              <div className="vmm__row" key={v.id}>
                {isEditing ? (
                  <div className="vmm__edit">
                    <Textfield
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      status={nameError ? 'negative' : 'normal'}
                      description={nameError}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitEdit()
                        else if (e.key === 'Escape') setEditingId(null)
                      }}
                    />
                    <div className="vmm__edit-actions">
                      <Button variant="outlined" color="assistive" size="small" label="취소" onClick={() => setEditingId(null)} />
                      <Button variant="solid" color="primary" size="small" label="저장" disabled={!canCommit} onClick={commitEdit} />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="vmm__info">
                      <div className="vmm__info-head">
                        <span className="vmm__name">{v.name}</span>
                        {v.id === currentVersionId && <span className="vmm__badge vmm__badge--current">현재</span>}
                        {v.id === deployedVersionId && <span className="vmm__badge vmm__badge--deployed">배포</span>}
                      </div>
                      {v.description ? <p className="vmm__desc">{v.description}</p> : null}
                    </div>
                    <div className="vmm__actions">
                      <IconButtonNormal icon={<Icon name="pencil" size={16} />} size="small" onClick={() => startEdit(v)} aria-label="이름 변경" />
                      <IconButtonNormal
                        icon={<Icon name="trash" size={16} />}
                        size="small"
                        disabled={!canDelete}
                        onClick={() => setConfirmDeleteId(v.id)}
                        aria-label="삭제"
                      />
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        <footer className="vmm__foot">
          <Button variant="outlined" color="assistive" size="medium" label="닫기" onClick={onClose} />
        </footer>
      </div>
    </div>

    {/* 삭제 확인 — 별도 Alert 다이얼로그 */}
    {deletingVersion && (
      <div
        className="vmm__alert-backdrop"
        onClick={(e) => {
          if (e.target === e.currentTarget) setConfirmDeleteId(null)
        }}
      >
        <Alert
          platform="web"
          title="버전을 삭제하시겠어요?"
          body={`'${deletingVersion.name}' 버전이 삭제됩니다. 되돌릴 수 없어요.`}
          primaryAction={{
            label: '삭제',
            variant: 'negative',
            onClick: () => {
              onDelete(deletingVersion.id)
              setConfirmDeleteId(null)
            },
          }}
          secondaryAction={{ label: '취소', onClick: () => setConfirmDeleteId(null) }}
        />
      </div>
    )}
    </>
  )
}
