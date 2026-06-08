// 대화방 미리보기 — 실제 디자인 시스템 ChatRoom 을 렌더하고 설정값을 입힌다.
// 봇 이름→헤더 title, 입력 안내→placeholder, 프로필→메시지 아바타(없으면 기본),
// 대화방 배경(색/사진)→.chat-room-scroll 오버라이드. 미리보기라 액션 버튼은 비활성.

import { useEffect, useMemo, useState } from 'react'
import ChatRoom from '../design-system/components/ChatRoom/ChatRoom.jsx'
import { getImageUrl, hasImage } from '../lib/chatMessageDefaults.js'
import { DEFAULT_BOT_AVATAR } from '../lib/defaultBotAvatar.js'
import './ChatroomPreview.css'

// 연결 상태 점 — 실제론 네트워크 상태(연결=파랑/불안정=주황/끊김=회색)지만,
// 미리보기에선 세 색을 2초씩 순환해 보여준다. 깜빡임은 CSS.
const DOT_COLORS = [
  'var(--color-primary-normal)',  // 연결됨(파랑)
  'var(--color-status-cautionary)', // 불안정(주황)
  'var(--color-label-assistive)', // 끊김(회색)
]

function StatusDot() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % DOT_COLORS.length), 2000)
    return () => clearInterval(t)
  }, [])
  return <span className="crp-dot" style={{ background: DOT_COLORS[i] }} aria-hidden="true" />
}

/** 텍스트 전용 봇 메시지 — 버튼/이미지/아코디언 등은 모두 끔 */
function botText(id, body, botName, avatarSrc) {
  return {
    id,
    type: 'bot',
    botName,
    avatarSrc,
    timestamp: '',
    mode: 'single',
    textOn: true,
    titleOn: false,
    bodyOn: true,
    body,
    accordionOn: false,
    imageOn: false,
    buttonOn: false,
    mainOn: false,
    subOn: false,
    messageBannerOn: false,
    quickButtonOn: false,
  }
}

export default function ChatroomPreview({ config }) {
  const c = config.chatroom
  // 챗봇 이름 — 끄면 메시지 라벨 숨김(빈 문자열)
  const msgBotName = c.botNameOn ? (c.botName || '챗봇') : ''
  const avatarSrc = hasImage(c.profileImage) ? getImageUrl(c.profileImage) : DEFAULT_BOT_AVATAR
  // 대화 영역 배경 — themeSupport 면 테마 배경(오버라이드 안 함), 아니면 색상/사진 고정
  let hostStyle
  if (c.themeSupport) {
    hostStyle = undefined // 테마 배경 그대로(라이트/다크 자동)
  } else if (c.bgType === 'image' && hasImage(c.bgImage)) {
    hostStyle = { '--crp-bg': 'transparent', '--crp-bg-image': `url(${getImageUrl(c.bgImage)})` }
  } else {
    hostStyle = { '--crp-bg': c.bgColor, '--crp-bg-image': 'none' }
  }

  // 라이브 미리보기 — 참조가 매 렌더 바뀌면 ChatRoom 내부 메시지가 리셋되므로 메모이즈.
  // 이름/아바타가 바뀔 때만 시드 갱신(그때 데모 대화는 초기화됨).
  const messages = useMemo(
    () => [
      botText('m1', '안녕하세요! 무엇을 도와드릴까요?', msgBotName, avatarSrc),
      { id: 'm2', type: 'user', text: '예약하고 싶어요.' },
      botText('m3', '네, 원하시는 날짜를 알려주세요.', msgBotName, avatarSrc),
    ],
    [msgBotName, avatarSrc],
  )

  // 헤더 제목 — 대화방 이름(켜짐+값 있을 때) + 온라인 표시 점
  const showRoomTitle = c.roomTitleOn && !!c.roomTitle
  const titleNode = c.onlineIndicator ? (
    <span className="crp-title">
      {showRoomTitle ? <span>{c.roomTitle}</span> : null}
      <StatusDot />
    </span>
  ) : (
    showRoomTitle ? c.roomTitle : ''
  )

  return (
    <div className="crp">
      <div className="crp__host" style={hostStyle}>
        <ChatRoom
          title={titleNode}
          placeholder={c.inputPlaceholder || '메시지를 입력해 주세요'}
          initialMessages={messages}
          pinUserToTop={c.pinUserToTop}
          resetDisabled
          closeDisabled
        />
      </div>
    </div>
  )
}
