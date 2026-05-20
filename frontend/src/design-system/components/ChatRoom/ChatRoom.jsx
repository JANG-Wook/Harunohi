// 채팅방 UI 컴포넌트 — 상태바, 헤더, 콘텐츠 영역, 메시지 입력창으로 구성

import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import Icon from '../Icon/Icon'
import Avatar from '../Avatar/Avatar'
import Button from '../Button/Button'
import TextButton from '../TextButton/TextButton'
import Chip from '../Chip/Chip'
import Thumbnail from '../Thumbnail/Thumbnail'
import IconButtonSolid from '../IconButton/IconButtonSolid'
import IconButtonNormal from '../IconButton/IconButtonNormal'
import Radio from '../Radio/Radio'
import Checkbox from '../Checkbox/Checkbox'
import Textfield from '../Textfield/Textfield'
import Textarea from '../Textfield/Textarea'
import Select from '../Select/Select'
import Menu from '../Menu/Menu'
import DateInput from '../DateTimePicker/DateInput'
import TimeInput from '../DateTimePicker/TimeInput'
import companyAvatar from '/T1_parksy/Company.jpg'

function StatusIconSignal() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
      <rect x="0"    y="8"   width="3" height="4"   rx="0.5" />
      <rect x="4.5"  y="5.5" width="3" height="6.5" rx="0.5" />
      <rect x="9"    y="3"   width="3" height="9"   rx="0.5" />
      <rect x="13.5" y="0"   width="3" height="12"  rx="0.5" />
    </svg>
  )
}

function StatusIconWifi() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
      <circle cx="8" cy="11" r="1.5" />
      <path fillRule="evenodd" d="M8 7a4.5 4.5 0 00-3.18 1.32L3.4 6.9A6.5 6.5 0 018 5a6.5 6.5 0 014.6 1.9l-1.42 1.42A4.5 4.5 0 008 7z" />
      <path fillRule="evenodd" d="M8 3.5A8.5 8.5 0 001.48 6.03L0 4.55A10.5 10.5 0 018 1.5c3 0 5.72 1.24 7.67 3.24l-1.48 1.48A8.5 8.5 0 008 3.5z" opacity="0.6" />
    </svg>
  )
}

function StatusIconBattery() {
  return (
    <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
      <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" strokeOpacity="0.35" />
      <rect x="2" y="2" width="18" height="8" rx="2" fill="currentColor" />
      <path d="M23 4.5v3c1-.5 1-2.5 0-3z" fill="currentColor" fillOpacity="0.4" />
    </svg>
  )
}

function ChatStatusBar() {
  return (
    <div style={{
      height:          '44px',
      padding:         '0 var(--spacing-20)',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'space-between',
      flexShrink:      0,
      backgroundColor: 'var(--color-bg-normal)',
      color:           'var(--color-label-strong)',
    }}>
      <span style={{
        fontSize:   'var(--font-size-caption-1)',
        fontWeight: 'var(--font-weight-semibold)',
      }}>9:41</span>
      <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}>
        <StatusIconSignal />
        <StatusIconWifi />
        <StatusIconBattery />
      </div>
    </div>
  )
}

function ChatHeader({ title, onReset, onClose, resetDisabled = false, closeDisabled = false }) {
  return (
    <div style={{
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'space-between',
      padding:        'var(--spacing-8) var(--spacing-12)',
      flexShrink:     0,
    }}>
      <IconButtonNormal
        aria-label="대화 초기화"
        onClick={onReset}
        disabled={resetDisabled}
        icon={<Icon name="reset" size={24} />}
      />
      <span style={{
        fontSize:      'var(--font-size-body-2)',
        lineHeight:    'var(--line-height-body-2-normal)',
        fontWeight:    'var(--font-weight-medium)',
        color:         'var(--color-label-neutral)',
        letterSpacing: 'var(--letter-spacing-body-2)',
      }}>{title}</span>
      <IconButtonNormal
        aria-label="채팅방 닫기"
        onClick={onClose}
        disabled={closeDisabled}
        icon={<Icon name="close" size={24} />}
      />
    </div>
  )
}

function BotTextArea({ title, body, accordionText = '추가 안내 내용입니다. 더 자세한 정보를 확인하세요.', titleOn = true, bodyOn = true, accordionOn = true }) {
  const [expanded, setExpanded] = useState(false)
  const showTitle = titleOn && title
  const showBody  = bodyOn && body

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-16)', width: '100%' }}>
      {(showTitle || showBody) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', width: '100%' }}>
          {showTitle && (
            <p style={{
              fontSize:      'var(--font-size-body-2)',
              lineHeight:    'var(--line-height-body-2-normal)',
              fontWeight:    'var(--font-weight-bold)',
              color:         'var(--color-label-neutral)',
              letterSpacing: 'var(--letter-spacing-heading-1)',
              wordBreak:     'break-word',
              margin:        0,
            }}>{title}</p>
          )}
          {showBody && (
            <p style={{
              fontSize:      'var(--font-size-body-2)',
              lineHeight:    'var(--line-height-body-2-normal)',
              fontWeight:    'var(--font-weight-regular)',
              color:         'var(--color-label-neutral)',
              letterSpacing: 'var(--letter-spacing-heading-1)',
              wordBreak:     'break-word',
              whiteSpace:    'pre-wrap',
              margin:        0,
            }}>{body}</p>
          )}
        </div>
      )}
      {accordionOn && expanded && (
        <p style={{
          fontSize:      'var(--font-size-body-2)',
          lineHeight:    'var(--line-height-body-2-normal)',
          fontWeight:    'var(--font-weight-regular)',
          color:         'var(--color-label-neutral)',
          letterSpacing: 'var(--letter-spacing-heading-1)',
          wordBreak:     'break-word',
          whiteSpace:    'pre-wrap',
          margin:        0,
        }}>{accordionText}</p>
      )}
      {accordionOn && (
        <div style={{ display: 'flex', width: '100%' }}>
          <TextButton
            color="assistive"
            size="small"
            label={expanded ? '접기' : '더 보기'}
            trailingIcon={
              <Icon name={expanded ? 'chevronUpSmall' : 'chevronDownSmall'} size={16} />
            }
            onClick={() => setExpanded(v => !v)}
            className="chatroom-fullwidth-btn"
          />
        </div>
      )}
    </div>
  )
}

function FullWidthButton({ variant, label }) {
  return (
    <div style={{ display: 'flex', width: '100%' }}>
      <Button variant={variant} color="primary" size="large" label={label} className="chatroom-fullwidth-btn" />
    </div>
  )
}

function BotButtonArea({ mainButton, subButton, mainOn = true, subOn = true }) {
  const showMain = mainOn && mainButton
  const showSub  = subOn && subButton
  if (!showMain && !showSub) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)', width: '100%' }}>
      {showMain && <FullWidthButton variant="solid" label={mainButton} />}
      {showSub  && <FullWidthButton variant="outlined" label={subButton} />}
    </div>
  )
}

function BotMessageImage({ src }) {
  return <Thumbnail src={src} alt="" ratio="7/6" radius />
}

// 헤딩 prop이 없는 컨트롤(Radio/Checkbox)용 외부 헤딩 라벨
function FormHeading({ text }) {
  if (!text) return null
  return (
    <p style={{
      fontSize:      'var(--font-size-label-1)',
      lineHeight:    'var(--line-height-label-1-normal)',
      fontWeight:    'var(--font-weight-semibold)',
      color:         'var(--color-label-normal)',
      letterSpacing: 'var(--letter-spacing-label-1)',
      wordBreak:     'break-word',
      margin:        0,
    }}>{text}</p>
  )
}

const labelOf = (options, id, fallbackIdx) => {
  const idx = options.findIndex(o => o.id === id)
  const found = idx >= 0 ? options[idx] : null
  return found?.label || `옵션 ${(idx >= 0 ? idx : fallbackIdx) + 1}`
}

function RadioGroup({ heading, options }) {
  const [selectedId, setSelectedId] = useState(options[0]?.id)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
      <FormHeading text={heading} />
      {options.map((o, i) => (
        <Radio
          key={o.id}
          label={o.label || `옵션 ${i + 1}`}
          checked={selectedId === o.id}
          onChange={() => setSelectedId(o.id)}
        />
      ))}
    </div>
  )
}

function CheckboxList({ heading, options }) {
  const [selected, setSelected] = useState(() => new Set(options[0] ? [options[0].id] : []))
  const toggle = id => setSelected(prev => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id)
    else              next.add(id)
    return next
  })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
      <FormHeading text={heading} />
      {options.map((o, i) => (
        <Checkbox
          key={o.id}
          label={o.label || `옵션 ${i + 1}`}
          state={selected.has(o.id) ? 'checked' : 'unchecked'}
          onChange={() => toggle(o.id)}
        />
      ))}
    </div>
  )
}

function InteractiveSelect({ heading, options, mode, placeholder = '값 선택' }) {
  const [open, setOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handlePick = id => {
    if (mode === 'multi') {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    } else {
      setSelectedIds([id])
      setOpen(false)
    }
  }

  const visibleChips = selectedIds
    .filter(id => options.some(o => o.id === id))
    .map(id => labelOf(options, id, 0))

  const singleLabel = selectedIds[0] && options.some(o => o.id === selectedIds[0])
    ? labelOf(options, selectedIds[0], 0)
    : ''

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {mode === 'multi' ? (
        <Select
          heading={heading}
          render="chip"
          value={visibleChips}
          placeholder={placeholder}
          onClick={() => setOpen(o => !o)}
          forceFocused={open}
          onRemoveChip={chipValue => setSelectedIds(prev => prev.filter(id => labelOf(options, id, 0) !== chipValue))}
        />
      ) : (
        <Select
          heading={heading}
          value={singleLabel}
          placeholder={placeholder}
          onClick={() => setOpen(o => !o)}
          forceFocused={open}
        />
      )}
      {open && (
        <div style={{
          position: 'absolute',
          top:      'calc(100% + var(--spacing-4))',
          left:     0,
          right:    0,
          zIndex:   10,
        }}>
          <Menu
            variant="normal"
            cellPadding="12px"
            items={options.map((o, i) => ({
              label:    o.label || `옵션 ${i + 1}`,
              active:   selectedIds.includes(o.id),
              onClick:  () => handlePick(o.id),
            }))}
          />
        </div>
      )}
    </div>
  )
}

// 미리보기용 — DateInput을 로컬 state로 감싼 래퍼 (대화방 폭에 맞게 100%)
function DateInputLocal({ heading, placeholder }) {
  const [val, setVal] = useState(null)
  return <DateInput heading={heading} placeholder={placeholder} value={val} onChange={setVal} calendarWidth="100%" />
}

// 미리보기용 — Date + Time 입력을 함께 표시
function DateTimeInputLocal({ heading, placeholder, timePlaceholder }) {
  const [date, setDate] = useState(null)
  const [time, setTime] = useState(null)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
      <DateInput heading={heading} placeholder={placeholder} value={date} onChange={setDate} calendarWidth="100%" />
      <TimeInput value={time} onChange={setTime} placeholder={timePlaceholder || '시간 선택'} />
    </div>
  )
}

// 미리보기용 — 기간 선택 DateInput
function DateRangeInputLocal({ heading, placeholder }) {
  const [range, setRange] = useState(null)
  return (
    <DateInput
      mode="range"
      heading={heading}
      placeholder={placeholder}
      value={range}
      onChange={setRange}
      calendarWidth="100%"
    />
  )
}

// 입력 폼 컨트롤 (유형별 분기) — heading은 컴포넌트의 heading prop 우선 사용
function FormControl({ type, options = [], heading, placeholder, timePlaceholder }) {
  switch (type) {
    case 'boolean':
    case 'checkboxSingle':
      return <RadioGroup heading={heading} options={options} />
    case 'checkboxMulti':
      return <CheckboxList heading={heading} options={options} />
    case 'textfield':
      return <Textfield heading={heading} placeholder={placeholder} />
    case 'number':
      return <Textfield heading={heading} type="number" placeholder={placeholder} />
    case 'textarea':
      return <Textarea heading={heading} placeholder={placeholder} resize="fixed" />
    case 'date':
      return <DateInputLocal heading={heading} placeholder={placeholder} />
    case 'datetime':
      return <DateTimeInputLocal heading={heading} placeholder={placeholder} timePlaceholder={timePlaceholder} />
    case 'dateRange':
      return <DateRangeInputLocal heading={heading} placeholder={placeholder} />
    case 'selectSingle':
      return <InteractiveSelect heading={heading} options={options} mode="single" placeholder={placeholder} />
    case 'selectMulti':
      return <InteractiveSelect heading={heading} options={options} mode="multi" placeholder={placeholder} />
    default:
      return null
  }
}

function BotInputForm({ description, placeholder, timePlaceholder, type, options }) {
  // type 변경 시 내부 state 초기화를 위해 key 사용
  return <FormControl key={type} type={type} options={options} heading={description} placeholder={placeholder} timePlaceholder={timePlaceholder} />
}

function BotMessage({
  title, body, accordionText, mainButton, subButton, imageSrc,
  imageOn = false, textOn = true, buttonOn = true,
  titleOn = true, bodyOn = true, accordionOn = true,
  mainOn = true, subOn = true,
  messageMode = 'single',
  formDescription, formPlaceholder, formTimePlaceholder, formType, formOptions,
}) {
  const isInputForm = messageMode === 'inputForm'
  const hasText   = textOn && (titleOn || bodyOn || (accordionOn && !isInputForm))
  const hasButton = !isInputForm && buttonOn && ((mainOn && mainButton) || (subOn && subButton))
  const showImage = !isInputForm && imageOn
  if (!showImage && !hasText && !hasButton && !isInputForm) return null
  return (
    <div style={{
      border:          '1px solid var(--color-line-solid-normal)',
      borderRadius:    'var(--spacing-12)',
      padding:         'var(--spacing-20)',
      display:         'flex',
      flexDirection:   'column',
      gap:             'var(--spacing-16)',
      width:           '100%',
      backgroundColor: 'var(--color-bg-normal)',
      boxSizing:       'border-box',
    }}>
      {showImage && <BotMessageImage src={imageSrc} />}
      {hasText && (
        <BotTextArea
          title={title}
          body={body}
          accordionText={accordionText}
          titleOn={titleOn}
          bodyOn={bodyOn}
          accordionOn={accordionOn && !isInputForm}
        />
      )}
      {isInputForm && (
        <>
          <BotInputForm description={formDescription} placeholder={formPlaceholder} timePlaceholder={formTimePlaceholder} type={formType} options={formOptions} />
          <FullWidthButton variant="solid" label="확인" />
        </>
      )}
      {hasButton && (
        <BotButtonArea
          mainButton={mainButton}
          subButton={subButton}
          mainOn={mainOn}
          subOn={subOn}
        />
      )}
    </div>
  )
}

// 캐로셀 카드 — 280px 폭, 240×240 정사각형 이미지, 아코디언 없음
function CarouselCard({
  title, body, mainButton, subButton, imageSrc,
  imageOn = false, textOn = true, buttonOn = true,
  titleOn = true, bodyOn = true,
  mainOn = true, subOn = true,
}) {
  const hasText   = textOn && (titleOn || bodyOn)
  const hasButton = buttonOn && ((mainOn && mainButton) || (subOn && subButton))
  if (!imageOn && !hasText && !hasButton) return null
  return (
    <div style={{
      border:          '1px solid var(--color-line-solid-normal)',
      borderRadius:    'var(--spacing-12)',
      padding:         'var(--spacing-20)',
      display:         'flex',
      flexDirection:   'column',
      gap:             'var(--spacing-16)',
      width:           '280px',
      backgroundColor: 'var(--color-bg-normal)',
      boxSizing:       'border-box',
      flexShrink:      0,
    }}>
      {imageOn && <Thumbnail src={imageSrc} alt="" ratio="1/1" radius />}
      {hasText && (
        <BotTextArea
          title={title}
          body={body}
          titleOn={titleOn}
          bodyOn={bodyOn}
          accordionOn={false}
        />
      )}
      {hasButton && (
        <BotButtonArea
          mainButton={mainButton}
          subButton={subButton}
          mainOn={mainOn}
          subOn={subOn}
        />
      )}
    </div>
  )
}

// 캐로셀 컨테이너 — 가로 스크롤 + 호버 시 좌우 화살표 fade-in
function CarouselArea({ cards }) {
  const scrollRef = useRef(null)
  const [hover, setHover] = useState(false)

  if (!cards || cards.length === 0) return null

  const scrollByCard = (dir) => {
    // 카드 폭 280px + gap 8px
    scrollRef.current?.scrollBy({ left: dir * 288, behavior: 'smooth' })
  }

  const multipleCards = cards.length > 1

  const navBtnStyle = {
    position:        'absolute',
    top:             '50%',
    transform:       'translateY(-50%)',
    zIndex:          1,
    width:           'var(--spacing-32)',
    height:          'var(--spacing-32)',
    borderRadius:    'var(--radius-full)',
    backgroundColor: 'var(--color-bg-normal)',
    border:          '1px solid var(--color-line-alternative)',
    boxShadow:       'var(--shadow-normal-small)',
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    cursor:          'pointer',
    padding:         0,
    color:           'var(--color-label-normal)',
    opacity:         hover ? 1 : 0,
    pointerEvents:   hover ? 'auto' : 'none',
    transition:      'opacity 0.15s ease',
  }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: 'relative', width: '100%' }}
    >
      <div
        ref={scrollRef}
        className="scrollbar-hidden"
        style={{
          display:   'flex',
          gap:       'var(--spacing-8)',
          overflowX: 'auto',
          width:     '100%',
        }}
      >
        {cards.map(card => (
          <CarouselCard key={card.id} {...card} />
        ))}
      </div>
      {multipleCards && (
        <>
          <button
            type="button"
            aria-label="이전 카드"
            onClick={() => scrollByCard(-1)}
            style={{ ...navBtnStyle, left: 'var(--spacing-4)' }}
          >
            <Icon name="chevronLeftSmall" size={20} />
          </button>
          <button
            type="button"
            aria-label="다음 카드"
            onClick={() => scrollByCard(1)}
            style={{ ...navBtnStyle, right: 'var(--spacing-4)' }}
          >
            <Icon name="chevronRightSmall" size={20} />
          </button>
        </>
      )}
    </div>
  )
}

function MessageBanner({ src }) {
  if (!src) return null
  return (
    <div style={{
      width:        '100%',
      borderRadius: 'var(--spacing-8)',
      overflow:     'hidden',
    }}>
      <img
        src={src}
        alt=""
        draggable={false}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
    </div>
  )
}

function QuickButtonGroup({ items = ['퀵 버튼', '퀵 버튼', '퀵 버튼', '퀵 버튼'] }) {
  return (
    <div style={{
      display:    'flex',
      flexWrap:   'wrap',
      gap:        'var(--spacing-6)',
      width:      '100%',
    }}>
      {items.map((label, i) => (
        <Chip key={i} variant="outlined" size="small" label={label} />
      ))}
    </div>
  )
}

function formatTime(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function BotMessageWrapper({
  botName, title, body, accordionText, mainButton, subButton, timestamp, imageSrc, bannerSrc, quickItems, avatarSrc,
  imageOn = false, textOn = true, buttonOn = true,
  titleOn = true, bodyOn = true, accordionOn = true,
  mainOn = true, subOn = true,
  messageBannerOn = false, quickButtonOn = false,
  mode = 'single', carouselCards,
  formDescription, formPlaceholder, formTimePlaceholder, formType, formOptions,
}) {
  const avatar = avatarSrc ?? companyAvatar
  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      alignItems:    'flex-start',
      gap:           'var(--spacing-12)',
      width:         '100%',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-8)' }}>
        <Avatar variant="person" size="small" src={avatar} />
        <span style={{
          fontSize:      'var(--font-size-label-1)',
          fontWeight:    'var(--font-weight-medium)',
          lineHeight:    'var(--line-height-label-1-reading)',
          letterSpacing: 'var(--letter-spacing-heading-1)',
          color:         'var(--color-label-neutral)',
          whiteSpace:    'nowrap',
        }}>{botName}</span>
      </div>

      {mode === 'carousel' ? (
        <CarouselArea cards={carouselCards} />
      ) : (
        <BotMessage
          title={title}
          body={body}
          accordionText={accordionText}
          mainButton={mainButton}
          subButton={subButton}
          imageSrc={imageSrc}
          imageOn={imageOn}
          textOn={textOn}
          buttonOn={buttonOn}
          titleOn={titleOn}
          bodyOn={bodyOn}
          accordionOn={accordionOn}
          mainOn={mainOn}
          subOn={subOn}
          messageMode={mode}
          formDescription={formDescription}
          formPlaceholder={formPlaceholder}
          formTimePlaceholder={formTimePlaceholder}
          formType={formType}
          formOptions={formOptions}
        />
      )}

      {messageBannerOn && <MessageBanner src={bannerSrc} />}
      {quickButtonOn && <QuickButtonGroup items={quickItems} />}

      <span style={{
        fontSize:   'var(--font-size-caption-1)',
        fontWeight: 'var(--font-weight-regular)',
        lineHeight: '14px',
        color:      'var(--color-label-alternative)',
        whiteSpace: 'nowrap',
      }}>{timestamp}</span>
    </div>
  )
}

function UserMessage({ text }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '100%' }}>
      <p style={{
        fontSize:      'var(--font-size-body-1)',
        lineHeight:    'var(--line-height-body-1-normal)',
        fontWeight:    'var(--font-weight-bold)',
        color:         'var(--color-label-neutral)',
        textAlign:     'right',
        letterSpacing: 'var(--letter-spacing-heading-1)',
        wordBreak:     'break-word',
        margin:        0,
      }}>{text}</p>
    </div>
  )
}

function ActionButton({ onClick, iconName, ariaLabel, iconColor = 'var(--color-bg-normal)', bgColor = 'var(--color-line-solid-normal)' }) {
  return (
    <IconButtonSolid
      onClick={onClick}
      size="custom"
      customSize={26}
      color={iconColor}
      backgroundColor={bgColor}
      aria-label={ariaLabel}
      icon={<Icon name={iconName} size={18} color={iconColor} />}
    />
  )
}

const INPUT_CONTAINER_STYLE = {
  padding:         'var(--spacing-16) var(--spacing-20) var(--spacing-20)',
  backgroundColor: 'var(--color-bg-normal)',
  borderTop:       '1px solid var(--color-line-solid-alternative)',
  flexShrink:      0,
}

function ChatInput({ value, onChange, placeholder, onPlus, onSend }) {
  const textareaRef = useRef(null)
  const [focused, setFocused] = useState(false)
  const expanded = focused

  const handlePillClick = () => {
    setFocused(true)
  }

  const handleBlur = () => {
    setFocused(false)
  }

  if (expanded) {
    return (
      <div style={{ ...INPUT_CONTAINER_STYLE, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
        <textarea
          ref={textareaRef}
          autoFocus
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              onSend()
            }
          }}
          style={{
            height:      '72px',
            border:      'none',
            outline:     'none',
            resize:      'none',
            backgroundColor: 'transparent',
            fontSize:    'var(--font-size-body-2)',
            lineHeight:  'var(--line-height-body-2-normal)',
            color:       'var(--color-label-normal)',
            letterSpacing: 'var(--letter-spacing-body-2)',
            fontFamily:  'var(--font-family-base)',
            padding:     0,
            width:       '100%',
            boxSizing:   'border-box',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '36px' }}>
          <ActionButton onClick={onPlus} iconName="plus" ariaLabel="추가" iconColor="var(--color-bg-normal)" />
          <ActionButton
            onClick={onSend}
            iconName="sendFill"
            ariaLabel="보내기"
            iconColor="var(--color-bg-normal)"
            bgColor={value.length > 0 ? 'var(--color-primary-normal)' : 'var(--color-line-solid-normal)'}
          />
        </div>
      </div>
    )
  }

  return (
    <div style={{ ...INPUT_CONTAINER_STYLE, display: 'flex', gap: 'var(--spacing-12)', alignItems: 'center' }}>
      <ActionButton onClick={onPlus} iconName="plus" ariaLabel="추가" iconColor="var(--color-bg-normal)" />
      <div
        onClick={handlePillClick}
        style={{
          flex:            1,
          height:          '36px',
          backgroundColor: 'var(--color-bg-normal-alternative)',
          borderRadius:    '20px',
          display:         'flex',
          alignItems:      'center',
          padding:         '0 var(--spacing-16)',
          cursor:          'text',
          overflow:        'hidden',
        }}
      >
        <span style={{
          fontSize:      'var(--font-size-label-1)',
          lineHeight:    'var(--line-height-label-1-normal)',
          color:         value.length > 0 ? 'var(--color-label-normal)' : 'var(--color-label-alternative)',
          letterSpacing: 'var(--letter-spacing-label-1)',
          whiteSpace:    'nowrap',
          overflow:      'hidden',
          textOverflow:  'ellipsis',
        }}>{value.length > 0 ? value : placeholder}</span>
      </div>
      <ActionButton
        onClick={onSend}
        iconName="sendFill"
        iconColor="var(--color-bg-normal)"
        bgColor={value.length > 0 ? 'var(--color-primary-normal)' : 'var(--color-line-solid-normal)'}
      />
    </div>
  )
}

const BANNER_WRAP = {
  padding: '0 var(--spacing-20)',
  flexShrink: 0,
}

export function ChatTopBanner({ title, subtitle }) {
  return (
    <div style={BANNER_WRAP}>
      <div style={{
        display:         'flex',
        gap:             'var(--spacing-16)',
        alignItems:      'center',
        padding:         'var(--spacing-12) var(--spacing-16)',
        backgroundColor: 'var(--color-line-solid-alternative)',
        borderRadius:    'var(--spacing-8)',
      }}>
        <Icon name="megaphoneFill" size={24} color="var(--color-primary-normal)" style={{ flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', minWidth: 0 }}>
          <span style={{
            fontSize:      'var(--font-size-label-2)',
            lineHeight:    'var(--line-height-label-2)',
            color:         'var(--color-primary-heavy)',
            overflow:      'hidden',
            textOverflow:  'ellipsis',
            whiteSpace:    'nowrap',
          }}>{title}</span>
          {subtitle && (
            <span style={{
              fontSize:      'var(--font-size-label-2)',
              lineHeight:    'var(--line-height-label-2)',
              color:         'var(--color-primary-heavy)',
              overflow:      'hidden',
              textOverflow:  'ellipsis',
              whiteSpace:    'nowrap',
            }}>{subtitle}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export function ChatBottomBanner({ text }) {
  return (
    <div style={BANNER_WRAP}>
      <div style={{
        padding:         'var(--spacing-8) var(--spacing-16)',
        backgroundColor: 'var(--color-line-solid-alternative)',
        borderRadius:    'var(--spacing-8)',
        textAlign:       'center',
      }}>
        <span style={{
          fontSize:      'var(--font-size-label-2)',
          lineHeight:    'var(--line-height-label-2)',
          fontWeight:    'var(--font-weight-medium)',
          color:         'var(--color-primary-normal)',
          overflow:      'hidden',
          textOverflow:  'ellipsis',
          whiteSpace:    'nowrap',
        }}>{text}</span>
      </div>
    </div>
  )
}

export default function ChatRoom({
  title        = '인포뱅크 봇',
  placeholder  = '메시지를 입력해 주세요',
  initialValue = '',
  initialMessages,
  topBanner,
  bottomBanner,
  onReset,
  onClose,
  onPlus,
  onSend,
  resetDisabled = false,
  closeDisabled = false,
  children,
}) {
  const [inputValue, setInputValue] = useState(initialValue)
  const [messages, setMessages] = useState(initialMessages ?? [])

  useEffect(() => {
    if (initialMessages) setMessages(initialMessages)
  }, [initialMessages])
  const scrollContainerRef = useRef(null)
  const latestMsgRef = useRef(null)
  const latestUserMsgRef = useRef(null)
  const spacerRef = useRef(null)
  const pendingScrollRef = useRef(false)

  // 최신 유저 메시지가 상단으로 스크롤 가능하도록 최소 스페이서 높이 계산
  useLayoutEffect(() => {
    if (!scrollContainerRef.current || !spacerRef.current) return
    if (messages.length === 0 || !latestUserMsgRef.current) {
      spacerRef.current.style.height = '0px'
      return
    }
    const container = scrollContainerRef.current
    const containerH = container.clientHeight
    const currentSpacerH = spacerRef.current.offsetHeight
    const naturalH = container.scrollHeight - currentSpacerH
    const msgTop = latestUserMsgRef.current.getBoundingClientRect().top
      - container.getBoundingClientRect().top
      + container.scrollTop
    const needed = Math.max(0, msgTop + containerH - naturalH)
    spacerRef.current.style.height = needed + 'px'
  }, [messages])

  useLayoutEffect(() => {
    if (!pendingScrollRef.current || !latestMsgRef.current || !scrollContainerRef.current) return
    pendingScrollRef.current = false
    const container = scrollContainerRef.current
    const msg = latestMsgRef.current
    const delta = msg.getBoundingClientRect().top - container.getBoundingClientRect().top
    container.scrollTop += delta
  }, [messages.length])

  const handleSend = () => {
    const text = inputValue.trim()
    if (!text) return
    pendingScrollRef.current = true
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text }])
    setInputValue('')
    onSend?.(text)
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id:         Date.now(),
        type:       'bot',
        botName:    '인포뱅크 봇',
        title:      '챗봇 타이틀 텍스트',
        body:       '챗봇 본문 텍스트입니다. 원하시는 내용을 안내해 드리겠습니다.',
        mainButton: '메인 버튼',
        subButton:  '서브 버튼',
        timestamp:  formatTime(new Date()),
      }])
    }, 500)
  }

  const handleReset = () => {
    setMessages([])
    setInputValue('')
    onReset?.()
  }

  return (
    <div style={{
      width:           '360px',
      height:          '100%',
      display:         'flex',
      flexDirection:   'column',
      backgroundColor: 'var(--color-bg-normal)',
    }}>
      <ChatStatusBar />
      <ChatHeader title={title} onReset={handleReset} onClose={onClose} resetDisabled={resetDisabled} closeDisabled={closeDisabled} />
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        {topBanner && (
          <div style={{ position: 'absolute', top: 'var(--spacing-12)', left: 0, right: 0, zIndex: 1 }}>
            {topBanner}
          </div>
        )}
        {bottomBanner && (
          <div style={{ position: 'absolute', bottom: 'var(--spacing-12)', left: 0, right: 0, zIndex: 1 }}>
            {bottomBanner}
          </div>
        )}
        <div ref={scrollContainerRef} className="chat-room-scroll" style={{ height: '100%', overflowY: 'auto' }}>
        {messages.length > 0 && (
          <div style={{
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            gap:            'var(--spacing-20)',
            padding:        'var(--spacing-12) var(--spacing-20) var(--spacing-20)',
          }}>
            {(() => {
              const lastUserIdx = messages.reduce((acc, m, i) => m.type === 'user' ? i : acc, -1)
              return messages.map((msg, i) => {
                const assignRef = (el) => {
                  if (i === messages.length - 1) latestMsgRef.current = el
                  if (i === lastUserIdx) latestUserMsgRef.current = el
                }
                if (msg.type === 'user') {
                  return (
                    <div key={msg.id} ref={assignRef} style={{ flexShrink: 0, width: '100%' }}>
                      <UserMessage text={msg.text} />
                    </div>
                  )
                }
                if (msg.type === 'bot') {
                  return (
                    <div key={msg.id} ref={assignRef} style={{ width: '100%' }}>
                      <BotMessageWrapper
                        botName={msg.botName}
                        title={msg.title}
                        body={msg.body}
                        accordionText={msg.accordionText}
                        mainButton={msg.mainButton}
                        subButton={msg.subButton}
                        timestamp={msg.timestamp}
                        imageSrc={msg.imageSrc}
                        bannerSrc={msg.bannerSrc}
                        quickItems={msg.quickItems}
                        avatarSrc={msg.avatarSrc}
                        imageOn={msg.imageOn}
                        textOn={msg.textOn}
                        buttonOn={msg.buttonOn}
                        titleOn={msg.titleOn}
                        bodyOn={msg.bodyOn}
                        accordionOn={msg.accordionOn}
                        mainOn={msg.mainOn}
                        subOn={msg.subOn}
                        messageBannerOn={msg.messageBannerOn}
                        quickButtonOn={msg.quickButtonOn}
                        mode={msg.mode}
                        carouselCards={msg.carouselCards}
                        formDescription={msg.formDescription}
                        formPlaceholder={msg.formPlaceholder}
                        formTimePlaceholder={msg.formTimePlaceholder}
                        formType={msg.formType}
                        formOptions={msg.formOptions}
                      />
                    </div>
                  )
                }
                return null
              })
            })()}
            <div ref={spacerRef} style={{ flexShrink: 0 }} />
          </div>
        )}
        {children}
        </div>
      </div>
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        placeholder={placeholder}
        onPlus={onPlus}
        onSend={handleSend}
      />
    </div>
  )
}
