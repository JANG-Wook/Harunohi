// 변수 추가 모달 — DS 에 폼 모달이 없어 토큰 + DS 컴포넌트로 직접 구현.
//
// 입력: originalKey (필수), displayName (옵션, 한글 별명), sampleValue (시뮬레이터 미리보기용).
// 검증: originalKey 가 비어있지 않고, 다른 변수의 originalKey/displayName 과 중복되지 않을 것.

import { useEffect, useState } from 'react'
import Button from '../design-system/components/Button/Button.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import IconButtonNormal from '../design-system/components/IconButton/IconButtonNormal.jsx'
import Textfield from '../design-system/components/Textfield/Textfield.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import './VariableAddModal.css'

export default function VariableAddModal({ existing = [], onSubmit, onCancel }) {
  const [originalKey, setOriginalKey] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [sampleValue, setSampleValue] = useState('')
  const [error, setError] = useState('')

  /* Esc 닫기 + 배경 스크롤 잠금 */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel()
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [onCancel])

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
    // 중복 검사 — originalKey 또는 displayName 이 기존 변수와 충돌
    const collision = existing.some(
      (v) => v.originalKey === ok || (v.displayName && v.displayName === ok) ||
        (dn && (v.originalKey === dn || v.displayName === dn)),
    )
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
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="var-modal" role="dialog" aria-modal="true">
        <header className="var-modal__head">
          <Typography variant="headline-1" weight="semibold" as="span">
            변수 추가
          </Typography>
          <IconButtonNormal
            icon={<Icon name="close" size={18} />}
            onClick={onCancel}
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
            <Typography variant="caption-1" color="var(--color-status-negative)" as="div">
              {error}
            </Typography>
          )}
        </div>

        <footer className="var-modal__foot">
          <Button variant="outlined" color="assistive" size="medium" label="취소" onClick={onCancel} />
          <Button
            variant="solid"
            color="primary"
            size="medium"
            label="추가"
            disabled={!originalKey.trim()}
            onClick={handleSubmit}
          />
        </footer>
      </div>
    </div>
  )
}
