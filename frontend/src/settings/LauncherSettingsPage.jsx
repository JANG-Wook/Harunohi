// 챗봇 디자인 에디터 — LNB 없는 독립 풀스크린.
// 상단바(뒤로가기+이름 / 다크모드+기본값으로+저장) + 좌측 탭(런처/대화방/응답) + 본문.
// 런처·대화방 탭: 좌 미리보기 / 우 설정 패널. 챗봇 응답 설정 탭: 준비 중 placeholder.
// 저장 누르기 전까진 미반영, 뒤로가기/새로고침 시 이탈 가드.

import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Alert from '../design-system/components/Alert/Alert.jsx'
import Button from '../design-system/components/Button/Button.jsx'
import Checkbox from '../design-system/components/Checkbox/Checkbox.jsx'
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
  defaultChatroomConfig,
  defaultLauncherConfig,
  defaultResponseConfig,
  loadLauncher,
  saveLauncher,
} from '../lib/launcherConfig.js'
import { isLowContrast } from '../lib/contrast.js'
import { PROFILE_ICONS, buildProfileAvatar } from '../lib/profileAvatar.js'
import ColorField from './ColorField.jsx'
import LauncherPreview from './LauncherPreview.jsx'
import ChatroomPreview from './ChatroomPreview.jsx'
import ResponsePreview from './ResponsePreview.jsx'
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

/** 섹션 — 좌측 아이콘 레일(칩 + 연결선) + 헤더(토글/제목/제목 옆 안내) + 카드 본문. 봇 설정과 동일한 패턴. */
function Section({ icon, title, toggle, disabled, note, headNote, children }) {
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
          {headNote ? <span className="lset-section__head-note">{headNote}</span> : null}
        </div>
        {note ? <p className="lset-section__note">{note}</p> : null}
        {children ? (
          <div className={['lset-card', disabled && 'is-disabled'].filter(Boolean).join(' ')}>{children}</div>
        ) : null}
      </div>
    </section>
  )
}

/** 체크 행 — 좌측 체크박스 + 라벨. 섹션(상위=스위치) 아래 하위 항목용. 응답 설정과 동일한 위계 표현 */
function CheckRow({ label, active, onChange }) {
  return (
    <div className="launcher-set__check-row">
      <Checkbox size="small" state={active ? 'checked' : 'unchecked'} onChange={onChange} aria-label={label} />
      <span className="launcher-set__check-row__label" onClick={onChange}>{label}</span>
    </div>
  )
}

/** 숫자 입력 필드 — 크기/둥글기(px)용.
 *  입력 중엔 자유롭게 두고(빈 값·중간값 허용), 확정(blur/Enter) 때만 min~max 로 클램프해 커밋.
 *  매 키 입력마다 클램프하면 빈 값이 min 으로 튀거나 두 자리 입력이 막히므로 드래프트 상태를 둔다. */
function NumberField({ value, onChange, min = 0, max = 999, suffix = 'px' }) {
  const [draft, setDraft] = useState(String(value))
  // 외부 값 변경(기본값으로 / 다른 응답 선택 등) 시 입력값 동기화
  useEffect(() => {
    setDraft(String(value))
  }, [value])

  const commit = (str) => {
    const n = Number(str)
    if (str.trim() === '' || !Number.isFinite(n)) {
      setDraft(String(value)) // 빈 값·무효 입력은 직전 값으로 복귀
      return
    }
    const clamped = Math.min(max, Math.max(min, Math.round(n)))
    setDraft(String(clamped))
    if (clamped !== value) onChange(clamped)
  }

  const handleChange = (e) => {
    setDraft(e.target.value)
    // 스피너 화살표·방향키 스텝은 inputType 이 없는 input 이벤트 → 즉시 커밋.
    // 타이핑(insertText 등)은 blur/Enter 때 커밋해 자유 입력 보장.
    if (!e.nativeEvent.inputType) commit(e.target.value)
  }

  return (
    <div className="lset-number">
      <input
        type="number"
        className="lset-number__input"
        value={draft}
        min={min}
        max={max}
        onChange={handleChange}
        onBlur={() => commit(draft)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
        }}
      />
      <span className="lset-number__suffix">{suffix}</span>
    </div>
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
  const profileFileRef = useRef(null)
  const [profileUploadError, setProfileUploadError] = useState('')
  const bgFileRef = useRef(null)
  const [bgUploadError, setBgUploadError] = useState('')

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
  const setChatroom = (patch) =>
    setConfig((prev) => ({ ...prev, chatroom: { ...prev.chatroom, ...patch } }))
  const setResponse = (patch) =>
    setConfig((prev) => ({ ...prev, response: { ...prev.response, ...patch } }))

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

  const handleProfileFile = (e) =>
    readImageFile(e, { onDone: (img) => setChatroom({ profileImage: img }), onError: setProfileUploadError })

  const handleBgFile = (e) =>
    readImageFile(e, { onDone: (img) => setChatroom({ bgImage: img }), onError: setBgUploadError })

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
    if (tab === 'chatroom') {
      // 대화방 설정 = 대화방 섹션(이름/온라인/상단 고정/입력창 확장)만 초기화
      const d = defaultChatroomConfig()
      setChatroom({
        roomTitleOn: d.roomTitleOn,
        roomTitle: d.roomTitle,
        onlineIndicator: d.onlineIndicator,
        pinUserToTop: d.pinUserToTop,
        inputExpandable: d.inputExpandable,
      })
    } else if (tab === 'response') {
      // 대화방 UI 설정 = 응답 스타일 + 챗봇 프로필 + 테마/배경/입력/폰트 초기화
      const d = defaultChatroomConfig()
      setResponse(defaultResponseConfig())
      setChatroom({
        botNameOn: d.botNameOn,
        botName: d.botName,
        profileType: d.profileType,
        profileIcon: d.profileIcon,
        profileIconColor: d.profileIconColor,
        profileIconBgColor: d.profileIconBgColor,
        profileImage: d.profileImage,
        themeSupport: d.themeSupport,
        bgType: d.bgType,
        bgColor: d.bgColor,
        bgImage: d.bgImage,
        inputPlaceholder: d.inputPlaceholder,
        font: d.font,
      })
      setProfileUploadError('')
      setBgUploadError('')
    } else {
      setConfig((prev) => ({ ...defaultLauncherConfig(), chatroom: prev.chatroom }))
      setUploadError('')
      setButtonUploadError('')
    }
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

  /* 대화방 설정 파생값 */
  const chatroom = config.chatroom
  /* 응답 스타일 파생값 */
  const response = config.response
  /* 다크/라이트 모드 사용 시 색상 설정은 테마가 지배 → 숨김(크기/둥글기/입력/폰트는 유지) */
  const themed = chatroom.themeSupport
  const THEME_NOTE = '색상은 다크/라이트 모드를 따라요'
  const profileImageExists = hasImage(chatroom.profileImage)
  const isChatBgColor = chatroom.bgType === 'color'
  const isChatBgImage = chatroom.bgType === 'image'
  const chatBgImageExists = hasImage(chatroom.bgImage)

  const TABS = [
    { key: 'launcher', label: '플로팅 런처 버튼 설정', icon: 'bubble' },
    { key: 'chatroom', label: '대화방 설정', icon: 'message' },
    { key: 'response', label: '대화방 UI 설정', icon: 'palette' },
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
          <Button variant="outlined" color="assistive" size="small" label="기본값으로" onClick={handleReset} />
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
                            description={uploadError || '* Jpg, Png · 최대 2MB · 정사각형 비율 권장'}
                            trailingButton={{ label: imageExists ? '변경' : '불러오기', variant: 'normal' }}
                          />
                        </div>
                        <input ref={fileRef} type="file" accept="image/jpeg,image/png" onChange={handleFile} hidden />
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
                            description={buttonUploadError || '* Jpg, Png · 최대 2MB · 투명 배경 PNG 권장'}
                            trailingButton={{ label: buttonImageExists ? '변경' : '불러오기', variant: 'normal' }}
                          />
                        </div>
                        <input ref={buttonFileRef} type="file" accept="image/jpeg,image/png" onChange={handleButtonFile} hidden />
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
          ) : tab === 'chatroom' ? (
            <div className="launcher-set__body">
              {/* 좌측 미리보기 */}
              <section className="launcher-set__preview">
                <ChatroomPreview config={config} />
              </section>

              {/* 우측 설정 패널 */}
              <section className="launcher-set__panel sidebar-scroll">
                {/* 대화방 */}
                <Section icon="message" title="대화방">
                  <div className="lset-field">
                    <CheckRow
                      label="대화방 이름"
                      active={chatroom.roomTitleOn}
                      onChange={() => setChatroom({ roomTitleOn: !chatroom.roomTitleOn })}
                    />
                    {chatroom.roomTitleOn && (
                      <Textfield
                        placeholder="챗봇"
                        value={chatroom.roomTitle}
                        onChange={(e) => setChatroom({ roomTitle: e.target.value })}
                        aria-label="대화방 이름"
                      />
                    )}
                  </div>

                  <div className="lset-field">
                    <CheckRow
                      label="온라인 표시 사용"
                      active={chatroom.onlineIndicator}
                      onChange={() => setChatroom({ onlineIndicator: !chatroom.onlineIndicator })}
                    />
                    <span className="launcher-set__caption">
                      켜면 대화방 이름 옆에 연결 상태 점이 표시돼요. (연결=파랑 · 불안정=주황 · 끊김=회색)
                    </span>
                  </div>

                  <div className="lset-field">
                    <CheckRow
                      label="사용자 발화 상단 고정"
                      active={chatroom.pinUserToTop}
                      onChange={() => setChatroom({ pinUserToTop: !chatroom.pinUserToTop })}
                    />
                    <span className="launcher-set__caption">
                      켜면 사용자가 메시지를 보낼 때 직전 대화가 위로 밀리고, 보낸 메시지가 화면 상단에 고정돼요.
                    </span>
                  </div>

                  <div className="lset-field">
                    <CheckRow
                      label="메시지 입력창 확장 사용"
                      active={chatroom.inputExpandable}
                      onChange={() => setChatroom({ inputExpandable: !chatroom.inputExpandable })}
                    />
                    <span className="launcher-set__caption">
                      켜면 입력창을 누를 때 입력 영역이 확장돼요. 끄면 확장 없이 한 줄에 그대로 입력돼요.
                    </span>
                  </div>
                </Section>
              </section>
            </div>
          ) : (
            <div className="launcher-set__body">
              {/* 좌측 미리보기 */}
              <section className="launcher-set__preview">
                <ResponsePreview config={config} />
              </section>

              {/* 우측 설정 패널 */}
              <section className="launcher-set__panel sidebar-scroll">
                {/* 1. 다크/라이트 모드 — 색상 설정의 마스터. 켜면 색은 테마가 지배 */}
                <Section icon="palette" title="다크/라이트 모드">
                  <div className="lset-field">
                    <CheckRow
                      label="다크/라이트 모드 사용"
                      active={chatroom.themeSupport}
                      onChange={() => setChatroom({ themeSupport: !chatroom.themeSupport })}
                    />
                    <span className="launcher-set__caption">
                      켜면 라이트/다크에 자동으로 맞춰지며, 색상 설정은 숨겨지고 테마를 따라요.
                    </span>
                  </div>
                </Section>

                {/* 2. 챗봇 프로필 */}
                <Section icon="agent" title="챗봇 프로필">
                  <div className="lset-field">
                    <CheckRow
                      label="챗봇 이름"
                      active={chatroom.botNameOn}
                      onChange={() => setChatroom({ botNameOn: !chatroom.botNameOn })}
                    />
                    {chatroom.botNameOn && (
                      <Textfield
                        placeholder="챗봇"
                        value={chatroom.botName}
                        onChange={(e) => setChatroom({ botName: e.target.value })}
                        aria-label="챗봇 이름"
                      />
                    )}
                  </div>

                  <Field label="프로필 사진">
                    <div className="launcher-set__radios">
                      <Radio
                        checked={chatroom.profileType === 'icon'}
                        label="기본 아이콘"
                        onChange={() => setChatroom({ profileType: 'icon' })}
                      />
                      <Radio
                        checked={chatroom.profileType === 'image'}
                        label="이미지 업로드"
                        onChange={() => setChatroom({ profileType: 'image' })}
                      />
                      <Radio
                        checked={chatroom.profileType === 'none'}
                        label="사용 안함"
                        onChange={() => setChatroom({ profileType: 'none' })}
                      />
                    </div>

                    {chatroom.profileType === 'image' && (
                      <div className="launcher-set__upload">
                        <div
                          className="launcher-set__upload-field"
                          role="button"
                          tabIndex={0}
                          onClick={() => profileFileRef.current?.click()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              profileFileRef.current?.click()
                            }
                          }}
                        >
                          <Textfield
                            placeholder="이미지를 업로드해 주세요."
                            value={profileImageExists ? getImageName(chatroom.profileImage) : ''}
                            readOnly
                            status={profileUploadError ? 'negative' : 'normal'}
                            description={profileUploadError || '* Jpg, Png · 최대 2MB · 정사각형 비율 권장'}
                            trailingButton={{ label: profileImageExists ? '변경' : '불러오기', variant: 'normal' }}
                          />
                        </div>
                        <input ref={profileFileRef} type="file" accept="image/jpeg,image/png" onChange={handleProfileFile} hidden />
                      </div>
                    )}

                    {chatroom.profileType === 'icon' && (
                      <div className="launcher-set__icons">
                        {PROFILE_ICONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            className={['launcher-set__icon-opt', chatroom.profileIcon === opt.value && 'is-active']
                              .filter(Boolean)
                              .join(' ')}
                            onClick={() => setChatroom({ profileIcon: opt.value })}
                            aria-pressed={chatroom.profileIcon === opt.value}
                          >
                            <img
                              src={buildProfileAvatar(opt.value, chatroom.profileIconBgColor, chatroom.profileIconColor)}
                              alt=""
                              width={44}
                              height={44}
                              style={{ borderRadius: '50%', display: 'block' }}
                            />
                            <Typography variant="caption-1" color="var(--color-label-alternative)" as="span">
                              {opt.label}
                            </Typography>
                          </button>
                        ))}
                      </div>
                    )}

                    {chatroom.profileType === 'none' && (
                      <span className="launcher-set__caption">
                        대화방 메시지에 프로필 사진이 표시되지 않아요.
                      </span>
                    )}
                  </Field>

                  {chatroom.profileType === 'icon' && (
                    <>
                      <Field label="아이콘 색">
                        <ColorField
                          value={chatroom.profileIconColor}
                          onChange={(c) => setChatroom({ profileIconColor: c })}
                        />
                      </Field>
                      <Field label="프로필 배경색">
                        <ColorField
                          value={chatroom.profileIconBgColor}
                          onChange={(c) => setChatroom({ profileIconBgColor: c })}
                        />
                      </Field>
                    </>
                  )}
                </Section>

                {/* 3. 챗봇 응답 말풍선 */}
                <Section icon="message" title="챗봇 응답 말풍선" headNote={themed ? THEME_NOTE : undefined}>
                  {!themed && (
                    <>
                      <Field label="배경색">
                        <ColorField value={response.bubbleBgColor} onChange={(c) => setResponse({ bubbleBgColor: c })} />
                      </Field>
                      <Field label="외곽색">
                        <ColorField value={response.bubbleBorderColor} onChange={(c) => setResponse({ bubbleBorderColor: c })} />
                      </Field>
                    </>
                  )}
                </Section>

                {/* 4. 응답 제목 텍스트 */}
                <Section icon="textFormat" title="응답 제목 텍스트" headNote={themed ? THEME_NOTE : undefined}>
                  <Field label="크기">
                    <NumberField value={response.titleSize} onChange={(v) => setResponse({ titleSize: v })} min={8} max={48} />
                  </Field>
                  {!themed && (
                    <Field label="색">
                      <ColorField value={response.titleColor} onChange={(c) => setResponse({ titleColor: c })} />
                    </Field>
                  )}
                </Section>

                {/* 5. 응답 본문 텍스트 */}
                <Section icon="documentText" title="응답 본문 텍스트" headNote={themed ? THEME_NOTE : undefined}>
                  <Field label="크기">
                    <NumberField value={response.bodySize} onChange={(v) => setResponse({ bodySize: v })} min={8} max={48} />
                  </Field>
                  {!themed && (
                    <Field label="색">
                      <ColorField value={response.bodyColor} onChange={(c) => setResponse({ bodyColor: c })} />
                    </Field>
                  )}
                </Section>

                {/* 6. 응답 펼치기 텍스트 */}
                <Section icon="list" title="응답 펼치기 텍스트" note="‘더 보기’ 버튼 자체는 설정하지 않아요." headNote={themed ? THEME_NOTE : undefined}>
                  <Field label="크기">
                    <NumberField value={response.accordionSize} onChange={(v) => setResponse({ accordionSize: v })} min={8} max={48} />
                  </Field>
                  {!themed && (
                    <Field label="색">
                      <ColorField value={response.accordionColor} onChange={(c) => setResponse({ accordionColor: c })} />
                    </Field>
                  )}
                </Section>

                {/* 7. 응답 버튼 */}
                <Section icon="square" title="응답 버튼" headNote={themed ? THEME_NOTE : undefined}>
                  <Field label="둥글기">
                    <NumberField value={response.buttonRadius} onChange={(v) => setResponse({ buttonRadius: v })} min={0} max={999} />
                  </Field>
                  <Field label="텍스트 크기">
                    <NumberField value={response.buttonTextSize} onChange={(v) => setResponse({ buttonTextSize: v })} min={8} max={32} />
                  </Field>
                  {!themed && (
                    <>
                      <Field label="메인 버튼 색">
                        <ColorField value={response.mainButtonColor} onChange={(c) => setResponse({ mainButtonColor: c })} />
                      </Field>
                      <Field label="메인 버튼 외곽선 색">
                        <ColorField value={response.mainButtonBorderColor} onChange={(c) => setResponse({ mainButtonBorderColor: c })} />
                      </Field>
                      <Field label="메인 버튼 텍스트 색">
                        <ColorField value={response.mainButtonTextColor} onChange={(c) => setResponse({ mainButtonTextColor: c })} />
                      </Field>
                      <Field label="서브 버튼 색">
                        <ColorField value={response.subButtonColor} onChange={(c) => setResponse({ subButtonColor: c })} />
                      </Field>
                      <Field label="서브 버튼 외곽선 색">
                        <ColorField value={response.subButtonBorderColor} onChange={(c) => setResponse({ subButtonBorderColor: c })} />
                      </Field>
                      <Field label="서브 버튼 텍스트 색">
                        <ColorField value={response.subButtonTextColor} onChange={(c) => setResponse({ subButtonTextColor: c })} />
                      </Field>
                    </>
                  )}
                </Section>

                {/* 8. 응답 퀵버튼 */}
                <Section icon="tag" title="응답 퀵버튼" headNote={themed ? THEME_NOTE : undefined}>
                  <Field label="둥글기">
                    <NumberField value={response.quickRadius} onChange={(v) => setResponse({ quickRadius: v })} min={0} max={999} />
                  </Field>
                  <Field label="텍스트 크기">
                    <NumberField value={response.quickTextSize} onChange={(v) => setResponse({ quickTextSize: v })} min={8} max={32} />
                  </Field>
                  {!themed && (
                    <>
                      <Field label="텍스트 색">
                        <ColorField value={response.quickTextColor} onChange={(c) => setResponse({ quickTextColor: c })} />
                      </Field>
                      <Field label="퀵버튼 색">
                        <ColorField value={response.quickColor} onChange={(c) => setResponse({ quickColor: c })} />
                      </Field>
                      <Field label="퀵버튼 외곽선 색">
                        <ColorField value={response.quickBorderColor} onChange={(c) => setResponse({ quickBorderColor: c })} />
                      </Field>
                    </>
                  )}
                </Section>

                {/* 9. 대화방 배경 — 테마 사용 시 숨김 */}
                <Section icon="paletteFill" title="대화방 배경" headNote={themed ? THEME_NOTE : undefined}>
                  {!themed && (
                    <div className="launcher-set__group">
                      <Field label="배경 유형">
                        <div className="launcher-set__radios">
                          <Radio checked={isChatBgColor} label="색상" onChange={() => setChatroom({ bgType: 'color' })} />
                          <Radio checked={isChatBgImage} label="사진" onChange={() => setChatroom({ bgType: 'image' })} />
                        </div>

                        {isChatBgImage && (
                          <div className="launcher-set__upload">
                            <div
                              className="launcher-set__upload-field"
                              role="button"
                              tabIndex={0}
                              onClick={() => bgFileRef.current?.click()}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault()
                                  bgFileRef.current?.click()
                                }
                              }}
                            >
                              <Textfield
                                placeholder="이미지를 업로드해 주세요."
                                value={chatBgImageExists ? getImageName(chatroom.bgImage) : ''}
                                readOnly
                                status={bgUploadError ? 'negative' : 'normal'}
                                description={bgUploadError || '* Jpg, Png · 최대 2MB'}
                                trailingButton={{ label: chatBgImageExists ? '변경' : '불러오기', variant: 'normal' }}
                              />
                            </div>
                            <input ref={bgFileRef} type="file" accept="image/jpeg,image/png" onChange={handleBgFile} hidden />
                          </div>
                        )}
                      </Field>

                      <Field label={isChatBgColor ? '배경색' : '배경색 (색상 선택 시 활성)'}>
                        <ColorField
                          value={chatroom.bgColor}
                          onChange={(c) => setChatroom({ bgColor: c })}
                          disabled={!isChatBgColor}
                        />
                      </Field>
                    </div>
                  )}
                </Section>

                {/* 10. 입력창 / 폰트 — 테마 영향 없음 */}
                <Section icon="pencil" title="입력창 · 폰트">
                  <Field label="메시지 입력 안내 문구">
                    <Textfield
                      placeholder="메시지를 입력해 주세요"
                      value={chatroom.inputPlaceholder}
                      onChange={(e) => setChatroom({ inputPlaceholder: e.target.value })}
                      aria-label="메시지 입력 안내 문구"
                    />
                  </Field>

                  <Field label="폰트">
                    <div className="launcher-set__sizes">
                      <button type="button" className="launcher-set__size-opt is-active" aria-pressed="true" disabled>
                        Pretendard
                      </button>
                    </div>
                    <span className="launcher-set__caption">* 현재 Pretendard만 지원해요.</span>
                  </Field>
                </Section>
              </section>
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
