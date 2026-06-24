// 챗봇 메시지 미리보기 — config 를 받아 폰 프레임 + ChatRoom 으로 렌더링
//
// compact=true 면 ChatRoom 의 chrome(상태바·헤더·입력창)을 숨기고 사용자 메시지도 제거 —
// 캔버스 워크스페이스에서 봇 응답만 깔끔하게 보여주기 위한 모드.

import { useMemo } from 'react'
import ChatRoom from '../design-system/components/ChatRoom/ChatRoom.jsx'
import {
  defaultPerModeExtras,
  getImageUrl,
  hasImage,
  sampleDescFor,
  samplePlaceholderFor,
  sampleTimePlaceholderFor,
} from '../lib/chatMessageDefaults.js'
import { isRunsEmpty, toRuns } from '../lib/richText.js'
import { useLauncherUi } from './launcherUiContext.js'
import './ChatMessagePreview.css'

// SVG 는 public 폴더에서 URL 문자열로 직접 참조 (svgr 변환 우회)
const botAvatar = '/T1_parksy/bot-avatar.svg'

// 텍스트(runs/평문)를 렌더용으로 정규화 — 비었으면 '' 로 보내 BotTextArea 가 숨기게 함
const rich = (v) => (isRunsEmpty(v) ? '' : toRuns(v))

const DEFAULT_HEIGHT = '780px'

export default function ChatMessagePreview({ config, height = DEFAULT_HEIGHT, compact = false }) {
  const { cfg, mode, texts, imageFile, carouselCards, form } = config
  // 적용된 런처(챗봇 설정)의 대화방 UI — 없으면 기본 챗룸
  const launcherUi = useLauncherUi()

  /* 모드별 message-level 부가 설정 (배너 + 퀵 버튼) */
  const modeExtras = config.perMode?.[mode] ?? defaultPerModeExtras()
  const { quickList, messageBannerOn, quickButtonOn, bannerFile } = modeExtras

  const isCarousel = mode === 'carousel'

  // 빈 값은 빈 대로 — placeholder 폴백 없음. 빈 라벨 퀵 버튼은 제외.
  const quickPreview = useMemo(() => {
    if (!quickList) return []
    return quickList.map((it) => it.label.trim()).filter(Boolean)
  }, [quickList])

  const carouselPreview = useMemo(
    () =>
      carouselCards.map((c) => ({
        id: c.id,
        title: rich(c.title),
        body: rich(c.body),
        mainButton: c.mainLabel.trim(),
        subButton: c.subLabel.trim(),
        imageSrc: getImageUrl(c.imageFile),
        imageOn: c.imageOn && hasImage(c.imageFile),
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
        title: rich(texts.title),
        body: rich(texts.body),
        accordionText: rich(texts.accordion),
        mainButton: texts.mainLabel.trim(),
        subButton: texts.subLabel.trim(),
        timestamp: '09:41',
        imageSrc: getImageUrl(imageFile),
        bannerSrc: getImageUrl(bannerFile),
        quickItems: quickPreview,
        imageOn: cfg.imageOn && hasImage(imageFile),
        textOn: cfg.textOn,
        buttonOn: cfg.buttonOn,
        titleOn: cfg.titleOn,
        bodyOn: cfg.bodyOn,
        accordionOn: cfg.accordionOn,
        mainOn: cfg.mainOn,
        subOn: cfg.subOn,
        messageBannerOn: messageBannerOn && hasImage(bannerFile),
        quickButtonOn: quickButtonOn && quickPreview.length > 0,
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
      imageFile,
      bannerFile,
    ],
  )

  // 런처 적용 시 — 봇 메시지의 프로필(이름/아바타)을 런처 챗봇 프로필로 교체
  const messages = useMemo(() => {
    if (!launcherUi) return initialMessages
    return initialMessages.map((m) =>
      m.type === 'bot'
        ? { ...m, botName: launcherUi.botName, avatarSrc: launcherUi.avatarSrc, showAvatar: launcherUi.showAvatar }
        : m,
    )
  }, [initialMessages, launcherUi])

  // 헤더 제목 — 런처 대화방 이름(켜짐+값 있을 때), 미적용이면 기본
  const title = launcherUi
    ? (launcherUi.chatroom.roomTitleOn ? launcherUi.chatroom.roomTitle : '')
    : '챗봇 이름'

  // 프라이머리(라이트/다크 스코프) + 대화방 배경을 루트에 주입 — 콘솔 미적용
  const rootStyle = {
    ...(compact ? {} : { height }),
    ...(launcherUi
      ? {
          '--cr-primary-light': launcherUi.primaryLight,
          '--cr-primary-dark': launcherUi.primaryDark,
          ...(launcherUi.bgColor ? { '--cr-bg': launcherUi.bgColor } : {}),
          ...(launcherUi.bgImage ? { '--cr-bg-image': `url(${launcherUi.bgImage})` } : {}),
        }
      : {}),
  }

  return (
    <div
      className={['chat-msg-preview', compact && 'chat-msg-preview--compact'].filter(Boolean).join(' ')}
      style={rootStyle}
    >
      <ChatRoom
        title={title}
        placeholder={launcherUi?.inputPlaceholder || undefined}
        initialMessages={cfg.messageOn ? messages : []}
        headerBgColor={launcherUi?.headerBgColor}
        footerBgColor={launcherUi?.footerBgColor}
        inputBgColor={launcherUi?.inputBgColor}
        bubbleStyle={launcherUi?.bubbleStyle}
        resetDisabled
      />
    </div>
  )
}
