// 런처 버튼 미리보기 — 말풍선 + 원형 버튼 + 꼬리. (배경판 stage 없음, 재사용 단위)
// 에디터(full)와 목록 카드(compact) 양쪽에서 동일 로직으로 렌더한다.
// 색/크기는 사용자 설정값(config) inline 적용. 꼬리 border 색·위치도 inline.

import Icon from '../design-system/components/Icon/Icon.jsx'
import { getImageUrl } from '../lib/chatMessageDefaults.js'
import './LauncherButtonPreview.css'

export default function LauncherButtonPreview({ config, compact = false }) {
  const {
    iconType,
    iconName,
    iconColor,
    iconImage,
    bgColor,
    greetingOn,
    greetingPosition = 'left',
    greetingText,
    greetingTextColor,
    greetingTextSize,
    greetingBgColor,
  } = config

  const imageUrl = iconType === 'image' ? getImageUrl(iconImage) : ''
  const showGreeting = greetingOn && greetingText?.trim()
  const isTop = greetingPosition === 'top'

  // 사이즈 — compact(카드) vs full(에디터)
  const buttonSize = compact ? 40 : 60
  const iconSize = compact ? 18 : 28
  const tailHalf = compact ? 5 : 7 // 꼬리 폭의 절반
  const tailDepth = compact ? 7 : 9 // 꼬리 길이

  // 꼬리 스타일 — left: 오른쪽을 가리킴 / top: 아래를 가리키며 버튼 중앙과 세로 정렬
  const tailStyle = isTop
    ? {
        top: '100%',
        right: `calc(${buttonSize / 2}px - ${tailHalf}px)`,
        borderLeft: `${tailHalf}px solid transparent`,
        borderRight: `${tailHalf}px solid transparent`,
        borderTop: `${tailDepth}px solid ${greetingBgColor}`,
      }
    : {
        // 버튼은 바닥 고정(align-items flex-end) → 꼬리는 말풍선 아래에서 버튼 중앙 높이에 위치.
        // 말풍선이 길어져도 버튼/꼬리 위치는 그대로, 말풍선만 위로 자란다.
        bottom: `calc(${buttonSize / 2}px - ${tailHalf}px)`,
        left: '100%',
        borderTop: `${tailHalf}px solid transparent`,
        borderBottom: `${tailHalf}px solid transparent`,
        borderLeft: `${tailDepth}px solid ${greetingBgColor}`,
      }

  return (
    <div
      className={[
        'lbp',
        `lbp--${isTop ? 'top' : 'left'}`,
        compact && 'lbp--compact',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {showGreeting ? (
        <div
          className={['lbp__greeting', compact && 'lbp__greeting--compact'].filter(Boolean).join(' ')}
          style={{
            background: greetingBgColor,
            color: greetingTextColor,
            fontSize: compact ? '12px' : `${greetingTextSize}px`,
            // 최소 높이를 버튼과 같게 → 짧은 말풍선에서도 꼬리(버튼 중앙)가 둥근 모서리에 걸리지 않음
            minHeight: buttonSize,
          }}
        >
          {greetingText}
          <span className="lbp__tail" style={tailStyle} aria-hidden="true" />
        </div>
      ) : null}

      <span
        className="lbp__button"
        style={{ background: bgColor, width: buttonSize, height: buttonSize }}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="" className="lbp__img" />
        ) : (
          <Icon name={iconName} size={iconSize} color={iconColor} />
        )}
      </span>
    </div>
  )
}
