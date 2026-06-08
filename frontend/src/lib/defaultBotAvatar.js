// 대화방 챗봇 기본 아바타 — 프로필 미설정 시 사용하는 단순 로봇 얼굴 SVG(데이터 URI).
// 이미지 에셋이라 색은 콘텐츠 값으로 고정(토큰 아님). 이모지 미사용.

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
  <rect width="80" height="80" fill="#EAF1FF"/>
  <g transform="translate(0 3.5)">
    <line x1="40" y1="24" x2="40" y2="17" stroke="#0066FF" stroke-width="4.5" stroke-linecap="round"/>
    <circle cx="40" cy="14.5" r="4.5" fill="#0066FF"/>
    <rect x="21" y="24" width="38" height="32" rx="9" fill="#0066FF"/>
    <circle cx="32" cy="39" r="3.5" fill="#FFFFFF"/>
    <circle cx="48" cy="39" r="3.5" fill="#FFFFFF"/>
  </g>
</svg>`

/** 기본 챗봇 아바타 (img src 로 사용 가능한 데이터 URI) */
export const DEFAULT_BOT_AVATAR = `data:image/svg+xml,${encodeURIComponent(SVG)}`
