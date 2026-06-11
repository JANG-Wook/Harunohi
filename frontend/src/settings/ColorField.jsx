// 색상 선택 필드 — 현재 색 스와치 + hex 입력 + 네이티브 컬러 피커.
// 선택값은 사용자 데이터(고객사 브랜드 색)라 스와치/미리보기에 inline style 로 적용한다.
// 컴포넌트 chrome(레이아웃·테두리 등)은 모두 디자인 토큰을 사용.

import { useEffect, useState } from 'react'
import './ColorField.css'

/** #RGB / #RRGGBB 형태로 정규화. 유효하지 않으면 null */
function normalizeHex(raw) {
  if (typeof raw !== 'string') return null
  let v = raw.trim()
  if (!v.startsWith('#')) v = `#${v}`
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    // #abc → #aabbcc
    return `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`.toUpperCase()
  }
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toUpperCase()
  return null
}

export default function ColorField({ value, onChange, disabled = false }) {
  const current = (value || '').toUpperCase()
  const isValid = /^#[0-9a-fA-F]{6}$/.test(current)

  // hex 입력은 드래프트로 자유 입력 — 매 키마다 즉시 검증/커밋하면 중간값이 되돌려져 타이핑 불가.
  // 유효하면 즉시 커밋, blur 때 무효면 직전 값으로 복귀. 외부 값 변경 시 드래프트 동기화.
  const [draft, setDraft] = useState(current)
  useEffect(() => {
    setDraft(current)
  }, [current])

  const handleHexInput = (e) => {
    const raw = e.target.value
    setDraft(raw)
    // 타이핑 중에는 6자리 완성 시에만 커밋 — 3자리 약식(#abc)은 blur 때 확장(6자리 입력을 막지 않도록)
    const v = raw.trim().startsWith('#') ? raw.trim() : `#${raw.trim()}`
    if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v.toUpperCase())
  }

  const handleHexBlur = () => {
    const next = normalizeHex(draft)
    if (next) onChange(next)
    else setDraft(current)
  }

  return (
    <div className={['color-field', disabled && 'color-field--disabled'].filter(Boolean).join(' ')}>
      {/* 네이티브 컬러 피커 — 현재 색 스와치 겸 클릭 시 색 선택 */}
      <label className="color-field__picker" style={{ background: isValid ? current : '#FFFFFF' }}>
        <input
          type="color"
          value={isValid ? current : '#FFFFFF'}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          disabled={disabled}
          aria-label="색상 선택"
        />
      </label>
      <input
        type="text"
        className="color-field__hex"
        value={draft}
        onChange={handleHexInput}
        onBlur={handleHexBlur}
        disabled={disabled}
        maxLength={7}
        spellCheck={false}
        placeholder="#000000"
        aria-label="HEX 색상값"
      />
    </div>
  )
}
