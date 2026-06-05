// 런처 설정 페이지 — 플로팅 챗봇 진입 버튼 디자인 편집 + 실시간 미리보기.
// 좌측 설정 패널(봇 설정과 동일한 아이콘 레일 + 카드 패턴) / 우측 미리보기. 저장 시 localStorage + 토스트.

import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../design-system/components/Button/Button.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import IconButtonNormal from '../design-system/components/IconButton/IconButtonNormal.jsx'
import Radio from '../design-system/components/Radio/Radio.jsx'
import Snackbar from '../design-system/components/Snackbar/Snackbar.jsx'
import Switch from '../design-system/components/Switch/Switch.jsx'
import Textfield from '../design-system/components/Textfield/Textfield.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import {
  getImageName,
  hasImage,
  IMAGE_ALLOWED_TYPES,
  IMAGE_MAX_SIZE,
} from '../lib/chatMessageDefaults.js'
import {
  LAUNCHER_ICONS,
  defaultLauncherConfig,
  loadLauncher,
  saveLauncher,
} from '../lib/launcherConfig.js'
import ColorField from './ColorField.jsx'
import LauncherPreview from './LauncherPreview.jsx'
import './LauncherSettingsPage.css'

const TEXT_SIZES = [13, 14, 15, 16, 18]
const TOAST_DURATION = 2400
const LIST_PATH = '/app/chatbot-ui/launcher'

/** 섹션 — 좌측 아이콘 레일(칩 + 연결선) + 헤더(토글/제목) + 카드 본문. 봇 설정과 동일한 패턴. */
function Section({ icon, title, toggle, children }) {
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
            <Switch size="small" active={toggle.active} onChange={toggle.onChange} />
          ) : null}
          <span className="lset-section__title">{title}</span>
        </div>
        {children ? <div className="lset-card">{children}</div> : null}
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
  const entry = useMemo(() => loadLauncher(launcherId), [launcherId])

  const [config, setConfig] = useState(() => entry?.config ?? defaultLauncherConfig())
  const [name, setName] = useState(() => entry?.name ?? '')
  const [toast, setToast] = useState(null)
  const fileRef = useRef(null)
  const [uploadError, setUploadError] = useState('')

  /* 존재하지 않는 id 면 목록으로 되돌림 */
  useEffect(() => {
    if (!entry) navigate(LIST_PATH, { replace: true })
  }, [entry, navigate])

  const set = (patch) => setConfig((prev) => ({ ...prev, ...patch }))

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!IMAGE_ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Jpg, Png 파일만 업로드할 수 있어요.')
      return
    }
    if (file.size > IMAGE_MAX_SIZE) {
      setUploadError('파일 크기는 2MB 이하여야 해요.')
      return
    }
    setUploadError('')
    const reader = new FileReader()
    reader.onload = () => set({ iconImage: { name: file.name, url: reader.result } })
    reader.onerror = () => setUploadError('파일을 읽지 못했어요.')
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    const finalName = name.trim() || entry.name
    saveLauncher({ id: launcherId, name: finalName, config, nowIso: new Date().toISOString() })
    setToast('런처 디자인을 저장했어요.')
    window.clearTimeout(handleSave._t)
    handleSave._t = window.setTimeout(() => setToast(null), TOAST_DURATION)
  }

  const handleReset = () => {
    setConfig(defaultLauncherConfig())
    setUploadError('')
  }

  if (!entry) return null

  const isImageMode = config.iconType === 'image'
  const imageExists = hasImage(config.iconImage)

  return (
    <div className="launcher-set">
      <header className="launcher-set__head">
        <div className="launcher-set__head-left">
        <IconButtonNormal
          icon={<Icon name="chevronLeft" size={20} />}
          onClick={() => navigate(LIST_PATH)}
          aria-label="뒤로가기"
        />
        <div className="launcher-set__head-title">
          {/* 이름 인라인 편집 — 펜슬 어포던스, 저장 시 함께 반영 */}
          <label className="launcher-set__name-edit">
            <input
              type="text"
              className="launcher-set__name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="런처 버튼 이름"
              aria-label="런처 버튼 이름"
            />
            <span className="launcher-set__name-icon" aria-hidden="true">
              <Icon name="pencil" size={16} />
            </span>
          </label>
          <Typography variant="label-1-normal" color="var(--color-label-alternative)" as="p">
            챗봇을 임베드했을 때 표시되는 플로팅 런처 버튼의 디자인을 설정할 수 있어요.
          </Typography>
        </div>
        </div>
        <div className="launcher-set__head-actions">
          <Button variant="outlined" color="assistive" size="medium" label="기본값으로" onClick={handleReset} />
          <Button variant="solid" color="primary" size="medium" label="저장" onClick={handleSave} />
        </div>
      </header>

      <div className="launcher-set__body">
        {/* 좌측 미리보기 */}
        <section className="launcher-set__preview">
          <LauncherPreview config={config} />
        </section>

        {/* 우측 설정 패널 */}
        <section className="launcher-set__panel sidebar-scroll">
          {/* 버튼 — 아이콘 소스/색/배경 */}
          <Section icon="bubble" title="버튼">
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

            <Field label={isImageMode ? '아이콘 색 (이미지 업로드 중에는 비활성)' : '아이콘 색'}>
              <ColorField value={config.iconColor} onChange={(c) => set({ iconColor: c })} disabled={isImageMode} />
            </Field>

            <Field label="버튼 배경색">
              <ColorField value={config.bgColor} onChange={(c) => set({ bgColor: c })} />
            </Field>
          </Section>

          {/* 진입 메시지 — 토글 ON 일 때만 카드 노출 */}
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

                <Field label="글자색">
                  <ColorField value={config.greetingTextColor} onChange={(c) => set({ greetingTextColor: c })} />
                </Field>

                <Field label="배경색">
                  <ColorField value={config.greetingBgColor} onChange={(c) => set({ greetingBgColor: c })} />
                </Field>
              </>
            ) : null}
          </Section>
        </section>
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
    </div>
  )
}
