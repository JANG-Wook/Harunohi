// 하루노히 브랜드 로고 — 개나리 한 송이(단순화 버전).
// 4장 창 모양 꽃잎이 십자로 배치된 개나리 실루엣. 잎맥 등 디테일은 빼고 잎을 두껍게.
// 색은 브랜드 토큰(--color-harunohi-yellow → -deep) 2-스톱 대각선 그라디언트 (컨플루언스 스타일).
// 그라디언트는 잎별이 아니라 로고 전체에 하나로 흐르도록 — 꽃잎 모양으로 clip 후 전체 사각형에 그라디언트.

export default function ForsythiaLogo({ size = 22 }) {
  // 두꺼운 창(lance) 꽃잎 — 끝(y≈-8.5) 뾰족, 중상단에서 넓고, base(0,0) 로 모임. 폭 ≈ 4.4.
  const PETAL =
    'M 0,-8.5 ' +
    'Q -2.2,-6.4 -2.2,-3 ' +
    'Q -2,-0.4 0,0 ' +
    'Q 2,-0.4 2.2,-3 ' +
    'Q 2.2,-6.4 0,-8.5 Z'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
    >
      <defs>
        {/* 밝은 노랑 → 진한 노랑 대각선 그라디언트 (전체 viewBox 기준 = 로고 전체에 하나로 흐름) */}
        <linearGradient id="harunohiLogoGradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: 'var(--color-harunohi-yellow)' }} />
          <stop offset="1" style={{ stopColor: 'var(--color-harunohi-yellow-deep)' }} />
        </linearGradient>
        {/* 꽃잎 4장 모양 클립 — clipPath 자식엔 <g> 불가라 각 path 에 transform 직접 적용 */}
        <clipPath id="harunohiLogoClip">
          {/* +(0°)와 X(45°)의 중간인 22.5° 로 회전 */}
          {[0, 90, 180, 270].map((deg) => (
            <path key={deg} d={PETAL} transform={`translate(12 12) rotate(${deg + 22.5})`} />
          ))}
        </clipPath>
      </defs>

      {/* 전체 사각형에 그라디언트 → 꽃잎 모양으로만 보이도록 clip */}
      <rect x="0" y="0" width="24" height="24" fill="url(#harunohiLogoGradient)" clipPath="url(#harunohiLogoClip)" />
    </svg>
  )
}
