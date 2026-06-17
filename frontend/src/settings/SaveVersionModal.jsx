// 버전 저장 모달 — 버전명 + 설명 입력 후 새 버전으로 저장. 버전명은 런처 내 유일.

import { useEffect, useRef, useState } from 'react'
import Button from '../design-system/components/Button/Button.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import IconButtonNormal from '../design-system/components/IconButton/IconButtonNormal.jsx'
import Textarea from '../design-system/components/Textfield/Textarea.jsx'
import Textfield from '../design-system/components/Textfield/Textfield.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import { isVersionNameTaken } from '../lib/launcherConfig.js'
import './SaveVersionModal.css'

export default function SaveVersionModal({
  open,
  versions = [],
  mode = 'create', // 'create'(새 버전) | 'edit'(버전 정보 수정)
  initialName = '',
  initialDescription = '',
  excludeId = null, // 수정 시 자기 자신은 중복 검사에서 제외
  onSubmit,
  onClose,
}) {
  const isEdit = mode === 'edit'
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const dialogRef = useRef(null)

  // 열릴 때마다 초기화 — 생성: "버전 N+1" 제안, 수정: 기존 값 prefill
  useEffect(() => {
    if (!open) return
    setName(isEdit ? initialName : `버전 ${versions.length + 1}`)
    setDescription(isEdit ? initialDescription : '')
    dialogRef.current?.focus()
  }, [open, isEdit, initialName, initialDescription, versions.length])

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

  if (!open) return null

  const trimmed = name.trim()
  const duplicate = isVersionNameTaken(versions, trimmed, excludeId)
  const error = duplicate ? '이미 사용 중인 버전명이에요.' : ''
  const canSave = !!trimmed && !duplicate

  const submit = () => {
    if (!canSave) return
    onSubmit({ name: trimmed, description: description.trim() })
  }

  return (
    <div
      className="svm__backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="svm__modal" role="dialog" aria-modal="true" aria-labelledby="svm-title" ref={dialogRef} tabIndex={-1}>
        <header className="svm__head">
          <Typography variant="headline-1" weight="semibold" as="span" id="svm-title">
            {isEdit ? '버전 정보 수정' : '새 버전 저장'}
          </Typography>
          <IconButtonNormal icon={<Icon name="close" size={18} />} size="small" onClick={onClose} aria-label="닫기" />
        </header>

        <div className="svm__body">
          <Textfield
            heading="버전명"
            required
            placeholder="예: v1.0 초기 배포"
            value={name}
            onChange={(e) => setName(e.target.value)}
            status={error ? 'negative' : 'normal'}
            description={error}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit()
            }}
          />
          <Textarea
            heading="설명"
            resize="fixed"
            placeholder="이 버전에서 무엇이 바뀌었는지 적어 주세요. (선택)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <footer className="svm__foot">
          <Button variant="outlined" color="assistive" size="medium" label="취소" onClick={onClose} />
          <Button variant="solid" color="primary" size="medium" label={isEdit ? '수정' : '저장'} disabled={!canSave} onClick={submit} />
        </footer>
      </div>
    </div>
  )
}
