// 챗봇 디자인 에디터 — LNB 없는 독립 풀스크린.
// 상단바(뒤로가기+이름 / 다크모드+기본값으로+저장) + 좌측 탭(플로팅 런처 버튼 / 대화방) + 본문.
// 플로팅 런처 버튼 탭: 좌 미리보기 / 우 설정 패널. 대화방 탭: 준비 중 placeholder.
// 저장 누르기 전까진 미반영, 뒤로가기/새로고침 시 이탈 가드.

import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Alert from '../design-system/components/Alert/Alert.jsx'
import Button from '../design-system/components/Button/Button.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import IconButtonNormal from '../design-system/components/IconButton/IconButtonNormal.jsx'
import IconButtonOutlined from '../design-system/components/IconButton/IconButtonOutlined.jsx'
import Radio from '../design-system/components/Radio/Radio.jsx'
import Snackbar from '../design-system/components/Snackbar/Snackbar.jsx'
import Switch from '../design-system/components/Switch/Switch.jsx'
import Textfield from '../design-system/components/Textfield/Textfield.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import { useTheme } from '../lib/useTheme.js'
import {
  getImageName,
  hasImage,
  IMAGE_ALLOWED_TYPES,
  IMAGE_MAX_SIZE,
} from '../lib/chatMessageDefaults.js'
import {
  GREETING_WEIGHTS,
  LAUNCHER_ICONS,
  LAUNCHER_SHAPES,
  defaultLauncherConfig,
  loadLauncher,
  saveLauncher,
} from '../lib/launcherConfig.js'
import { isLowContrast } from '../lib/contrast.js'
import ColorField from './ColorField.jsx'
import LauncherPreview from './LauncherPreview.jsx'
import './LauncherSettingsPage.css'

const TEXT_SIZES = [13, 14, 15, 16, 18]
const TOAST_DURATION = 2400
const LIST_PATH = '/app/chatbot-ui/launcher'

/** 저장 비교용 스냅샷 — 이름 + 설정값을 직렬화 */
const snapshotOf = (name, config) => JSON.stringify({ name, config })

/** 이름 입력 너비 추정 — 한글 등 전각 문자는 약 2배 폭. 시각 폭(ch) 기준 floor 16 */
function nameInputCh(s) {
  let w = 0
  for (const ch of s) {
    w += /[ᄀ-ᇿ⺀-鿿　-〿㄰-㆏가-힣＀-￯]/.test(ch) ? 2 : 1
  }
  return Math.max(w, 16) + 2
}

/** 섹션 — 좌측 아이콘 레일(칩 + 연결선) + 헤더(토글/제목) + 카드 본문. 봇 설정과 동일한 패턴. */
function Section({ icon, title, toggle, disabled, note, children }) {
  return (
    <section className="lset-section">
      <div className="lset-section__rail">
        <div className="lset-section__chip">
          <Icon name={icon} size={14} />
        </div>
        <div className="lset-section__line" />
      </div>
      <div className="lset-section__body">
        <div className="lset-section__head">
          {toggle ? (
            <Switch size="small" active={toggle.active} onChange={toggle.onChange} aria-label={title} />
          ) : null}
          <span className="lset-section__title">{title}</span>
        </div>
        {note ? <p className="lset-section__note">{note}</p> : null}
        {children ? (
          <div className={['lset-card', disabled && 'is-disabled'].filter(Boolean).join(' ')}>{children}</div>
        ) : null}
      </div>
    </section>
  )
}

/** 카드 안 필드 — 작은 라벨 + 컨트롤 */
function Field({ label, children }) {
  return (
    <div className="lset-field">
      <span className="lset-field__label">{label}</span>
      {children}
    </div>
  )
}

export default function LauncherSettingsPage() {
  const navigate = useNavigate()
  const { launcherId } = useParams()
  const { theme, toggle: toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  /* 디자인 엔트리 — 저장 후 갱신되므로 state 로 보유 */
  const [entry, setEntry] = useState(() => loadLauncher(launcherId))

  const [tab, setTab] = useState('launcher') // 'launcher' | 'chatroom'
  const [config, setConfig] = useState(() => entry?.config ?? defaultLauncherConfig())
  const [name, setName] = useState(() => entry?.name ?? '')
  const [editingName, setEditingName] = useState(false)
  const nameBeforeEditRef = useRef('') // Esc 취소 시 되돌릴 값
  const [toast, setToast] = useState(null)
  const toastTimerRef = useRef(null)
  const fileRef = useRef(null)
  const [uploadError, setUploadError] = useState('')
  const buttonFileRef = useRef(null)
  const [buttonUploadError, setButtonUploadError] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    window.clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => setToast(null), TOAST_DURATION)
  }
  useEffect(() => () => window.clearTimeout(toastTimerRef.current), [])

  /* 저장 기준점 — 마지막 저장 상태. 현재 값과 다르면 dirty */
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    snapshotOf(entry?.name ?? '', entry?.config ?? defaultLauncherConfig()),
  )
  const isDirty = !!entry && snapshotOf(name, config) !== savedSnapshot

  /* 이탈 가드 — 뒤로가기 클릭 시 확인 Alert */
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false)

  /* 새로고침·탭 닫기 가드 — dirty 면 브라우저 기본 경고 */
  useEffect(() => {
    if (!isDirty) return
    const onBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  const handleBack = () => {
    if (isDirty) setConfirmLeaveOpen(true)
    else navigate(LIST_PATH)
  }

  /* 존재하지 않는 id 면 목록으로 되돌림 */
  useEffect(() => {
    if (!entry) navigate(LIST_PATH, { replace: true })
  }, [entry, navigate])

  const set = (patch) => setConfig((prev) => ({ ...prev, ...patch }))

  /* 이미지 파일 읽기 — 검증 통과 시 onDone({name,url}), 실패 시 onError(메시지) */
  const readImageFile = (e, { onDone, onError }) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!IMAGE_ALLOWED_TYPES.includes(file.type)) {
      onError('Jpg, Png 파일만 업로드할 수 있어요.')
      return
    }
    if (file.size > IMAGE_MAX_SIZE) {
      onError('파일 크기는 2MB 이하여야 해요.')
      return
    }
    onError('')
    const reader = new FileReader()
    reader.onload = () => onDone({ name: file.name, url: reader.result })
    reader.onerror = () => onError('파일을 읽지 못했어요.')
    reader.readAsDataURL(file)
  }

  const handleFile = (e) =>
    readImageFile(e, { onDone: (img) => set({ iconImage: img }), onError: setUploadError })

  const handleButtonFile = (e) =>
    readImageFile(e, { onDone: (img) => set({ buttonImage: img }), onError: setButtonUploadError })

  /* 저장 — 현재 편집값을 덮어쓰기 저장 */
  const handleSave = () => {
    const finalName = name.trim() || entry.name
    const next = saveLauncher({ id: launcherId, name: finalName, config, nowIso: new Date().toISOString() })
    if (!next) return
    setEntry(next)
    setName(finalName)
    setSavedSnapshot(snapshotOf(finalName, config))
    showToast('저장했어요.')
  }

  const handleReset = () => {
    setConfig(defaultLauncherConfig())
    setUploadError('')
    setButtonUploadError('')
  }

  if (!entry) return null

  const isImageMode = config.iconType === 'image'
  const imageExists = hasImage(config.iconImage)
  const isButtonImage = config.buttonType === 'image'
  const buttonImageExists = hasImage(config.buttonImage)
  // 이미지 버튼이면 아이콘 섹션 전체 비활성 (이미지가 버튼 그 자체)
  const iconDisabled = isButtonImage

  /* 색 대비 경고 — 너무 비슷하면 잘 안 보임. 이미지 버튼이면 의미 없음 */
  const iconContrastLow = !isImageMode && !isButtonImage && isLowContrast(config.iconColor, config.bgColor)
  const greetingContrastLow =
    config.greetingOn && isLowContrast(config.greetingTextColor, config.greetingBgColor)

  const TABS = [
    { key: 'launcher', label: '플로팅 런처 버튼', icon: 'bubble' },
    { key: 'chatroom', label: '대화방', icon: 'message' },
  ]

  return (
    <div className="dze">
      {/* 상단바 — 좌(뒤로가기+이름) / 우(다크모드+기본값으로+저장) */}
      <header className="dze__topbar">
        <div className="dze__topbar-left">
          <IconButtonNormal
            icon={<Icon name="chevronLeft" size={20} />}
            onClick={handleBack}
            aria-label="목록으로"
          />
          {editingName ? (
            <input
              type="text"
              className="dze__name-input"
              style={{ width: `${nameInputCh(name)}ch` }}
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur()
                else if (e.key === 'Escape') {
                  setName(nameBeforeEditRef.current)
                  setEditingName(false)
                }
              }}
              placeholder="챗봇 디자인 이름"
              aria-label="챗봇 디자인 이름"
            />
          ) : (
            <span className="dze__name">
              <span className="dze__name-text">{name || '챗봇 디자인 이름'}</span>
              <button
                type="button"
                className="dze__name-edit-btn"
                aria-label="이름 변경"
                onClick={() => {
                  nameBeforeEditRef.current = name
                  setEditingName(true)
                }}
              >
                <Icon name="pencil" size={14} />
              </button>
            </span>
          )}
          {isDirty && (
            <span className="dze__dirty-dot" aria-label="저장되지 않은 변경 사항">
              •
            </span>
          )}
        </div>

        {/* 우측 — 다크모드(하루노히 테마) + 기본값으로 + 저장 */}
        <div className="dze__topbar-right">
          <IconButtonOutlined
            icon={<Icon name={isDark ? 'sun' : 'moon'} size={18} />}
            size="small"
            onClick={toggleTheme}
            aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
          />
          {tab === 'launcher' && (
            <Button variant="outlined" color="assistive" size="small" label="기본값으로" onClick={handleReset} />
          )}
          <Button variant="solid" color="primary" size="small" label="저장" onClick={handleSave} />
        </div>
      </header>

      <div className="dze__body">
        {/* 좌측 탭 — 챗봇 디자인의 편집 대상 전환 */}
        <aside className="dze__nav">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={['dze__nav-tab', tab === t.key && 'is-active'].filter(Boolean).join(' ')}
              onClick={() => setTab(t.key)}
              aria-pressed={tab === t.key}
            >
              <Icon name={t.icon} size={18} />
              <Typography variant="label-1-normal" weight="medium" as="span">
                {t.label}
              </Typography>
            </button>
          ))}
        </aside>

        {/* 본문 */}
        <main className="dze__main">
          {tab === 'launcher' ? (
            <div className="launcher-set__body">
              {/* 좌측 미리보기 */}
              <section className="launcher-set__preview">
                <LauncherPreview config={config} />
              </section>

              {/* 우측 설정 패널 */}
              <section className="launcher-set__panel sidebar-scroll">
                {/* 아이콘 — 버튼 안에 들어가는 아이콘/이미지 (이미지 버튼이면 비활성) */}
                <Section
                  icon="bubble"
                  title="아이콘"
                  disabled={iconDisabled}
                  note={iconDisabled ? '이미지 버튼을 사용하는 동안에는 아이콘이 적용되지 않아요.' : undefined}
                >
                  <Field label="아이콘">
                    <div className="launcher-set__radios">
                      <Radio checked={!isImageMode} label="기본 아이콘" onChange={() => set({ iconType: 'default' })} />
                      <Radio checked={isImageMode} label="이미지 업로드" onChange={() => set({ iconType: 'image' })} />
                    </div>

                    {!isImageMode ? (
                      <div className="launcher-set__icons">
                        {LAUNCHER_ICONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            className={['launcher-set__icon-opt', config.iconName === opt.value && 'is-active']
                              .filter(Boolean)
                              .join(' ')}
                            onClick={() => set({ iconName: opt.value })}
                            aria-pressed={config.iconName === opt.value}
                          >
                            <Icon name={opt.value} size={24} />
                            <Typography variant="caption-1" color="var(--color-label-alternative)" as="span">
                              {opt.label}
                            </Typography>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="launcher-set__upload">
                        <div
                          className="launcher-set__upload-field"
                          role="button"
                          tabIndex={0}
                          onClick={() => fileRef.current?.click()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              fileRef.current?.click()
                            }
                          }}
                        >
                          <Textfield
                            placeholder="이미지를 업로드해 주세요."
                            value={imageExists ? getImageName(config.iconImage) : ''}
                            readOnly
                            status={uploadError ? 'negative' : 'normal'}
                            trailingButton={{ label: imageExists ? '변경' : '불러오기', variant: 'normal' }}
                          />
                        </div>
                        <input ref={fileRef} type="file" accept="image/jpeg,image/png" onChange={handleFile} hidden />
                        <span
                          className={['launcher-set__caption', uploadError && 'is-error'].filter(Boolean).join(' ')}
                        >
                          {uploadError || '* Jpg, Png · 최대 2MB · 정사각형 비율 권장'}
                        </span>
                      </div>
                    )}
                  </Field>

                  <Field label={isImageMode ? '아이콘 색 (이미지 아이콘 중에는 비활성)' : '아이콘 색'}>
                    <ColorField value={config.iconColor} onChange={(c) => set({ iconColor: c })} disabled={isImageMode} />
                    {iconContrastLow && (
                      <span className="launcher-set__caption is-error">
                        아이콘 색과 버튼 배경색의 대비가 낮아 잘 안 보일 수 있어요.
                      </span>
                    )}
                  </Field>
                </Section>

                {/* 버튼 — 컨테이너 모양 또는 이미지 버튼 */}
                <Section icon="square" title="버튼">
                  <Field label="버튼">
                    <div className="launcher-set__radios">
                      <Radio checked={!isButtonImage} label="기본 버튼" onChange={() => set({ buttonType: 'default' })} />
                      <Radio checked={isButtonImage} label="이미지 버튼 업로드" onChange={() => set({ buttonType: 'image' })} />
                    </div>
                  </Field>

                  {!isButtonImage ? (
                    <>
                      <Field label="모양">
                        <div className="launcher-set__icons">
                          {LAUNCHER_SHAPES.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              className={['launcher-set__icon-opt', config.buttonShape === opt.value && 'is-active']
                                .filter(Boolean)
                                .join(' ')}
                              onClick={() => set({ buttonShape: opt.value })}
                              aria-pressed={config.buttonShape === opt.value}
                            >
                              <span className={`launcher-set__shape launcher-set__shape--${opt.value}`} aria-hidden="true" />
                              <Typography variant="caption-1" color="var(--color-label-alternative)" as="span">
                                {opt.label}
                              </Typography>
                            </button>
                          ))}
                        </div>
                      </Field>

                      <Field label="버튼색">
                        <ColorField value={config.bgColor} onChange={(c) => set({ bgColor: c })} />
                      </Field>
                    </>
                  ) : (
                    <Field label="버튼 이미지">
                      <div className="launcher-set__upload">
                        <div
                          className="launcher-set__upload-field"
                          role="button"
                          tabIndex={0}
                          onClick={() => buttonFileRef.current?.click()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              buttonFileRef.current?.click()
                            }
                          }}
                        >
                          <Textfield
                            placeholder="이미지를 업로드해 주세요."
                            value={buttonImageExists ? getImageName(config.buttonImage) : ''}
                            readOnly
                            status={buttonUploadError ? 'negative' : 'normal'}
                            trailingButton={{ label: buttonImageExists ? '변경' : '불러오기', variant: 'normal' }}
                          />
                        </div>
                        <input ref={buttonFileRef} type="file" accept="image/jpeg,image/png" onChange={handleButtonFile} hidden />
                        <span
                          className={['launcher-set__caption', buttonUploadError && 'is-error'].filter(Boolean).join(' ')}
                        >
                          {buttonUploadError || '* Jpg, Png · 최대 2MB · 투명 배경 PNG 권장'}
                        </span>
                      </div>
                    </Field>
                  )}
                </Section>

                <Section
                  icon="message"
                  title="진입 메시지"
                  toggle={{ active: config.greetingOn, onChange: () => set({ greetingOn: !config.greetingOn }) }}
                >
                  {config.greetingOn ? (
                    <>
                      <Field label="말풍선 위치">
                        <div className="launcher-set__radios">
                          <Radio
                            checked={config.greetingPosition !== 'top'}
                            label="버튼 왼쪽"
                            onChange={() => set({ greetingPosition: 'left' })}
                          />
                          <Radio
                            checked={config.greetingPosition === 'top'}
                            label="버튼 위"
                            onChange={() => set({ greetingPosition: 'top' })}
                          />
                        </div>
                      </Field>

                      <Field label="메시지 내용">
                        <Textfield
                          placeholder="도움이 필요하신가요?"
                          value={config.greetingText}
                          onChange={(e) => set({ greetingText: e.target.value })}
                          aria-label="메시지 내용"
                        />
                      </Field>

                      <Field label="글자 크기">
                        <div className="launcher-set__sizes">
                          {TEXT_SIZES.map((px) => (
                            <button
                              key={px}
                              type="button"
                              className={['launcher-set__size-opt', config.greetingTextSize === px && 'is-active']
                                .filter(Boolean)
                                .join(' ')}
                              onClick={() => set({ greetingTextSize: px })}
                              aria-pressed={config.greetingTextSize === px}
                            >
                              {px}
                            </button>
                          ))}
                        </div>
                      </Field>

                      <Field label="글자 굵기">
                        <div className="launcher-set__sizes">
                          {GREETING_WEIGHTS.map((w) => (
                            <button
                              key={w.value}
                              type="button"
                              className={['launcher-set__size-opt', config.greetingTextWeight === w.value && 'is-active']
                                .filter(Boolean)
                                .join(' ')}
                              style={{ fontWeight: w.css }}
                              onClick={() => set({ greetingTextWeight: w.value })}
                              aria-pressed={config.greetingTextWeight === w.value}
                            >
                              {w.label}
                            </button>
                          ))}
                        </div>
                      </Field>

                      <Field label="글자색">
                        <ColorField value={config.greetingTextColor} onChange={(c) => set({ greetingTextColor: c })} />
                      </Field>

                      <Field label="배경색">
                        <ColorField value={config.greetingBgColor} onChange={(c) => set({ greetingBgColor: c })} />
                        {greetingContrastLow && (
                          <span className="launcher-set__caption is-error">
                            글자색과 배경색의 대비가 낮아 잘 안 보일 수 있어요.
                          </span>
                        )}
                      </Field>
                    </>
                  ) : null}
                </Section>
              </section>
            </div>
          ) : (
            <div className="dze__placeholder">
              <Icon name="message" size={32} color="var(--color-label-assistive)" />
              <Typography variant="body-2-normal" color="var(--color-label-alternative)" as="p">
                대화방 디자인은 곧 제공될 예정이에요.
              </Typography>
            </div>
          )}
        </main>
      </div>

      {toast && (
        <div className="launcher-set__toast">
          <Snackbar
            message={toast}
            icon={<Icon name="circleCheckFill" size={20} color="var(--color-status-positive)" />}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* 이탈 가드 — 뒤로가기 시 저장 안 한 변경점이 있으면 */}
      {confirmLeaveOpen && (
        <div
          className="launcher-set__leave-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmLeaveOpen(false)
          }}
        >
          <Alert
            platform="web"
            title="저장하지 않은 변경 사항이 있어요"
            body="지금 나가면 변경한 내용이 사라집니다. 정말 나가시겠어요?"
            primaryAction={{ label: '나가기', variant: 'negative', onClick: () => navigate(LIST_PATH) }}
            secondaryAction={{ label: '취소', onClick: () => setConfirmLeaveOpen(false) }}
          />
        </div>
      )}
    </div>
  )
}
