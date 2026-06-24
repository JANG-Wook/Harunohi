// 런처 대화방 UI 설정(config) → 공용 ChatRoom 적용용 스타일 객체로 해석.
// ResponsePreview 와 동일 규칙: themeSupport=true 면 색은 테마 토큰을 따르고(커스텀 무시),
// 크기/둥글기는 항상 설정값 유지. 봇 빌더 미리보기·시뮬레이터가 공통으로 사용한다.

import { getImageUrl, hasImage } from './chatMessageDefaults.js'
import { buildProfileAvatar } from './profileAvatar.js'

/**
 * @param {object} config 런처 현재 버전 config (config.chatroom + config.response)
 * @returns {{
 *   chatroom: object, botName: string, showAvatar: boolean, avatarSrc: string,
 *   headerBgColor: string|undefined, footerBgColor: string|undefined, inputBgColor: string|undefined,
 *   primaryLight: string, primaryDark: string,
 *   bgColor: string|undefined, bgImage: string|undefined,
 *   inputPlaceholder: string, bubbleStyle: object
 * }}
 */
export function resolveChatUi(config) {
  const c = config.chatroom
  const r = config.response
  const themed = c.themeSupport

  // 챗봇 프로필 — 이름 on/off, 아바타(아이콘/이미지/사용 안함)
  const botName = c.botNameOn ? (c.botName || '챗봇') : ''
  const showAvatar = c.profileType !== 'none'
  const avatarSrc = c.profileType === 'image' && hasImage(c.profileImage)
    ? getImageUrl(c.profileImage)
    : buildProfileAvatar(c.profileIcon, c.profileIconBgColor, c.profileIconColor)

  // 대화방 배경 — themeSupport 면 테마 배경 따름(오버라이드 안 함)
  let bgColor
  let bgImage
  if (!themed) {
    if (c.bgType === 'image' && hasImage(c.bgImage)) bgImage = getImageUrl(c.bgImage)
    else bgColor = c.bgColor
  }

  // 말풍선/텍스트/버튼/퀵 — themed 면 토큰, 아니면 커스텀. 크기/둥글기는 항상 커스텀.
  const bubbleStyle = {
    bubbleBg:       themed ? 'var(--color-bg-normal)' : r.bubbleBgColor,
    bubbleBorder:   themed ? 'var(--color-line-solid-normal)' : r.bubbleBorderColor,
    bubbleRadius:   r.bubbleRadius,
    titleSize:      r.titleSize,
    titleColor:     themed ? 'var(--color-label-neutral)' : r.titleColor,
    bodySize:       r.bodySize,
    bodyColor:      themed ? 'var(--color-label-neutral)' : r.bodyColor,
    accordionSize:  r.accordionSize,
    accordionColor: themed ? 'var(--color-label-neutral)' : r.accordionColor,
    buttonRadius:   r.buttonRadius,
    buttonTextSize: r.buttonTextSize,
    mainBg:         themed ? 'var(--color-primary-normal)' : r.mainButtonColor,
    mainBorder:     themed ? 'var(--color-primary-normal)' : r.mainButtonBorderColor,
    mainText:       themed ? 'var(--color-static-white)' : r.mainButtonTextColor,
    subBg:          themed ? 'var(--color-bg-normal)' : r.subButtonColor,
    subBorder:      themed ? 'var(--color-primary-normal)' : r.subButtonBorderColor,
    subText:        themed ? 'var(--color-primary-normal)' : r.subButtonTextColor,
    quickRadius:    r.quickRadius,
    quickTextSize:  r.quickTextSize,
    quickBg:        themed ? 'var(--color-bg-normal)' : r.quickColor,
    quickBorder:    themed ? 'var(--color-line-normal)' : r.quickBorderColor,
    quickText:      themed ? 'var(--color-label-normal)' : r.quickTextColor,
  }

  return {
    chatroom: c,
    botName,
    showAvatar,
    avatarSrc,
    headerBgColor: themed ? undefined : c.headerBgColor,
    footerBgColor: themed ? undefined : c.footerBgColor,
    inputBgColor:  themed ? undefined : c.inputBgColor,
    primaryLight:  c.primaryLight,
    primaryDark:   c.primaryDark,
    bgColor,
    bgImage,
    inputPlaceholder: c.inputPlaceholder,
    bubbleStyle,
  }
}
