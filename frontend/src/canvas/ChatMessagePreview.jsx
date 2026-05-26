// 챗봇 메시지 미리보기 — config 를 받아 폰 프레임 + ChatRoom 으로 렌더링
//
// compact=true 면 ChatRoom 의 chrome(상태바·헤더·입력창)을 숨기고 사용자 메시지도 제거 —
// 캔버스 워크스페이스에서 봇 응답만 깔끔하게 보여주기 위한 모드.

import { useMemo } from 'react'
import ChatRoom from '../design-system/components/ChatRoom/ChatRoom.jsx'
import {
  PH,
  defaultPerModeExtras,
  sampleDescFor,
  samplePlaceholderFor,
  sampleTimePlaceholderFor,
} from '../lib/chatMessageDefaults.js'
import chatbotImg from '/T1_parksy/Chatbot img.png'
import chatbotBanner from '/T1_parksy/Chatbot Banner.png'
import './ChatMessagePreview.css'

// SVG 는 public 폴더에서 URL 문자열로 직접 참조 (svgr 변환 우회)
const botAvatar = '/T1_parksy/bot-avatar.svg'

const DEFAULT_HEIGHT = '780px'

export default function ChatMessagePreview({ config, height = DEFAULT_HEIGHT, compact = false }) {
  const { cfg, mode, texts, carouselCards, form } = config

  /* 모드별 message-level 부가 설정 (배너 + 퀵 버튼) */
  const modeExtras = config.perMode?.[mode] ?? defaultPerModeExtras()
  const { quickList, messageBannerOn, quickButtonOn } = modeExtras

  const isCarousel = mode === 'carousel'

  const quickPreview = useMemo(() => {
    if (!quickList || quickList.length === 0) return [PH.quickItem]
    return quickList.map((it) => it.label.trim() || PH.quickItem)
  }, [quickList])

  const carouselPreview = useMemo(
    () =>
      carouselCards.map((c) => ({
        id: c.id,
        title: c.title.trim() || PH.title,
        body: c.body.trim() || PH.body,
        mainButton: c.mainLabel.trim() || PH.mainLabel,
        subButton: c.subLabel.trim() || PH.subLabel,
        imageSrc: chatbotImg,
        imageOn: c.imageOn,
        textOn: c.textOn,
        buttonOn: c.buttonOn,
        titleOn: c.titleOn,
        bodyOn: c.bodyOn,
        mainOn: c.mainOn,
        subOn: c.subOn,
      })),
    [carouselCards],
  )

  const initialMessages = useMemo(
    () => [
      ...(compact ? [] : [{ id: 'u1', type: 'user', text: '안녕하세요' }]),
      {
        id: 'b1',
        type: 'bot',
        botName: '챗봇 이름',
        avatarSrc: botAvatar,
        mode,
        carouselCards: isCarousel ? carouselPreview : undefined,
        formDescription: form.description.trim() || sampleDescFor(form.type),
        formPlaceholder: form.guideText.trim() || samplePlaceholderFor(form.type),
        formTimePlaceholder: form.timeGuideText.trim() || sampleTimePlaceholderFor(form.type),
        formType: form.type,
        formOptions: form.options.map((o) => ({ ...o, label: o.label.trim() || `옵션 ${o.id}` })),
        title: texts.title.trim() || PH.title,
        body: texts.body.trim() || PH.body,
        accordionText: texts.accordion.trim() || PH.accordion,
        mainButton: texts.mainLabel.trim() || PH.mainLabel,
        subButton: texts.subLabel.trim() || PH.subLabel,
        timestamp: '09:41',
        imageSrc: chatbotImg,
        bannerSrc: chatbotBanner,
        quickItems: quickPreview,
        imageOn: cfg.imageOn,
        textOn: cfg.textOn,
        buttonOn: cfg.buttonOn,
        titleOn: cfg.titleOn,
        bodyOn: cfg.bodyOn,
        accordionOn: cfg.accordionOn,
        mainOn: cfg.mainOn,
        subOn: cfg.subOn,
        messageBannerOn,
        quickButtonOn,
      },
    ],
    [
      cfg,
      texts,
      quickPreview,
      mode,
      isCarousel,
      carouselPreview,
      form,
      compact,
      messageBannerOn,
      quickButtonOn,
    ],
  )

  return (
    <div
      className={['chat-msg-preview', compact && 'chat-msg-preview--compact'].filter(Boolean).join(' ')}
      style={compact ? undefined : { height }}
    >
      <ChatRoom
        title="챗봇 이름"
        initialMessages={cfg.messageOn ? initialMessages : []}
        resetDisabled
      />
    </div>
  )
}
