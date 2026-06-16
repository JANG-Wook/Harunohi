// 응답(messageConfig) → ChatRoom 봇 메시지 객체 변환 — 시뮬레이터/대화방 미리보기 공용.
//
// ChatMessagePreview 의 매핑 규약 + 변수 치환을 따른다. 봇 이름/아바타는 기본값을 두되,
// 호출부에서 반환 객체를 spread 해 botName/avatarSrc 를 덮어쓸 수 있다(대화방 미리보기).

import { getImageUrl, hasImage, PH } from './chatMessageDefaults.js'
import { isRunsEmpty, mapRunsText } from './richText.js'
import { interpolate } from './templateEngine.js'

const botAvatar = '/T1_parksy/bot-avatar.svg'

/** 응답(step) 의 messageConfig → ChatRoom 봇 메시지 객체로 변환.
 *  ChatMessagePreview 의 매핑 로직과 같은 규약 + 변수 치환 적용. */
export function responseToChatMessage(messageId, response, { disabled, timestamp, variables = [], botName = '챗봇' }) {
  // 짧은 헬퍼 — 모든 텍스트 필드에 변수 치환
  const I = (s) => interpolate(s, variables)
  // 리치 텍스트(runs/평문) — run 별로 변수 치환(굵기 보존), 비었으면 placeholder 평문
  const R = (v, ph) => (isRunsEmpty(v) ? ph : mapRunsText(v, I))
  const cfg = response.messageConfig
  if (!cfg || !cfg.cfg?.messageOn) {
    // 메시지 토글이 꺼진 응답 — 안내만 표시
    return {
      id: messageId,
      type: 'bot',
      botName: '챗봇 이름',
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

  // 캐로셀 카드 → ChatRoom 캐로셀 카드 형식으로 매핑 (텍스트는 모두 변수 치환)
  const cards = carouselCards.map((card) => ({
    id: card.id,
    title: R(card.title, PH.title),
    body: R(card.body, PH.body),
    mainButton: I(card.mainLabel?.trim()) || PH.mainLabel,
    subButton: I(card.subLabel?.trim()) || PH.subLabel,
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
    botName: '챗봇 이름',
    avatarSrc: botAvatar,
    mode,
    title: R(texts.title, PH.title),
    body: R(texts.body, PH.body),
    accordionText: R(texts.accordion, PH.accordion),
    mainButton: I(texts.mainLabel?.trim()) || PH.mainLabel,
    subButton: I(texts.subLabel?.trim()) || PH.subLabel,
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
    quickItems: (perMode?.quickList ?? []).map((q) => I(q.label?.trim()) || PH.quickItem),
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
