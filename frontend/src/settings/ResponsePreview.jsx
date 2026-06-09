// 대화방 UI 미리보기 — 응답 메시지를 대화방 배경 위에 렌더하고 설정값을 입힌다.
// DS ChatRoom 은 색/크기/둥글기가 토큰 고정이라 받을 수 없으므로, 미리보기 전용으로
// 봇 메시지 레이아웃(말풍선=텍스트+버튼, 퀵버튼은 말풍선 밖)을 재현한다.
// 색/크기/둥글기는 고객사 브랜드 데이터라 inline style 로 적용(컴포넌트 chrome 은 토큰).
// 다크/라이트 모드 사용(themeSupport) 시: 색은 테마 토큰을 따르고(커스텀 무시), 크기/둥글기는 유지.

import { useState } from 'react'
import Avatar from '../design-system/components/Avatar/Avatar.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import { PH, getImageUrl, hasImage } from '../lib/chatMessageDefaults.js'
import { DEFAULT_BOT_AVATAR } from '../lib/defaultBotAvatar.js'
import './ResponsePreview.css'

const QUICK_SAMPLE = [PH.quickItem, PH.quickItem]

export default function ResponsePreview({ config }) {
  const r = config.response
  const c = config.chatroom
  const themed = c.themeSupport
  const [expanded, setExpanded] = useState(true)

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
      <div className={['rsp__host', themed && 'is-themed'].filter(Boolean).join(' ')} style={hostStyle}>
        <div className="rsp__msg">
          {/* 아바타 + 봇 라벨 — 응답 스타일과 무관한 미리보기 chrome */}
          <div className="rsp__head">
            <Avatar variant="person" size="small" src={DEFAULT_BOT_AVATAR} />
            <span className="rsp__name">챗봇</span>
          </div>

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
              {/* '더 보기' 버튼 자체는 설정 대상 아님 — DS 기본 모양 유지 */}
              <button type="button" className="rsp__more" onClick={() => setExpanded((v) => !v)}>
                <span>{expanded ? '접기' : '더 보기'}</span>
                <Icon name={expanded ? 'chevronUpSmall' : 'chevronDownSmall'} size={16} />
              </button>
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
    </div>
  )
}
