// 대화방 UI 미리보기 — 응답 메시지를 대화방 배경 위에 렌더하고 설정값을 입힌다.
// DS ChatRoom 은 색/크기/둥글기가 토큰 고정이라 받을 수 없으므로, 미리보기 전용으로
// 봇 메시지 레이아웃(말풍선=텍스트+버튼, 퀵버튼은 말풍선 밖)을 재현한다.
// 색/크기/둥글기는 고객사 브랜드 데이터라 inline style 로 적용(컴포넌트 chrome 은 토큰).
// 다크/라이트 모드 사용(themeSupport) 시: 색은 테마 토큰을 따르고(커스텀 무시), 크기/둥글기는 유지.

import { useState } from 'react'
import Avatar from '../design-system/components/Avatar/Avatar.jsx'
import { ChatHeader, ChatInput, ChatStatusBar } from '../design-system/components/ChatRoom/ChatRoom.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import TextButton from '../design-system/components/TextButton/TextButton.jsx'
import { ChatPreviewTitle } from './ChatroomPreview.jsx'
import { PH, getImageUrl, hasImage } from '../lib/chatMessageDefaults.js'
import { buildProfileAvatar } from '../lib/profileAvatar.js'
import './ResponsePreview.css'

const QUICK_SAMPLE = [PH.quickItem, PH.quickItem]

export default function ResponsePreview({ config }) {
  const r = config.response
  const c = config.chatroom
  const themed = c.themeSupport
  const [expanded, setExpanded] = useState(true)

  // 챗봇 프로필(대화방 UI 설정 탭 소관) — 이름 on/off·텍스트, 아바타(아이콘/이미지/사용 안함)
  const msgBotName = c.botNameOn ? (c.botName || '챗봇') : ''
  const showAvatar = c.profileType !== 'none'
  const avatarSrc = c.profileType === 'image' && hasImage(c.profileImage)
    ? getImageUrl(c.profileImage)
    : buildProfileAvatar(c.profileIcon, c.profileIconBgColor, c.profileIconColor)

  // 대화방 배경 — themeSupport 면 테마 배경(토큰), 아니면 색상/사진 고정
  let hostStyle
  if (themed) {
    hostStyle = undefined
  } else if (c.bgType === 'image' && hasImage(c.bgImage)) {
    hostStyle = { backgroundColor: 'transparent', backgroundImage: `url(${getImageUrl(c.bgImage)})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  } else {
    hostStyle = { background: c.bgColor }
  }

  // 테마 모드면 색을 토큰으로 대체(커스텀 무시), 아니면 설정값 사용. 크기/둥글기는 항상 설정값.
  const titleColor = themed ? 'var(--color-label-neutral)' : r.titleColor
  const bodyColor = themed ? 'var(--color-label-neutral)' : r.bodyColor
  const accordionColor = themed ? 'var(--color-label-neutral)' : r.accordionColor
  const bubbleBg = themed ? 'var(--color-bg-normal)' : r.bubbleBgColor
  const bubbleBorder = themed ? 'var(--color-line-solid-normal)' : r.bubbleBorderColor
  const mainBg = themed ? 'var(--color-primary-normal)' : r.mainButtonColor
  const mainBorder = themed ? 'var(--color-primary-normal)' : r.mainButtonBorderColor
  const mainText = themed ? 'var(--color-static-white)' : r.mainButtonTextColor
  const subBg = themed ? 'var(--color-bg-normal)' : r.subButtonColor
  const subBorder = themed ? 'var(--color-primary-normal)' : r.subButtonBorderColor
  const subText = themed ? 'var(--color-primary-normal)' : r.subButtonTextColor
  const quickBg = themed ? 'var(--color-bg-normal)' : r.quickColor
  const quickBorder = themed ? 'var(--color-line-normal)' : r.quickBorderColor
  const quickText = themed ? 'var(--color-label-normal)' : r.quickTextColor

  return (
    <div className="rsp">
      {/* 디바이스 프레임 — 대화방 미리보기와 동일(상태바 + 헤더 + 비활성 입력창) */}
      <div className="rsp__device">
        <ChatStatusBar />
        <ChatHeader title={<ChatPreviewTitle chatroom={c} />} resetDisabled closeDisabled />
        <div className="rsp__host chat-room-scroll" style={hostStyle}>
          <div className="rsp__msg">
          {/* 아바타 + 봇 라벨 — 챗봇 프로필 설정 반영(둘 다 꺼지면 행 숨김) */}
          {(showAvatar || msgBotName) && (
            <div className="rsp__head">
              {showAvatar && <Avatar variant="person" size="small" src={avatarSrc} />}
              {msgBotName && <span className="rsp__name">{msgBotName}</span>}
            </div>
          )}

          {/* 말풍선 */}
          <div className="rsp__bubble" style={{ background: bubbleBg, borderColor: bubbleBorder }}>
            <div className="rsp__textarea">
              <div className="rsp__texts">
                <p className="rsp__title" style={{ fontSize: r.titleSize, color: titleColor }}>{PH.title}</p>
                <p className="rsp__body" style={{ fontSize: r.bodySize, color: bodyColor }}>{PH.body}</p>
              </div>
              {expanded && (
                <p className="rsp__accordion" style={{ fontSize: r.accordionSize, color: accordionColor }}>
                  {PH.accordion}
                </p>
              )}
              {/* '더 보기' 토글 — 설정 대상 아님. DS TextButton 그대로 사용(실제 ChatRoom 과 동일) */}
              <div style={{ display: 'flex', width: '100%' }}>
                <TextButton
                  color="assistive"
                  size="small"
                  label={expanded ? '접기' : '더 보기'}
                  trailingIcon={<Icon name={expanded ? 'chevronUpSmall' : 'chevronDownSmall'} size={16} />}
                  onClick={() => setExpanded((v) => !v)}
                  className="chatroom-fullwidth-btn"
                />
              </div>
            </div>

            <div className="rsp__buttons">
              <button
                type="button"
                className="rsp__btn"
                style={{ borderRadius: r.buttonRadius, fontSize: r.buttonTextSize, background: mainBg, borderColor: mainBorder, color: mainText }}
              >
                {PH.mainLabel}
              </button>
              <button
                type="button"
                className="rsp__btn"
                style={{ borderRadius: r.buttonRadius, fontSize: r.buttonTextSize, background: subBg, borderColor: subBorder, color: subText }}
              >
                {PH.subLabel}
              </button>
            </div>
          </div>

          {/* 퀵버튼 — 말풍선 밖 */}
          <div className="rsp__quick">
            {QUICK_SAMPLE.map((label, i) => (
              <button
                key={i}
                type="button"
                className="rsp__chip"
                style={{ borderRadius: r.quickRadius, fontSize: r.quickTextSize, background: quickBg, borderColor: quickBorder, color: quickText }}
              >
                {label}
              </button>
            ))}
          </div>

          <span className="rsp__time">09:41</span>
          </div>
        </div>
        {/* 입력창 — 미리보기라 비활성 */}
        <ChatInput disabled value="" placeholder={c.inputPlaceholder || '메시지를 입력해 주세요'} />
      </div>
    </div>
  )
}
