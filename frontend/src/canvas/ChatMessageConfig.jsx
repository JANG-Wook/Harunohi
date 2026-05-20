// 챗봇 메시지 응답 설정 패널 — HailMary ChatMessagePage 우측 패널의 controlled 버전
// config 와 onChange(nextConfig) 두 prop 만 받는다.

import { useEffect, useRef, useState } from 'react'
import Checkbox from '../design-system/components/Checkbox/Checkbox.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import IconButtonNormal from '../design-system/components/IconButton/IconButtonNormal.jsx'
import Menu from '../design-system/components/Menu/Menu.jsx'
import Select from '../design-system/components/Select/Select.jsx'
import Switch from '../design-system/components/Switch/Switch.jsx'
import Tab from '../design-system/components/Tab/Tab.jsx'
import TextButton from '../design-system/components/TextButton/TextButton.jsx'
import Textarea from '../design-system/components/Textfield/Textarea.jsx'
import Textfield from '../design-system/components/Textfield/Textfield.jsx'
import {
  ACTION_TYPES,
  FILE_CAPTION,
  FORM_TYPES,
  PH,
  defaultCarouselCard,
  defaultFormOptionsFor,
  sampleDescFor,
  samplePlaceholderFor,
  sampleTimePlaceholderFor,
} from '../lib/chatMessageDefaults.js'
import './ChatMessageConfig.css'

/* ── 보조 컴포넌트 ─────────────────────────────────────────── */

function MenuSelect({ value, onChange, options, placeholder = '값' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <Select
        placeholder={placeholder}
        value={selected?.label ?? ''}
        onClick={() => setOpen((v) => !v)}
        forceFocused={open}
      />
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 30 }}>
          <Menu
            items={options.map((o) => ({
              label: o.label,
              active: o.value === value,
              onClick: () => {
                onChange(o.value)
                setOpen(false)
              },
            }))}
          />
        </div>
      )}
    </div>
  )
}

function SwitchRow({ label, active, onChange, disabled = false }) {
  return (
    <div className="cmc-switch-row">
      <Switch size="small" active={active} onChange={onChange} disabled={disabled} />
      <span className="cmc-switch-row__label">{label}</span>
    </div>
  )
}

function NumberedSection({ icon, children }) {
  return (
    <section className="cmc-section">
      <div className="cmc-section__rail">
        <div className="cmc-section__chip">
          <Icon name={icon} size={14} />
        </div>
        <div className="cmc-section__line" />
      </div>
      <div className="cmc-section__body">{children}</div>
    </section>
  )
}

function SectionCard({ children }) {
  return <div className="cmc-card">{children}</div>
}

function FieldGroup({ label, children }) {
  return (
    <div className="cmc-field">
      <span className="cmc-field__label">{label}</span>
      {children}
    </div>
  )
}

function CheckBlock({ checked, onChange, label, children }) {
  return (
    <div className="cmc-check">
      <div className="cmc-check__head">
        <Checkbox state={checked ? 'checked' : 'unchecked'} onChange={onChange} />
        <span className="cmc-check__label" onClick={onChange}>{label}</span>
      </div>
      {checked && <div className="cmc-check__body">{children}</div>}
    </div>
  )
}

function FileUploadCard({ value, onChange }) {
  return (
    <SectionCard>
      <div className="cmc-file">
        <Textfield
          placeholder="파일을 업로드해 주세요."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          trailingButton={{ label: '불러오기', variant: 'normal' }}
        />
        <span className="cmc-file__caption">{FILE_CAPTION}</span>
      </div>
    </SectionCard>
  )
}

function QuickButtonItem({ index, label, onLabelChange, onRemove }) {
  return (
    <div className="cmc-quick">
      <div className="cmc-quick__head">
        <div className="cmc-quick__remove">
          <IconButtonNormal
            aria-label="삭제"
            color="var(--color-primary-normal)"
            onClick={onRemove}
            icon={<Icon name="close" size={20} />}
          />
        </div>
        <span className="cmc-quick__label">퀵 버튼 {index + 1}</span>
      </div>
      <FieldGroup label="버튼명">
        <Textfield
          placeholder={PH.quickItem}
          value={label}
          onChange={(e) => onLabelChange(e.target.value)}
        />
      </FieldGroup>
      <FieldGroup label="연결응답">
        <Select placeholder="값" />
      </FieldGroup>
    </div>
  )
}

/* ── 메인 컴포넌트 ─────────────────────────────────────────── */

export default function ChatMessageConfig({ config, onChange }) {
  const { cfg, mode, texts, imageFile, bannerFile, quickList, carouselCards, activeCardIdx, form } = config

  /* 상태 갱신 헬퍼 — 단일 onChange 로 모든 변경을 흘려보낸다 */
  const update = (patch) => onChange({ ...config, ...patch })
  const setCfg = (patch) => update({ cfg: { ...cfg, ...patch } })
  const setText = (key, v) => update({ texts: { ...texts, [key]: v } })
  const setForm = (patch) => update({ form: { ...form, ...patch } })

  const toggle = (key) => () => setCfg({ [key]: !cfg[key] })
  const setMode = (v) => update({ mode: v })
  const setActiveCardIdx = (v) => update({ activeCardIdx: v })

  const setImageFile = (v) => update({ imageFile: v })
  const setBannerFile = (v) => update({ bannerFile: v })

  const isCarousel = mode === 'carousel'
  const isInputForm = mode === 'inputForm'
  const isPending = mode === 'rag' || mode === 'branch'

  /* 캐로셀 활성 카드와 단일 모드 cfg/texts 를 통합한 활성 객체 */
  const activeCard = isCarousel ? carouselCards[activeCardIdx] : { ...cfg, ...texts }

  const updateActiveCard = (patch) =>
    update({
      carouselCards: carouselCards.map((c, i) => (i === activeCardIdx ? { ...c, ...patch } : c)),
    })

  /* 자식 체크박스 토글 — 형제가 모두 OFF 면 부모 스위치도 OFF */
  const toggleChild = (childKey, parentKey, siblings) => () => {
    const next = { ...cfg, [childKey]: !cfg[childKey] }
    if (!siblings.some((k) => next[k])) next[parentKey] = false
    setCfg(next)
  }

  const toggleCard = (key) => () => {
    if (isCarousel) updateActiveCard({ [key]: !activeCard[key] })
    else toggle(key)()
  }

  const toggleCardChild = (childKey, parentKey, siblings) => () => {
    if (isCarousel) {
      const next = { ...activeCard, [childKey]: !activeCard[childKey] }
      if (!siblings.some((k) => next[k])) next[parentKey] = false
      updateActiveCard(next)
    } else {
      toggleChild(childKey, parentKey, siblings)()
    }
  }

  const setCardText = (key) => (v) => {
    if (isCarousel) updateActiveCard({ [key]: v })
    else setText(key, v)
  }

  /* 캐로셀 카드 관리 */
  const addCarouselCard = () => {
    const nextId = (carouselCards[carouselCards.length - 1]?.id ?? 0) + 1
    update({ carouselCards: [...carouselCards, defaultCarouselCard(nextId)] })
  }

  const removeCardAt = (idx) => {
    if (carouselCards.length <= 1) return
    const nextCards = carouselCards.filter((_, i) => i !== idx)
    let nextIdx = activeCardIdx
    if (activeCardIdx === idx) nextIdx = Math.max(0, activeCardIdx - 1)
    else if (activeCardIdx > idx) nextIdx = activeCardIdx - 1
    update({ carouselCards: nextCards, activeCardIdx: nextIdx })
  }

  /* 퀵 버튼 관리 */
  const addQuick = () => update({ quickList: [...quickList, { id: Date.now(), label: '' }] })
  const removeQuick = (id) => update({ quickList: quickList.filter((it) => it.id !== id) })
  const updateQuick = (id, label) =>
    update({ quickList: quickList.map((it) => (it.id === id ? { ...it, label } : it)) })

  /* 입력 폼 관리 */
  const changeFormType = (newType) =>
    setForm({
      type: newType,
      description: sampleDescFor(newType),
      guideText: samplePlaceholderFor(newType),
      timeGuideText: sampleTimePlaceholderFor(newType),
      options: defaultFormOptionsFor(newType),
    })
  const addFormOption = () => {
    const nextId = (form.options[form.options.length - 1]?.id ?? 0) + 1
    setForm({ options: [...form.options, { id: nextId, label: '' }] })
  }
  const removeFormOption = (id) => setForm({ options: form.options.filter((o) => o.id !== id) })
  const updateFormOption = (id, label) =>
    setForm({ options: form.options.map((o) => (o.id === id ? { ...o, label } : o)) })

  const currentFormType = FORM_TYPES.find((t) => t.value === form.type)
  const formHasOptions = currentFormType?.hasOptions ?? false
  const formHasGuide = currentFormType?.hasGuide ?? false
  const formHasTime = currentFormType?.hasTime ?? false

  return (
    <div className="cmc">
      <h3 className="cmc__title">액션</h3>

      <div className="cmc__sections">
        {/* 1. 액션 유형 */}
        <NumberedSection icon="sparkle">
          <SwitchRow label="액션 유형" active={cfg.messageOn} disabled />
          {cfg.messageOn && (
            <SectionCard>
              <MenuSelect
                value={mode}
                onChange={setMode}
                options={ACTION_TYPES}
                placeholder="액션 유형 선택"
              />
            </SectionCard>
          )}
        </NumberedSection>

        {!isPending && (
          <>
            {isCarousel && (
              <div>
                <Tab
                  items={carouselCards.map((_, i) => ({
                    label: (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-8)' }}>
                        캐로셀 {i + 1}
                        {carouselCards.length > 1 && (
                          <span
                            role="button"
                            aria-label={`캐로셀 ${i + 1} 삭제`}
                            className="cmc-tab-close"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeCardAt(i)
                            }}
                          >
                            <Icon name="close" size={16} />
                          </span>
                        )}
                      </span>
                    ),
                  }))}
                  value={activeCardIdx}
                  onChange={setActiveCardIdx}
                  size="small"
                  scroll
                  trailingContent={
                    <TextButton
                      color="primary"
                      size="small"
                      label="추가"
                      leadingIcon={<Icon name="plus" size={16} />}
                      onClick={addCarouselCard}
                    />
                  }
                />
              </div>
            )}

            {/* 2. Image */}
            {!isInputForm && (
              <NumberedSection icon="image">
                <SwitchRow label="이미지" active={activeCard.imageOn} onChange={toggleCard('imageOn')} />
                {activeCard.imageOn && (
                  <FileUploadCard
                    value={isCarousel ? (activeCard.imageFile ?? '') : imageFile}
                    onChange={isCarousel ? (v) => updateActiveCard({ imageFile: v }) : setImageFile}
                  />
                )}
              </NumberedSection>
            )}

            {/* 3. Text */}
            <NumberedSection icon="documentText">
              <SwitchRow label="텍스트" active={activeCard.textOn} onChange={toggleCard('textOn')} />
              {activeCard.textOn && (
                <SectionCard>
                  <CheckBlock
                    checked={activeCard.titleOn}
                    onChange={toggleCardChild('titleOn', 'textOn', (isCarousel || isInputForm) ? ['titleOn', 'bodyOn'] : ['titleOn', 'bodyOn', 'accordionOn'])}
                    label="제목 텍스트"
                  >
                    <Textfield
                      placeholder={PH.title}
                      value={activeCard.title}
                      onChange={(e) => setCardText('title')(e.target.value)}
                    />
                  </CheckBlock>

                  <CheckBlock
                    checked={activeCard.bodyOn}
                    onChange={toggleCardChild('bodyOn', 'textOn', (isCarousel || isInputForm) ? ['titleOn', 'bodyOn'] : ['titleOn', 'bodyOn', 'accordionOn'])}
                    label="본문 텍스트"
                  >
                    <Textarea
                      placeholder={PH.body}
                      resize="fixed"
                      value={activeCard.body}
                      onChange={(e) => setCardText('body')(e.target.value)}
                    />
                  </CheckBlock>

                  {!isCarousel && !isInputForm && (
                    <CheckBlock
                      checked={activeCard.accordionOn}
                      onChange={toggleCardChild('accordionOn', 'textOn', ['titleOn', 'bodyOn', 'accordionOn'])}
                      label="아코디언 텍스트"
                    >
                      <Textarea
                        placeholder={PH.accordion}
                        resize="fixed"
                        value={activeCard.accordion}
                        onChange={(e) => setCardText('accordion')(e.target.value)}
                      />
                    </CheckBlock>
                  )}
                </SectionCard>
              )}
            </NumberedSection>

            {/* 4. 입력 폼 */}
            {isInputForm && (
              <NumberedSection icon="keyboard">
                <SwitchRow label="입력 폼" active disabled />
                <SectionCard>
                  <FieldGroup label="입력 폼 유형">
                    <MenuSelect value={form.type} onChange={changeFormType} options={FORM_TYPES} placeholder="값" />
                  </FieldGroup>

                  <FieldGroup label="입력 폼 설명">
                    <Textfield
                      placeholder={sampleDescFor(form.type)}
                      value={form.description}
                      onChange={(e) => setForm({ description: e.target.value })}
                    />
                  </FieldGroup>

                  {formHasGuide && (
                    <FieldGroup label="입력 폼 안내 문구">
                      <Textfield
                        placeholder={samplePlaceholderFor(form.type)}
                        value={form.guideText}
                        onChange={(e) => setForm({ guideText: e.target.value })}
                      />
                    </FieldGroup>
                  )}

                  {formHasTime && (
                    <FieldGroup label="입력 폼 시간 안내 문구">
                      <Textfield
                        placeholder={sampleTimePlaceholderFor(form.type)}
                        value={form.timeGuideText}
                        onChange={(e) => setForm({ timeGuideText: e.target.value })}
                      />
                    </FieldGroup>
                  )}

                  {formHasOptions && (
                    <FieldGroup label="선택 값">
                      <div className="cmc-options">
                        {form.options.map((o, i) => (
                          <div key={o.id} className="cmc-option-row">
                            <div className="cmc-option-row__input">
                              <Textfield
                                placeholder={`옵션 ${i + 1}`}
                                value={o.label}
                                onChange={(e) => updateFormOption(o.id, e.target.value)}
                              />
                            </div>
                            <div className="cmc-option-row__remove">
                              <IconButtonNormal
                                aria-label="선택 값 삭제"
                                color="var(--color-label-alternative)"
                                disabled={form.options.length <= 1}
                                onClick={() => removeFormOption(o.id)}
                                icon={<Icon name="close" size={20} />}
                              />
                            </div>
                          </div>
                        ))}
                        <div style={{ display: 'flex' }}>
                          <TextButton
                            color="primary"
                            size="small"
                            label="선택 값 추가"
                            leadingIcon={<Icon name="plus" size={16} />}
                            onClick={addFormOption}
                          />
                        </div>
                      </div>
                    </FieldGroup>
                  )}
                </SectionCard>
              </NumberedSection>
            )}

            {/* 5. Button */}
            {!isInputForm && (
              <NumberedSection icon="component">
                <SwitchRow label="버튼" active={activeCard.buttonOn} onChange={toggleCard('buttonOn')} />
                {activeCard.buttonOn && (
                  <SectionCard>
                    <CheckBlock
                      checked={activeCard.mainOn}
                      onChange={toggleCardChild('mainOn', 'buttonOn', ['mainOn', 'subOn'])}
                      label="메인 버튼"
                    >
                      <FieldGroup label="버튼명">
                        <Textfield
                          placeholder={PH.mainLabel}
                          value={activeCard.mainLabel}
                          onChange={(e) => setCardText('mainLabel')(e.target.value)}
                        />
                      </FieldGroup>
                      <FieldGroup label="연결응답">
                        <Select placeholder="값" />
                      </FieldGroup>
                    </CheckBlock>

                    <CheckBlock
                      checked={activeCard.subOn}
                      onChange={toggleCardChild('subOn', 'buttonOn', ['mainOn', 'subOn'])}
                      label="서브 버튼"
                    >
                      <FieldGroup label="버튼명">
                        <Textfield
                          placeholder={PH.subLabel}
                          value={activeCard.subLabel}
                          onChange={(e) => setCardText('subLabel')(e.target.value)}
                        />
                      </FieldGroup>
                      <FieldGroup label="연결응답">
                        <Select placeholder="값" />
                      </FieldGroup>
                    </CheckBlock>
                  </SectionCard>
                )}
              </NumberedSection>
            )}

            {/* 6. Message Banner */}
            <NumberedSection icon="megaphone">
              <SwitchRow label="메시지 배너" active={cfg.messageBannerOn} onChange={toggle('messageBannerOn')} />
              {cfg.messageBannerOn && <FileUploadCard value={bannerFile} onChange={setBannerFile} />}
            </NumberedSection>

            {/* 7. Quick Button */}
            <NumberedSection icon="thunder">
              <SwitchRow label="퀵 버튼" active={cfg.quickButtonOn} onChange={toggle('quickButtonOn')} />
              {cfg.quickButtonOn && (
                <SectionCard>
                  {quickList.map((item, idx) => (
                    <QuickButtonItem
                      key={item.id}
                      index={idx}
                      label={item.label}
                      onLabelChange={(v) => updateQuick(item.id, v)}
                      onRemove={() => removeQuick(item.id)}
                    />
                  ))}
                  <div style={{ display: 'flex' }}>
                    <TextButton
                      color="primary"
                      size="small"
                      label="버튼 추가"
                      leadingIcon={<Icon name="plus" size={16} />}
                      onClick={addQuick}
                    />
                  </div>
                </SectionCard>
              )}
            </NumberedSection>
          </>
        )}
      </div>
    </div>
  )
}
