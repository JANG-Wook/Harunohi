// 시뮬레이터 좌측 챗 영역 — DS 의 ChatRoom 을 사용해 실제 챗 화면과 동일한 비주얼.
//
// session.history → ChatRoom messages 매핑, ChatRoom 의 onMessageAction → 런타임 clickButton.
// 챗 입력창은 Phase 1 에서 텍스트 기반 분기 미지원이라 CSS 로 숨김 (reference 5.3 패턴).

import { useMemo } from 'react'
import ChatRoom from '../design-system/components/ChatRoom/ChatRoom.jsx'
import { responseToChatMessage } from '../lib/chatRoomMapping.js'
import { interpolate, interpolateLink } from '../lib/templateEngine.js'
import './SimulatorChat.css'

/** session.history → ChatRoom messages 배열.
 *  ChatRoom 은 user/bot 두 타입만 인식. 시스템 안내는 user 타입에 시각 구분 텍스트로 변환.
 *  variables 는 봇 메시지 텍스트 치환에 사용. */
function buildChatRoomMessages(session, variables, botName) {
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
        variables,
        botName,
      })
    }
    if (ev.kind === 'user-click') {
      return { id: `user-${idx}`, type: 'user', text: ev.label }
    }
    if (ev.kind === 'user-utterance') {
      return { id: `utt-${idx}`, type: 'user', text: ev.text }
    }
    // system → user 타입의 가벼운 시스템 메시지로 표현 (ChatRoom 의 type 제한 회피)
    if (ev.kind === 'system') {
      return { id: `sys-${idx}`, type: 'user', text: `· ${ev.text} ·` }
    }
    // api-call / memory-update 등 디버그 이벤트는 챗에 표시하지 않음(로그·메모리 패널 전용)
    return null
  }).filter(Boolean)
}

export default function SimulatorChat({
  session,
  variables = [],
  onClickButton,
  onSubmitForm,
  onSendUtterance,
  botName = '챗봇',
  launcherUi = null,
}) {
  // 런처 적용 시 — 봇 라벨/아바타를 런처 챗봇 프로필로 교체
  const effectiveBotName = launcherUi ? launcherUi.botName : botName
  const messages = useMemo(() => {
    const built = buildChatRoomMessages(session, variables, effectiveBotName)
    if (!launcherUi) return built
    return built.map((m) =>
      m.type === 'bot'
        ? { ...m, avatarSrc: launcherUi.avatarSrc, showAvatar: launcherUi.showAvatar }
        : m,
    )
  }, [session, variables, effectiveBotName, launcherUi])

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
    } else if (action.kind === 'form-submit') {
      // 입력 폼 제출 — 부모(simulator runtime)에 raw value 전달, 정규화/메모리 저장은 runtime 책임
      onSubmitForm?.(action.value)
      return
    } else {
      return
    }
    // URL 링크는 url 필드에 변수 치환 적용 후 전달 (사용자가 {{$도메인}}/path 같은 패턴 활용 가능)
    const interpolatedLabel = interpolate(label, variables)
    const interpolatedLink = interpolateLink(link, variables)
    // URL 타입은 실제 새 창 열기로 완결 — 채팅/이벤트 로그에 발화 기록하지 않음.
    // 일반 웹페이지의 외부 링크 클릭과 동일한 사일런트 UX. noopener/noreferrer 로 보안 격리.
    if (interpolatedLink?.type === 'url' && interpolatedLink.url) {
      window.open(interpolatedLink.url, '_blank', 'noopener,noreferrer')
      return
    }
    onClickButton(interpolatedLabel, interpolatedLink)
  }

  const title = launcherUi
    ? (launcherUi.chatroom.roomTitleOn ? launcherUi.chatroom.roomTitle : '')
    : '대화방 이름'
  const rootStyle = launcherUi
    ? {
        '--cr-primary-light': launcherUi.primaryLight,
        '--cr-primary-dark': launcherUi.primaryDark,
        ...(launcherUi.bgColor ? { '--cr-bg': launcherUi.bgColor } : {}),
        ...(launcherUi.bgImage ? { '--cr-bg-image': `url(${launcherUi.bgImage})` } : {}),
      }
    : undefined

  return (
    <div className="sim-chat" style={rootStyle}>
      <ChatRoom
        title={title}
        initialMessages={messages}
        onMessageAction={handleAction}
        onSend={(text) => onSendUtterance?.(text)}
        headerBgColor={launcherUi?.headerBgColor}
        footerBgColor={launcherUi?.footerBgColor}
        inputBgColor={launcherUi?.inputBgColor}
        bubbleStyle={launcherUi?.bubbleStyle}
        resetDisabled
        closeDisabled
      />
    </div>
  )
}
