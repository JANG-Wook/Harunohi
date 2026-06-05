// 색상 선택 필드 — 현재 색 스와치 + hex 입력 + 네이티브 컬러 피커.
// 선택값은 사용자 데이터(고객사 브랜드 색)라 스와치/미리보기에 inline style 로 적용한다.
// 컴포넌트 chrome(레이아웃·테두리 등)은 모두 디자인 토큰을 사용.

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

  const handleHexInput = (e) => {
    const next = normalizeHex(e.target.value)
    if (next) onChange(next)
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
        value={current}
        onChange={handleHexInput}
        disabled={disabled}
        maxLength={7}
        spellCheck={false}
        placeholder="#000000"
        aria-label="HEX 색상값"
      />
    </div>
  )
}
