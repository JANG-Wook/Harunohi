// 입력 폼 값 정규화 — 폼 유형별로 일관된 문자열로 변환해 메모리에 저장.
//
// 사용자가 다양한 표기(010-1234-1234, 01012341234 등)로 입력해도
// 메모리에 들어가는 값은 한 가지 표준 형식이 되도록 정규화한다.
//
// 정규화 실패해도 빈 문자열 반환 (사용자 결정 — 학습용이라 차단 안 함).

/** YYYY-MM-DD 형식 패딩 헬퍼 */
function pad2(n) {
  return String(n).padStart(2, '0')
}

/** Date 객체 → YYYY-MM-DD */
function formatDate(d) {
  if (!d) return ''
  const date = d instanceof Date ? d : new Date(d)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

/** Time 객체 또는 'HH:mm' 문자열 → HH:mm */
function formatTime(t) {
  if (!t) return ''
  if (typeof t === 'string') return t
  if (t instanceof Date) {
    return `${pad2(t.getHours())}:${pad2(t.getMinutes())}`
  }
  if (t.hour != null) {
    return `${pad2(t.hour)}:${pad2(t.minute ?? 0)}`
  }
  return ''
}

/** options 배열에서 id → label 매핑 */
function labelOf(options, id) {
  const opt = (options ?? []).find((o) => o.id === id)
  return opt?.label ?? ''
}

/**
 * 폼 유형 + 사용자 입력 raw 값 → 정규화된 문자열.
 *
 * raw 의 형태는 유형마다 다름.
 *   - text계열: 문자열
 *   - date: Date 객체 또는 null
 *   - datetime: { date, time } 객체 또는 null
 *   - dateRange: { start, end } 또는 [start, end]
 *   - select/checkbox 단일/boolean: 선택된 option id (number) 또는 null
 *   - select/checkbox 복수: id 배열
 */
export function normalizeFormValue(type, raw, options = []) {
  if (raw == null) return ''

  switch (type) {
    case 'textfield':
    case 'textarea': {
      return String(raw).trim()
    }
    case 'phone': {
      // 숫자만 추출 — 하이픈/공백/+/() 등 제거
      return String(raw).replace(/\D/g, '')
    }
    case 'email': {
      return String(raw).trim().toLowerCase()
    }
    case 'url': {
      const v = String(raw).trim()
      if (!v) return ''
      // scheme 누락 시 https:// 자동 부착
      if (/^https?:\/\//i.test(v)) return v
      return `https://${v}`
    }
    case 'number': {
      // 콤마 제거 후 숫자로
      const v = String(raw).replace(/,/g, '').trim()
      if (v === '') return ''
      const n = Number(v)
      return Number.isFinite(n) ? String(n) : ''
    }
    case 'date': {
      return formatDate(raw)
    }
    case 'datetime': {
      const d = formatDate(raw?.date)
      const t = formatTime(raw?.time)
      if (!d && !t) return ''
      if (!t) return d
      return `${d}T${t}`
    }
    case 'dateRange': {
      // {start, end} 또는 [start, end] 모두 처리
      const start = formatDate(raw?.start ?? raw?.[0])
      const end = formatDate(raw?.end ?? raw?.[1])
      if (!start && !end) return ''
      if (!end) return start
      if (!start) return end
      return `${start} ~ ${end}`
    }
    case 'selectSingle':
    case 'checkboxSingle':
    case 'boolean': {
      // raw 는 id (또는 [id] 배열)
      const id = Array.isArray(raw) ? raw[0] : raw
      return labelOf(options, id)
    }
    case 'selectMulti':
    case 'checkboxMulti': {
      const ids = Array.isArray(raw) ? raw : [raw]
      return ids.map((id) => labelOf(options, id)).filter(Boolean).join(', ')
    }
    default:
      return String(raw ?? '').trim()
  }
}

/**
 * 폼 유형별 초기 빈 값 — BotMessage 에서 useState 초기화에 사용.
 */
export function initialFormValueFor(type) {
  switch (type) {
    case 'textfield':
    case 'textarea':
    case 'phone':
    case 'email':
    case 'url':
    case 'number':
      return ''
    case 'date':
    case 'datetime':
    case 'dateRange':
      return null
    case 'selectMulti':
    case 'checkboxMulti':
      return []
    case 'selectSingle':
    case 'checkboxSingle':
    case 'boolean':
      return null
    default:
      return null
  }
}
