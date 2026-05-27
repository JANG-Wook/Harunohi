// API Request Body 편집기 — 폼 모드(key/value) + JSON 모드 토글.
//
// 외부 props.
//   value: 현재 body 문자열 (api.body)
//   onChange(nextBody): 변경 시 호출 (저장은 항상 JSON 문자열)
//
// 동작.
//   - 초기: body 가 JSON 객체로 파싱되고 모든 값이 원시값(string/number/boolean) 이면 폼 모드, 아니면 JSON 모드.
//   - 폼 모드에서 필드 추가/수정/삭제 → 자동으로 JSON 문자열 재직렬화해 onChange.
//   - JSON 모드 → 폼 모드 전환 시: 파싱 시도. 실패하거나 중첩 구조면 안내 + JSON 모드 유지.
//   - 폼 모드 → JSON 모드 전환은 항상 가능 (현재 폼 필드를 직렬화한 JSON 표시).

import { useEffect, useMemo, useState } from 'react'
import Icon from '../design-system/components/Icon/Icon.jsx'
import IconButtonNormal from '../design-system/components/IconButton/IconButtonNormal.jsx'
import SegmentedControl from '../design-system/components/SegmentedControl/SegmentedControl.jsx'
import TextButton from '../design-system/components/TextButton/TextButton.jsx'
import Textarea from '../design-system/components/Textfield/Textarea.jsx'
import Textfield from '../design-system/components/Textfield/Textfield.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import './ApiBodyEditor.css'

let fieldSeq = 1000
const nextFieldId = () => ++fieldSeq

/** 폼 모드로 표현 가능한지 검사 — top-level 객체 + 모든 값이 원시값 */
function canRepresentAsForm(parsed) {
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return false
  for (const v of Object.values(parsed)) {
    if (v !== null && typeof v === 'object') return false
  }
  return true
}

/** body 문자열 → 폼 필드 배열. 실패하면 null. */
function bodyToFields(body) {
  if (!body || !body.trim()) return []
  try {
    const parsed = JSON.parse(body)
    if (!canRepresentAsForm(parsed)) return null
    return Object.entries(parsed).map(([k, v]) => ({
      id: nextFieldId(),
      key: k,
      value: v == null ? '' : String(v),
    }))
  } catch {
    return null
  }
}

/** 폼 필드 → JSON 문자열 (key 비어있는 행은 제외) */
function fieldsToJson(fields) {
  const obj = {}
  for (const f of fields) {
    if (f.key?.trim()) obj[f.key] = f.value ?? ''
  }
  if (Object.keys(obj).length === 0) return ''
  return JSON.stringify(obj, null, 2)
}

const MODE_KEYS = ['form', 'json']
const MODE_ITEMS = [{ label: '폼 입력' }, { label: 'JSON 직접' }]

export default function ApiBodyEditor({ value, onChange }) {
  /* 초기 모드 결정 — body 가 깔끔하게 폼화 가능하면 form, 아니면 json */
  const initialFields = useMemo(() => bodyToFields(value), [])
  const initialMode = initialFields ? 'form' : 'json'

  const [mode, setMode] = useState(initialMode)
  const [fields, setFields] = useState(initialFields ?? [{ id: nextFieldId(), key: '', value: '' }])
  const [warning, setWarning] = useState('')

  /* 폼 필드 변경 시 자동으로 JSON 으로 직렬화해 부모에게 알림 */
  useEffect(() => {
    if (mode !== 'form') return
    const json = fieldsToJson(fields)
    if (json !== value) onChange(json)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, mode])

  /* 외부에서 value 가 바뀐 경우(예: cURL 붙여넣기) — JSON 모드면 그대로, 폼 모드면 재파싱 시도 */
  useEffect(() => {
    if (mode !== 'form') return
    const parsed = bodyToFields(value)
    if (parsed === null) {
      // 외부에서 들어온 값이 폼화 불가 → JSON 모드로 자동 전환
      setMode('json')
      return
    }
    // 폼이 같은 값을 다시 만들지 않도록 단순 비교 (key/value 동일성)
    const same =
      parsed.length === fields.length &&
      parsed.every((p, i) => p.key === fields[i]?.key && p.value === fields[i]?.value)
    if (!same) setFields(parsed.length > 0 ? parsed : [{ id: nextFieldId(), key: '', value: '' }])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const handleModeChange = (next) => {
    setWarning('')
    if (next === 'form') {
      const parsed = bodyToFields(value)
      if (parsed === null) {
        setWarning('현재 Body 가 중첩 구조이거나 JSON 형식이 아니라 폼으로 전환할 수 없어요.')
        return
      }
      setFields(parsed.length > 0 ? parsed : [{ id: nextFieldId(), key: '', value: '' }])
      setMode('form')
    } else {
      setMode('json')
    }
  }

  const setFieldKey = (id, key) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, key } : f)))
  }
  const setFieldValue = (id, val) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, value: val } : f)))
  }
  const addField = () => {
    setFields((prev) => [...prev, { id: nextFieldId(), key: '', value: '' }])
  }
  const removeField = (id) => {
    setFields((prev) => {
      const next = prev.filter((f) => f.id !== id)
      return next.length > 0 ? next : [{ id: nextFieldId(), key: '', value: '' }]
    })
  }

  return (
    <div className="api-body">
      <div className="api-body__head">
        <Typography variant="body-2-normal" weight="semibold" color="var(--color-label-neutral)" as="div">
          Request Body
        </Typography>
        <div className="api-body__mode">
          <SegmentedControl
            items={MODE_ITEMS}
            value={MODE_KEYS.indexOf(mode)}
            onChange={(idx) => handleModeChange(MODE_KEYS[idx])}
            size="small"
          />
        </div>
      </div>

      {warning && (
        <div className="api-body__warning">
          <Icon name="circleExclamationFill" size={14} color="var(--color-status-cautionary)" />
          <Typography variant="label-1-normal" color="var(--color-status-cautionary)" as="span">
            {warning}
          </Typography>
        </div>
      )}

      {mode === 'form' ? (
        <div className="api-body__form">
          {fields.map((f) => (
            <div key={f.id} className="api-body__row">
              <Textfield
                placeholder="필드명"
                value={f.key}
                onChange={(e) => setFieldKey(f.id, e.target.value)}
              />
              <Textfield
                placeholder="값"
                value={f.value}
                onChange={(e) => setFieldValue(f.id, e.target.value)}
              />
              <IconButtonNormal
                icon={<Icon name="close" size={16} />}
                onClick={() => removeField(f.id)}
                aria-label="필드 삭제"
              />
            </div>
          ))}
          <div>
            <TextButton
              color="primary"
              size="small"
              label="필드 추가"
              leadingIcon={<Icon name="plus" size={14} />}
              onClick={addField}
            />
          </div>
          <Typography variant="label-1-normal" color="var(--color-label-alternative)" as="div">
            값에 {'{{$변수명}}'} 도 그대로 사용할 수 있어요.
          </Typography>
        </div>
      ) : (
        <Textarea
          placeholder={'{\n  "memberCode": "{{$memberCode}}"\n}'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
        />
      )}
    </div>
  )
}
