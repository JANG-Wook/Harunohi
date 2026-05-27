// 시뮬레이터 좌측 챗 영역 — DS 의 ChatRoom 을 사용해 실제 챗 화면과 동일한 비주얼.
//
// session.history → ChatRoom messages 매핑, ChatRoom 의 onMessageAction → 런타임 clickButton.
// 챗 입력창은 Phase 1 에서 텍스트 기반 분기 미지원이라 CSS 로 숨김 (reference 5.3 패턴).

import { useMemo } from 'react'
import ChatRoom from '../design-system/components/ChatRoom/ChatRoom.jsx'
import { getImageUrl, hasImage, PH } from '../lib/chatMessageDefaults.js'
import './SimulatorChat.css'

const botAvatar = '/T1_parksy/bot-avatar.svg'

/** 응답(step) 의 messageConfig → ChatRoom 봇 메시지 객체로 변환.
 *  ChatMessagePreview 의 매핑 로직과 같은 규약 (PH placeholder, perMode extras, mode 등). */
function responseToChatMessage(messageId, response, { disabled, timestamp }) {
  const cfg = response.messageConfig
  if (!cfg || !cfg.cfg?.messageOn) {
    // 메시지 토글이 꺼진 응답 — 안내만 표시
    return {
      id: messageId,
      type: 'bot',
      botName: response.name || '챗봇',
      avatarSrc: botAvatar,
      mode: 'single',
      messageOn: false,
      title: '(메시지 토글이 꺼져 있어 표시할 내용이 없습니다)',
      titleOn: true,
      textOn: true,
      bodyOn: false,
      buttonOn: false,
      timestamp,
      disabled,
    }
  }

  const { cfg: c, texts = {}, imageFile, mode, carouselCards = [], form } = cfg
  const perMode = cfg.perMode?.[mode]

  // 캐로셀 카드 → ChatRoom 캐로셀 카드 형식으로 매핑
  const cards = carouselCards.map((card) => ({
    id: card.id,
    title: card.title?.trim() || PH.title,
    body: card.body?.trim() || PH.body,
    mainButton: card.mainLabel?.trim() || PH.mainLabel,
    subButton: card.subLabel?.trim() || PH.subLabel,
    imageSrc: getImageUrl(card.imageFile) || undefined,
    imageOn: card.imageOn && hasImage(card.imageFile),
    textOn: card.textOn,
    buttonOn: card.buttonOn,
    titleOn: card.titleOn,
    bodyOn: card.bodyOn,
    mainOn: card.mainOn,
    subOn: card.subOn,
  }))

  return {
    id: messageId,
    type: 'bot',
    botName: response.name || '챗봇',
    avatarSrc: botAvatar,
    mode,
    title: texts.title?.trim() || PH.title,
    body: texts.body?.trim() || PH.body,
    accordionText: texts.accordion?.trim() || PH.accordion,
    mainButton: texts.mainLabel?.trim() || PH.mainLabel,
    subButton: texts.subLabel?.trim() || PH.subLabel,
    imageSrc: getImageUrl(imageFile) || undefined,
    imageOn: c.imageOn && hasImage(imageFile),
    textOn: c.textOn,
    buttonOn: c.buttonOn,
    titleOn: c.titleOn,
    bodyOn: c.bodyOn,
    accordionOn: c.accordionOn,
    mainOn: c.mainOn,
    subOn: c.subOn,
    carouselCards: cards,
    quickItems: (perMode?.quickList ?? []).map((q) => q.label?.trim() || PH.quickItem),
    quickButtonOn: !!perMode?.quickButtonOn,
    messageBannerOn: !!perMode?.messageBannerOn,
    bannerSrc: getImageUrl(perMode?.bannerFile) || undefined,
    formDescription: form?.description ?? '',
    formPlaceholder: form?.guideText ?? '',
    formTimePlaceholder: form?.timeGuideText ?? '',
    formType: form?.type ?? 'textfield',
    formOptions: form?.options ?? [],
    timestamp,
    disabled,
  }
}

/** session.history → ChatRoom messages 배열.
 *  ChatRoom 은 user/bot 두 타입만 인식. 시스템 안내는 user 타입에 시각 구분 텍스트로 변환. */
function buildChatRoomMessages(session) {
  // 마지막 bot 이벤트가 활성. 그 이전 bot 메시지는 disabled.
  let lastBotIdx = -1
  for (let i = session.history.length - 1; i >= 0; i--) {
    if (session.history[i].kind === 'bot') {
      lastBotIdx = i
      break
    }
  }

  return session.history.map((ev, idx) => {
    if (ev.kind === 'bot') {
      // messageId 는 idx 기반으로 유니크 (responseId 재방문 가능)
      return responseToChatMessage(`bot-${idx}`, ev.response, {
        disabled: idx !== lastBotIdx || session.ended,
        timestamp: '',
      })
    }
    if (ev.kind === 'user-click') {
      return { id: `user-${idx}`, type: 'user', text: ev.label }
    }
    if (ev.kind === 'user-utterance') {
      return { id: `utt-${idx}`, type: 'user', text: ev.text }
    }
    // system → user 타입의 가벼운 시스템 메시지로 표현 (ChatRoom 의 type 제한 회피)
    return { id: `sys-${idx}`, type: 'user', text: `· ${ev.text} ·` }
  })
}

export default function SimulatorChat({ session, onClickButton, onSendUtterance, botName = '챗봇' }) {
  const messages = useMemo(() => buildChatRoomMessages(session), [session])

  /** ChatRoom 의 onMessageAction → 활성 응답의 (label, link) 를 추출해 runtime clickButton 호출 */
  const handleAction = (messageId, action) => {
    // messageId = `bot-${idx}` — 그 idx 의 bot 이벤트만 처리 (이미 disabled 처리되었어야 정상)
    const m = /^bot-(\d+)$/.exec(messageId)
    if (!m) return
    const idx = Number(m[1])
    const ev = session.history[idx]
    if (!ev || ev.kind !== 'bot' || session.ended) return
    const cfg = ev.response.messageConfig
    if (!cfg) return

    let label = ''
    let link = null
    if (action.kind === 'main') {
      label = cfg.texts?.mainLabel || '메인 버튼'
      link = cfg.texts?.mainLink
    } else if (action.kind === 'sub') {
      label = cfg.texts?.subLabel || '서브 버튼'
      link = cfg.texts?.subLink
    } else if (action.kind === 'quick') {
      const q = cfg.perMode?.[cfg.mode]?.quickList?.[action.index]
      label = q?.label || '퀵 버튼'
      link = q?.link
    } else if (action.kind === 'card-main') {
      const card = cfg.carouselCards?.[action.index]
      label = card?.mainLabel || '메인 버튼'
      link = card?.mainLink
    } else if (action.kind === 'card-sub') {
      const card = cfg.carouselCards?.[action.index]
      label = card?.subLabel || '서브 버튼'
      link = card?.subLink
    } else {
      // form-submit 등 — Phase 1 에서는 지원 안 함
      return
    }
    onClickButton(label, link)
  }

  return (
    <div className="sim-chat">
      <ChatRoom
        title={botName}
        initialMessages={messages}
        onMessageAction={handleAction}
        onSend={(text) => onSendUtterance?.(text)}
        resetDisabled
        closeDisabled
      />
    </div>
  )
}
