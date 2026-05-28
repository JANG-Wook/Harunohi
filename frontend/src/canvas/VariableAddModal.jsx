// 변수 등록/편집 모달 — API 편집 모달과 동일 패턴 (draft + 푸터 + 등록/저장 + 편집 모드 삭제)
//
// Props.
//   variable: 초기 데이터 (신규면 빈 기본값, 편집이면 기존 변수 객체)
//   isNew: 신규 등록 vs 편집 모드
//   existing: 다른 변수 목록 (중복 검사용 — 자기 자신 제외 필요)
//   onSubmit(payload): 등록/저장 시 호출. 부모가 bot.variables 에 반영
//   onClose(): 모달 닫기 (draft 폐기)
//   onDelete(): 편집 모드에서만 호출됨

import { useEffect, useState } from 'react'
import Button from '../design-system/components/Button/Button.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import IconButtonNormal from '../design-system/components/IconButton/IconButtonNormal.jsx'
import Textfield from '../design-system/components/Textfield/Textfield.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import './VariableAddModal.css'

export default function VariableAddModal({
  variable,
  isNew = false,
  existing = [],
  onSubmit,
  onClose,
  onDelete,
}) {
  const [originalKey, setOriginalKey] = useState(variable?.originalKey ?? '')
  const [displayName, setDisplayName] = useState(variable?.displayName ?? '')
  const [sampleValue, setSampleValue] = useState(variable?.sampleValue ?? '')
  const [error, setError] = useState('')

  /* Esc 닫기 + 배경 스크롤 잠금 */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const handleOriginalChange = (e) => {
    setOriginalKey(e.target.value)
    if (error) setError('')
  }
  const handleDisplayChange = (e) => {
    setDisplayName(e.target.value)
    if (error) setError('')
  }

  const handleSubmit = () => {
    const ok = originalKey.trim()
    const dn = displayName.trim()
    if (!ok) {
      setError('변수 키를 입력해주세요.')
      return
    }
    // 중복 검사 — 자기 자신은 제외 (편집 모드)
    const collision = existing.some((v) => {
      if (variable?.id && v.id === variable.id) return false
      return (
        v.originalKey === ok ||
        (v.displayName && v.displayName === ok) ||
        (dn && (v.originalKey === dn || v.displayName === dn))
      )
    })
    if (collision) {
      setError('이미 사용 중인 변수 이름입니다.')
      return
    }
    onSubmit({ originalKey: ok, displayName: dn, sampleValue })
  }

  return (
    <div
      className="var-modal__backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="var-modal" role="dialog" aria-modal="true">
        <header className="var-modal__head">
          <Typography variant="headline-1" weight="semibold" as="span">
            {isNew ? '변수 등록' : '변수 편집'}
          </Typography>
          <IconButtonNormal
            icon={<Icon name="close" size={18} />}
            onClick={onClose}
            aria-label="닫기"
          />
        </header>

        <div className="var-modal__body">
          <Textfield
            heading="변수 키"
            required
            placeholder="예: memberName"
            value={originalKey}
            onChange={handleOriginalChange}
            description="API 응답이나 폼의 원본 키. 영문/숫자 권장."
            status={error ? 'negative' : 'normal'}
            autoFocus
          />
          <Textfield
            heading="표시 이름 (옵션)"
            placeholder="예: 회원명"
            value={displayName}
            onChange={handleDisplayChange}
            description="한글 별명을 지정하면 메시지에서 {{$회원명}} 같이 부를 수 있어요."
          />
          <Textfield
            heading="샘플 값 (옵션)"
            placeholder="예: 홍길동"
            value={sampleValue}
            onChange={(e) => setSampleValue(e.target.value)}
            description="시뮬레이터 미리보기에서 변수 위치에 들어갈 값."
          />
          {error && (
            <Typography variant="label-1-normal" color="var(--color-status-negative)" as="div">
              {error}
            </Typography>
          )}
        </div>

        {/* 푸터 — 좌측: 삭제(편집 모드만) / 우측: 취소 + 등록/저장 (ApiEditModal 패턴) */}
        <footer className="var-modal__foot">
          <div className="var-modal__foot-left">
            {!isNew && onDelete && (
              <Button
                variant="outlined"
                color="negative"
                size="medium"
                label="삭제"
                leadingIcon={<Icon name="trash" size={16} />}
                onClick={onDelete}
              />
            )}
          </div>
          <div className="var-modal__foot-right">
            <Button
              variant="outlined"
              color="assistive"
              size="medium"
              label="취소"
              onClick={onClose}
            />
            <Button
              variant="solid"
              color="primary"
              size="medium"
              label={isNew ? '등록' : '저장'}
              disabled={!originalKey.trim()}
              onClick={handleSubmit}
            />
          </div>
        </footer>
      </div>
    </div>
  )
}
