// 등록 API 편집 모달 — 이름/설명 + method/URL/헤더/Body/테스트/응답 viewer 일체.
//
// 외부 props.
//   api: 편집 대상 API 엔트리 (또는 새로 만든 빈 엔트리)
//   onChange(patch): 부분 업데이트 (이름/설명/method/url 등 모두)
//   onClose(): 모달 닫기
//   onDelete(): API 삭제 (확인은 부모에서 처리해도 OK)
//   variables / onRegisterVariable: 응답 viewer 의 변수 등록을 위해 전달

import { useEffect, useRef, useState } from 'react'
import Button from '../design-system/components/Button/Button.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import IconButtonNormal from '../design-system/components/IconButton/IconButtonNormal.jsx'
import Textfield from '../design-system/components/Textfield/Textfield.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import Textarea from '../design-system/components/Textfield/Textarea.jsx'
import { HTTP_METHODS } from '../lib/chatMessageDefaults.js'
import { callApi } from '../lib/apiCaller.js'
import { parseCurl } from '../lib/curlParser.js'
import ApiBodyEditor from './ApiBodyEditor.jsx'
import MenuSelect from './MenuSelect.jsx'
import { useFocusTrap } from '../lib/useFocusTrap.js'
import ApiResponseViewer from './ApiResponseViewer.jsx'
import './ApiEditModal.css'

let headerSeq = 200
const nextHeaderId = () => ++headerSeq

export default function ApiEditModal({
  api,            // 초기 데이터 (신규면 빈 기본값, 편집이면 기존 엔트리)
  isNew = false,  // 신규 등록 모드 vs 편집 모드
  onSubmit,       // (draft) => void — 등록/저장 시 호출. 부모가 bot.apis 에 반영
  onClose,        // 모달 닫기 (draft 폐기)
  onDelete,       // 편집 모드에서만 호출됨
  variables = [],
  onRegisterVariable, // 신규 모드에선 응답 viewer 가 비활성
}) {
  const dialogRef = useRef(null)
  useFocusTrap(dialogRef, true)

  /* 모달 안에서만 살아있는 draft — 등록/저장 누르기 전엔 부모 state 영향 없음 */
  const [draft, setDraft] = useState(api)

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

  /** draft 의 일부 필드 업데이트 — 기존 onChange(patch) 시그니처 그대로 유지 */
  const onChange = (patch) => setDraft((prev) => ({ ...prev, ...patch }))

  /* cURL 붙여넣기 — 텍스트 + 적용 결과 안내 */
  const [curlText, setCurlText] = useState('')
  const [curlMessage, setCurlMessage] = useState('')

  const handleApplyCurl = () => {
    const result = parseCurl(curlText)
    if (!result.url) {
      setCurlMessage(result.errors[0] || 'URL 을 찾지 못했어요. cURL 을 다시 확인해주세요.')
      return
    }
    // Body 가 JSON 이면 들여쓰기 정렬, 아니면 그대로
    let prettyBody = result.body
    try {
      const parsed = JSON.parse(result.body)
      prettyBody = JSON.stringify(parsed, null, 2)
    } catch {
      // 그대로 둠
    }
    onChange({
      method: result.method,
      url: result.url,
      headers:
        result.headers.length > 0
          ? result.headers
          : [{ id: 1, key: '', value: '' }],
      body: prettyBody,
    })
    const warnMsg = result.errors.length > 0 ? ` (안내: ${result.errors.join(', ')})` : ''
    setCurlMessage(`적용되었습니다.${warnMsg}`)
    setCurlText('')
    // 1.5초 후 메시지 사라짐
    setTimeout(() => setCurlMessage(''), 2500)
  }

  const setHeader = (id, key, value) => {
    onChange({
      headers: (draft.headers ?? []).map((h) => (h.id === id ? { ...h, key, value } : h)),
    })
  }
  const addHeader = () => {
    onChange({ headers: [...(draft.headers ?? []), { id: nextHeaderId(), key: '', value: '' }] })
  }
  const removeHeader = (id) => {
    onChange({ headers: (draft.headers ?? []).filter((h) => h.id !== id) })
  }

  const handleTest = async () => {
    onChange({ lastTestResult: { ...draft.lastTestResult, _testing: true } })
    const result = await callApi(draft, variables)
    onChange({ lastTestResult: result })
  }

  const bodyAllowed = !['GET', 'HEAD'].includes((draft.method || 'GET').toUpperCase())

  return (
    <div
      className="api-modal__backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="api-modal" role="dialog" aria-modal="true" aria-labelledby="api-modal-title" ref={dialogRef} tabIndex={-1}>
        <header className="api-modal__head">
          <Typography variant="headline-1" weight="semibold" as="span" id="api-modal-title">
            {isNew ? 'API 등록' : 'API 편집'}
          </Typography>
          <IconButtonNormal
            icon={<Icon name="close" size={18} />}
            onClick={onClose}
            aria-label="닫기"
          />
        </header>

        <div className="api-modal__body">
          <section className="api-modal__section">
            <Textfield
              heading="API 이름"
              required
              placeholder="예: 회원 정보 조회"
              value={draft.name}
              onChange={(e) => onChange({ name: e.target.value })}
            />
            <Textfield
              heading="설명 (옵션)"
              placeholder="예: 로그인된 회원의 정보를 가져옵니다"
              value={draft.description}
              onChange={(e) => onChange({ description: e.target.value })}
            />
          </section>

          {/* cURL 빠르게 채우기 — API 이름/설명과 같은 위계의 일반 필드 */}
          <section className="api-modal__section">
            <Typography variant="body-2-normal" weight="semibold" color="var(--color-label-neutral)" as="div">
              cURL 로 빠르게 채우기
            </Typography>
            <Typography variant="label-1-normal" color="var(--color-label-alternative)" as="div">
              개발자에게 받은 cURL 명령어를 붙여넣고 적용을 누르세요. (ChatGPT 등 AI에게 API 호출 정보를 주고 "cURL 명령어로 바꿔줘" 라고 요청해도 됩니다.)
            </Typography>
            <Textarea
              placeholder={'curl -X POST http://... -H "Content-Type: application/json" -d \'{"id":"M001"}\''}
              value={curlText}
              onChange={(e) => setCurlText(e.target.value)}
              rows={4}
            />
            <div className="api-modal__curl-actions">
              <Button
                variant="solid"
                color="primary"
                size="small"
                label="적용"
                onClick={handleApplyCurl}
                disabled={!curlText.trim()}
              />
              {curlMessage && (
                <Typography variant="label-1-normal" color="var(--color-label-alternative)" as="span">
                  {curlMessage}
                </Typography>
              )}
            </div>
          </section>

          <section className="api-modal__section">
            <Typography variant="body-2-normal" weight="semibold" color="var(--color-label-neutral)" as="div">
              요청{' '}
              <span style={{ color: 'var(--color-status-negative)' }}>*</span>
            </Typography>
            <MenuSelect
              value={draft.method}
              onChange={(m) => onChange({ method: m })}
              options={HTTP_METHODS}
              placeholder="요청 종류"
            />
            <Textfield
              placeholder="https://api.example.com/path"
              value={draft.url}
              onChange={(e) => onChange({ url: e.target.value })}
            />
          </section>

          <section className="api-modal__section">
            <Typography variant="body-2-normal" weight="semibold" color="var(--color-label-neutral)" as="div">
              헤더
            </Typography>
            {(draft.headers ?? []).map((h) => (
              <div key={h.id} className="api-modal__header-row">
                <Textfield
                  placeholder="Header"
                  value={h.key}
                  onChange={(e) => setHeader(h.id, e.target.value, h.value)}
                />
                <Textfield
                  placeholder="값"
                  value={h.value}
                  onChange={(e) => setHeader(h.id, h.key, e.target.value)}
                />
                <IconButtonNormal
                  icon={<Icon name="close" size={16} />}
                  onClick={() => removeHeader(h.id)}
                  aria-label="헤더 삭제"
                />
              </div>
            ))}
            <div>
              <Button
                variant="outlined"
                color="assistive"
                size="small"
                label="헤더 추가"
                leadingIcon={<Icon name="plus" size={14} />}
                onClick={addHeader}
              />
            </div>
          </section>

          {bodyAllowed && (
            <section className="api-modal__section">
              <ApiBodyEditor value={draft.body ?? ''} onChange={(body) => onChange({ body })} />
            </section>
          )}

          <section className="api-modal__test-row">
            <Button
              variant="solid"
              color="primary"
              size="medium"
              label={draft.lastTestResult?._testing ? '호출 중…' : '테스트 호출'}
              leadingIcon={<Icon name="play" size={14} />}
              disabled={draft.lastTestResult?._testing || !draft.url}
              onClick={handleTest}
            />
            <Typography variant="label-1-normal" color="var(--color-label-alternative)" as="span">
              현재 변수 샘플 값으로 치환해 호출합니다.
            </Typography>
          </section>

          {draft.lastTestResult && !draft.lastTestResult._testing && (
            <>
              <ApiResponseViewer
                result={draft.lastTestResult}
                onRegisterVariable={
                  isNew
                    ? undefined
                    : (payload) =>
                        onRegisterVariable?.({
                          ...payload,
                          sourceApiId: draft.id,
                          sourceId: draft.id, // 호환성 유지
                        })
                }
              />
              {isNew && (
                <Typography variant="label-1-normal" color="var(--color-label-alternative)" as="div">
                  API 를 먼저 등록한 후에 응답 필드를 변수로 등록할 수 있어요.
                </Typography>
              )}
            </>
          )}
        </div>

        {/* 푸터 — 좌측: 삭제(편집 모드만) / 우측: 취소 + 등록/저장 */}
        <footer className="api-modal__foot">
          <div className="api-modal__foot-left">
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
          <div className="api-modal__foot-right">
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
              disabled={!draft.name?.trim() || !draft.url?.trim()}
              onClick={() => onSubmit?.(draft)}
            />
          </div>
        </footer>
      </div>
    </div>
  )
}
