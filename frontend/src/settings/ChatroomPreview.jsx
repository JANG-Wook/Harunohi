// 대화방 미리보기 — 실제 디자인 시스템 ChatRoom 을 렌더하고 설정값을 입힌다.
// 봇 이름→헤더 title, 입력 안내→placeholder, 프로필→메시지 아바타(없으면 기본),
// 대화방 배경(색/사진)→.chat-room-scroll 오버라이드. 미리보기라 액션 버튼은 비활성.

import { useEffect, useRef, useState } from 'react'
import ChatRoom from '../design-system/components/ChatRoom/ChatRoom.jsx'
import { getImageUrl, hasImage } from '../lib/chatMessageDefaults.js'
import { buildProfileAvatar } from '../lib/profileAvatar.js'
import './ChatroomPreview.css'

// 미리보기에 띄울 웰컴메시지 — 제목 텍스트만 표시.
const WELCOME_TITLE = '안녕하세요. 무엇을 도와드릴까요?'

/** 미리보기용 봇 메시지 — 제목 텍스트만 표시(나머지 항목은 모두 끔). */
function buildWelcomeMessage(id, botName, avatarSrc, showAvatar) {
  return {
    id,
    type: 'bot',
    botName,
    avatarSrc,
    showAvatar,
    timestamp: '09:41',
    mode: 'single',
    textOn: true,
    titleOn: true,
    title: WELCOME_TITLE,
    bodyOn: false,
    accordionOn: false,
    imageOn: false,
    buttonOn: false,
    mainOn: false,
    subOn: false,
    messageBannerOn: false,
    quickButtonOn: false,
  }
}

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

/** 미리보기 헤더 제목 — 대화방 이름(켜짐+값 있을 때) + 온라인 표시 점. 두 미리보기 공용 */
export function ChatPreviewTitle({ chatroom }) {
  const showRoomTitle = chatroom.roomTitleOn && !!chatroom.roomTitle
  if (chatroom.onlineIndicator) {
    return (
      <span className="crp-title">
        {showRoomTitle ? <span>{chatroom.roomTitle}</span> : null}
        <StatusDot />
      </span>
    )
  }
  return showRoomTitle ? chatroom.roomTitle : ''
}

export default function ChatroomPreview({ config }) {
  const c = config.chatroom
  // 챗봇 이름 — 끄면 메시지 라벨 숨김(빈 문자열)
  const msgBotName = c.botNameOn ? (c.botName || '챗봇') : ''
  const avatarSrc = c.profileType === 'image' && hasImage(c.profileImage)
    ? getImageUrl(c.profileImage)
    : buildProfileAvatar(c.profileIcon, c.profileIconBgColor, c.profileIconColor)
  // 사용 안함이면 메시지에 프로필 사진(아바타) 미표시
  const showAvatar = c.profileType !== 'none'
  // 대화 영역 배경 — themeSupport 면 테마 배경(오버라이드 안 함), 아니면 색상/사진 고정
  let hostStyle
  if (c.themeSupport) {
    hostStyle = undefined // 테마 배경 그대로(라이트/다크 자동)
  } else if (c.bgType === 'image' && hasImage(c.bgImage)) {
    hostStyle = { '--crp-bg': 'transparent', '--crp-bg-image': `url(${getImageUrl(c.bgImage)})` }
  } else {
    hostStyle = { '--crp-bg': c.bgColor, '--crp-bg-image': 'none' }
  }
  // 대화방 프라이머리 오버라이드 — 콘솔 미적용, 이 컨테이너 하위로만 상속(라이트/다크는 CSS [data-theme] 가 선택)
  const hostStyleFinal = { ...(hostStyle || {}), '--cr-primary-light': c.primaryLight, '--cr-primary-dark': c.primaryDark }

  // 라이브 미리보기 대화 — 웰컴메시지 1개로 시작. 사용자가 무엇을 입력하든 같은 웰컴 응답을 echo.
  // 봇 이름/아바타(설정값)가 바뀌면 시드를 다시 만들어 대화 초기화.
  const seqRef = useRef(0)
  const [convo, setConvo] = useState(() => [buildWelcomeMessage('w0', msgBotName, avatarSrc, showAvatar)])
  useEffect(() => {
    seqRef.current = 0
    setConvo([buildWelcomeMessage('w0', msgBotName, avatarSrc, showAvatar)])
  }, [msgBotName, avatarSrc, showAvatar])

  // 새로고침 — 대화를 웰컴 메시지 1개 상태로 초기화.
  const handleReset = () => {
    seqRef.current = 0
    setConvo([buildWelcomeMessage('w0', msgBotName, avatarSrc, showAvatar)])
  }

  // 발화 전송 — 사용자 메시지 + 동일 웰컴 응답을 이어 붙인다.
  const handleSend = (text) => {
    const n = (seqRef.current += 1)
    setConvo((prev) => [
      ...prev,
      { id: `u${n}`, type: 'user', text },
      buildWelcomeMessage(`w${n}`, msgBotName, avatarSrc, showAvatar),
    ])
  }

  return (
    <div className="crp">
      <div className="crp__host" style={hostStyleFinal}>
        <ChatRoom
          title={<ChatPreviewTitle chatroom={c} />}
          placeholder={c.inputPlaceholder || '메시지를 입력해 주세요'}
          initialMessages={convo}
          onSend={handleSend}
          onReset={handleReset}
          headerBgColor={c.themeSupport ? undefined : c.headerBgColor}
          footerBgColor={c.themeSupport ? undefined : c.footerBgColor}
          inputBgColor={c.themeSupport ? undefined : c.inputBgColor}
          pinUserToTop={c.pinUserToTop}
          inputExpandable={c.inputExpandable}
          closeDisabled
        />
      </div>
    </div>
  )
}
