// 색상 대비 계산 — WCAG 상대 휘도 기반 명암비.
// 런처 진입 메시지 글자/배경, 아이콘/버튼 색이 너무 비슷할 때 경고용.

/** #RGB / #RRGGBB → { r, g, b } (0~255). 유효하지 않으면 null */
function parseHex(hex) {
  if (typeof hex !== 'string') return null
  let v = hex.trim().replace(/^#/, '')
  if (/^[0-9a-fA-F]{3}$/.test(v)) v = v.replace(/(.)/g, '$1$1')
  if (!/^[0-9a-fA-F]{6}$/.test(v)) return null
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  }
}

/** sRGB 채널 → 선형값 (WCAG 공식) */
function channelLuminance(c) {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

function relativeLuminance({ r, g, b }) {
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b)
}

/** 두 색의 명암비 (1 ~ 21). 파싱 실패 시 null */
export function contrastRatio(hex1, hex2) {
  const c1 = parseHex(hex1)
  const c2 = parseHex(hex2)
  if (!c1 || !c2) return null
  const l1 = relativeLuminance(c1)
  const l2 = relativeLuminance(c2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/** 대비 부족 여부 — 기본 임계값 3:1 (말풍선/버튼은 큰 텍스트·UI 라 AA Large 기준).
 *  파싱 불가하면 false (경고 안 띄움). */
export function isLowContrast(hex1, hex2, threshold = 3) {
  const ratio = contrastRatio(hex1, hex2)
  if (ratio == null) return false
  return ratio < threshold
}
