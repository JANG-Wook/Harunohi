// 하루노히 브랜드 로고 — 개나리 한 송이.
// 4장 좁은 창 모양 꽃잎이 십자로 배치된 개나리 특유의 실루엣.
// 브랜드 전용 토큰(--color-harunohi-yellow / -deep) 만 사용해 다크/라이트 모두 동일한 톤.

export default function ForsythiaLogo({ size = 22 }) {
  // 개나리 꽃잎 — 위로 길게 뻗은 창(lance) 모양.
  //   끝(y≈-9) 은 뾰족, 중상단(y≈-3) 에서 가장 넓음, base(0,0) 로 모아짐.
  const PETAL =
    'M 0,-9 ' +
    'Q -1.6,-7 -1.6,-3 ' +
    'Q -1.4,-0.6 0,0 ' +
    'Q 1.4,-0.6 1.6,-3 ' +
    'Q 1.6,-7 0,-9 Z'

  // 잎맥 — 베이스에서 끝까지 옅게 그어 깊이감
  const VEIN = 'M 0,-1 L 0,-8.2'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
    >
      {/* 화면 중앙(12,12). 살짝 기울여(-12°) 자연스럽게 */}
      <g transform="translate(12 12) rotate(-12)">
        {/* 4장 꽃잎 — 0/90/180/270 도 */}
        {[0, 90, 180, 270].map((deg) => (
          <g key={deg} transform={`rotate(${deg})`}>
            <path
              d={PETAL}
              fill="var(--color-harunohi-yellow)"
              stroke="var(--color-harunohi-yellow-deep)"
              strokeWidth="0.4"
              strokeLinejoin="round"
            />
            <path
              d={VEIN}
              stroke="var(--color-harunohi-yellow-deep)"
              strokeWidth="0.3"
              strokeLinecap="round"
              opacity="0.55"
            />
          </g>
        ))}
        {/* 중심 — 작은 진한 노란 점 (수술) */}
        <circle r="1.3" fill="var(--color-harunohi-yellow-deep)" />
      </g>
    </svg>
  )
}
