/**
 * AX_1 Design System — tokens.js
 * Figma: Foundation_Typography (node: 156:54083)
 *         Foundation_Token_Color  (node: 156:46510)
 * ⚠️ 이 파일을 수정하면 tokens.css도 반드시 동기화할 것
 */

export const fontFamily = {
  base: "'Pretendard JP Variable', 'Pretendard JP', sans-serif",
}

export const fontWeight = {
  bold:      700,
  semibold:  600,
  medium:    500,
  regular:   400,
}

export const fontSize = {
  'display-1':  '56px',
  'display-2':  '40px',
  'display-3':  '36px',
  'title-1':    '32px',
  'title-2':    '28px',
  'title-3':    '24px',
  'heading-1':  '22px',
  'heading-2':  '20px',
  'headline-1': '18px',
  'headline-2': '17px',
  'body-1':     '16px',
  'body-2':     '15px',
  'label-1':    '14px',
  'label-2':    '13px',
  'caption-1':  '12px',
  'caption-2':  '11px',
}

export const lineHeight = {
  'display-1':       1.286,
  'display-2':       1.3,
  'display-3':       1.334,
  'title-1':         1.375,
  'title-2':         1.358,
  'title-3':         1.334,
  'heading-1':       1.364,
  'heading-2':       1.4,
  'headline-1':      1.445,
  'headline-2':      1.412,
  'body-1-normal':   1.5,
  'body-1-reading':  1.625,
  'body-2-normal':   1.467,
  'body-2-reading':  1.6,
  'label-1-normal':  1.429,
  'label-1-reading': 1.571,
  'label-2':         1.385,
  'caption-1':       1.334,
  'caption-2':       1.273,
}

export const letterSpacing = {
  'display-1':  '-0.0319em',
  'display-2':  '-0.0282em',
  'display-3':  '-0.027em',
  'title-1':    '-0.0253em',
  'title-2':    '-0.0236em',
  'title-3':    '-0.023em',
  'heading-1':  '-0.0194em',
  'heading-2':  '-0.012em',
  'headline-1': '-0.002em',
  'headline-2':  '0em',
  'body-1':      '0.0057em',
  'body-2':      '0.0096em',
  'label-1':     '0.0145em',
  'label-2':     '0.0194em',
  'caption-1':   '0.0252em',
  'caption-2':   '0.0311em',
}

export const color = {
  label: {
    strong:      '#000000',
    normal:      '#171719',
    neutral:     'rgba(46, 47, 51, 0.88)',
    alternative: 'rgba(55, 56, 60, 0.61)',
    assistive:   'rgba(55, 56, 60, 0.28)',
    disable:     'rgba(55, 56, 60, 0.16)',
  },
  background: {
    normal:                 '#FFFFFF',
    normalAlternative:      '#F7F7F8',
    elevated:               '#FFFFFF',
    elevatedAlternative:    '#F7F7F8',
    transparent:            'rgba(255, 255, 255, 0.08)',
    transparentAlternative: 'rgba(255, 255, 255, 0.28)',
  },
  line: {
    normal:          'rgba(112, 115, 124, 0.22)',
    strong:          'rgba(112, 115, 124, 0.52)',
    neutral:         'rgba(112, 115, 124, 0.16)',
    alternative:     'rgba(112, 115, 124, 0.08)',
    solidNormal:     '#E1E2E4',
    solidNeutral:    '#EAEBEC',
    solidAlternative: '#F4F4F5',
  },
  fill: {
    normal:      'rgba(112, 115, 124, 0.08)',
    alternative: 'rgba(112, 115, 124, 0.05)',
    strong:      'rgba(112, 115, 124, 0.16)',
  },
  interaction: {
    inactive: '#989BA2',
    disable:  '#F4F4F5',
  },
  coolNeutral: {
    30: '#46474C',
  },
  atomic: {
    green:  { 60: '#1ED45A' },
    orange: { 60: '#FFA938' },
    red:    { 60: '#FF6363' },
  },
  primary: {
    normal: '#0066FF',
    strong: '#005EEB',
    heavy:  '#0054D1',
  },
  status: {
    positive:   '#00BF40',
    cautionary: '#FF9200',
    negative:   '#FF4242',
  },
  accentBackground: {
    redOrange: '#FF5E00',
    lime:      '#58CF04',
    cyan:      '#00BDDE',
    lightBlue: '#00AEFF',
    violet:    '#6541F2',
    purple:    '#CB59FF',
    pink:      '#F553DA',
  },
  accentForeground: {
    red:       '#E52222',
    redOrange: '#F55A00',
    orange:    '#D17600',
    lime:      '#429E00',
    green:     '#009632',
    cyan:      '#0098B2',
    lightBlue: '#008DCF',
    blue:      '#005EEB',
    violet:    '#5B37ED',
    purple:    '#AD36E3',
    pink:      '#E846CD',
  },
  // Harunohi 브랜드 전용 — 개나리 노랑. 로고/엠블럼 한정.
  harunohi: {
    yellow:     '#FFC107',
    yellowDeep: '#C58F00',
  },
  inverse: {
    primary:    '#3385FF',
    background: '#1B1C1E',
    label:      '#F7F7F8',
  },
  static: {
    white: '#FFFFFF',
    black: '#000000',
  },
  material: {
    dimmer: 'rgba(23, 25, 25, 0.52)',
  },
  ios: {
    fillSecondary:   'rgba(120, 120, 128, 0.16)',
    glassBackground: 'rgba(245, 245, 245, 0.60)',
    accentPrimary:   '#0088FF',
  },
}

export const darkColor = {
  label: {
    strong:      '#ffffff',
    normal:      '#f7f7f8',
    neutral:     'rgba(194, 196, 200, 0.88)',
    alternative: 'rgba(174, 176, 182, 0.61)',
    assistive:   'rgba(174, 176, 182, 0.28)',
    disable:     'rgba(152, 155, 162, 0.16)',
  },
  background: {
    normal:                 '#1b1c1e',
    normalAlternative:      '#0f0f10',
    elevated:               '#212225',
    elevatedAlternative:    '#141415',
    transparent:            'rgba(33, 34, 37, 0.61)',
    transparentAlternative: 'rgba(33, 34, 37, 0.61)',
  },
  line: {
    normal:          'rgba(112, 115, 124, 0.32)',
    strong:          'rgba(194, 196, 200, 0.52)',
    neutral:         'rgba(112, 115, 124, 0.28)',
    alternative:     'rgba(112, 115, 124, 0.22)',
    solidNormal:     '#37383c',
    solidNeutral:    '#333438',
    solidAlternative: '#2e2f33',
  },
  fill: {
    normal:      'rgba(112, 115, 124, 0.22)',
    alternative: 'rgba(112, 115, 124, 0.12)',
    strong:      'rgba(112, 115, 124, 0.28)',
  },
  interaction: {
    inactive: '#5a5c63',
    disable:  '#2e2f33',
  },
  atomic: {
    green:  { 60: '#1ed45a' },
    orange: { 60: '#ffa938' },
    red:    { 60: '#ff6363' },
  },
  primary: {
    normal: '#3385ff',
    strong: '#1a75ff',
    heavy:  '#0066ff',
  },
  status: {
    positive:   '#1ed45a',
    cautionary: '#ffa938',
    negative:   '#ff6363',
  },
  accentBackground: {
    redOrange: '#ff7b2e',
    lime:      '#6be016',
    cyan:      '#28d0ed',
    lightBlue: '#3dc2ff',
    violet:    '#7d5ef7',
    purple:    '#d478ff',
    pink:      '#fa73e3',
  },
  accentForeground: {
    red:       '#ff6363',
    redOrange: '#ff7b2e',
    orange:    '#ff9200',
    lime:      '#58cf04',
    green:     '#1ed45a',
    cyan:      '#00bdde',
    lightBlue: '#00aeff',
    blue:      '#4f95ff',
    violet:    '#9e86fc',
    purple:    '#d478ff',
    pink:      '#fa73e3',
  },
  harunohi: {
    yellow:     '#FFD43B',
    yellowDeep: '#D69A1F',
  },
  inverse: {
    primary:    '#0066ff',
    background: '#ffffff',
    label:      '#171719',
  },
  static: {
    white: '#ffffff',
    black: '#000000',
  },
  material: {
    dimmer: 'rgba(23, 23, 25, 0.74)',
  },
}

export const divider = {
  thickness: {
    normal: '1px',
    thick:  '12px',
  },
}

export const interaction = {
  normal: { normal: 0,    hovered: 0.05, focused: 0.08, pressed: 0.12 },
  light:  { normal: 0,    hovered: 0.04, focused: 0.06, pressed: 0.09 },
  strong: { normal: 0,    hovered: 0.08, focused: 0.12, pressed: 0.18 },
}

export const gradient = {
  solid: {
    top:    'linear-gradient(to top,    transparent, currentColor)',
    right:  'linear-gradient(to right,  transparent, currentColor)',
    bottom: 'linear-gradient(to bottom, transparent, currentColor)',
    left:   'linear-gradient(to left,   transparent, currentColor)',
  },
  multiple: {
    top:    'linear-gradient(to top,    currentColor, transparent)',
    right:  'linear-gradient(to right,  currentColor, transparent)',
    bottom: 'linear-gradient(to bottom, currentColor, transparent)',
    left:   'linear-gradient(to left,   currentColor, transparent)',
  },
  mask: {
    xsmall: 24,
    small:  32,
    medium: 40,
    xlarge: 56,
    large:  64,
  },
}

export const safeArea = {
  status: { ios: 44, android: 36, web: 0 },
  bottom: { ios: 34, android: 14, web: 0 },
}

export const ratio = {
  vertical: {
    '1:1': '1 / 1',
    '3:4': '3 / 4',
    '2:3': '2 / 3',
    '1:2': '1 / 2',
  },
  horizontal: {
    '1:1':      '1 / 1',
    '5:4':      '5 / 4',
    '4:3':      '4 / 3',
    '3:2':      '3 / 2',
    '16:10':    '16 / 10',
    'golden':   '1.618 / 1',
    '16:9':     '16 / 9',
    '2:1':      '2 / 1',
    '21:9':     '21 / 9',
    '4:5':      '4 / 5',
    '3:4':      '3 / 4',
    '2:3':      '2 / 3',
    '10:16':    '10 / 16',
    'goldenV':  '1 / 1.618',
    '9:16':     '9 / 16',
    '1:2':      '1 / 2',
    '9:21':     '9 / 21',
  },
}

export const iconSize = {
  icon:      24,   // SVG 실제 크기 (px)
  container: 64,   // 터치 영역 (px)
}

export const radius = {
  full: '9999px',
}

export const spacing = {
  '0-5': '0.5px',
  '1':   '1px',
  '2':   '2px',
  '3':   '3px',
  '4':   '4px',
  '5':   '5px',
  '6':   '6px',
  '7':   '7px',
  '8':   '8px',
  '10':  '10px',
  '12':  '12px',
  '14':  '14px',
  '16':  '16px',
  '20':  '20px',
  '24':  '24px',
  '32':  '32px',
  '40':  '40px',
  '48':  '48px',
  '56':  '56px',
}

export const breakpoint = {
  xs: 0,     // ~767px   모바일
  sm: 768,   // 768–991px  태블릿 세로
  md: 992,   // 992–1199px 태블릿 가로
  lg: 1200,  // 1200–1599px 데스크톱
  xl: 1600,  // 1600px+    와이드 데스크톱
}

export const grid = {
  xs: { containerWidth: '100%', paddingH: 20, contentWidth: 320,  columns: 2,  gutter: 20 },
  sm: { containerWidth: '100%', paddingH: 20, contentWidth: 728,  columns: 3,  gutter: 20 },
  md: { containerWidth: '100%', paddingH: 20, contentWidth: 952,  columns: 3,  gutter: 20 },
  lg: { containerWidth: 1100,   paddingH: 20, contentWidth: 1060, columns: 12, gutter: 20 },
  xl: { containerWidth: 1440,   paddingH: 20, contentWidth: 1400, columns: 12, gutter: 20 },
}

export const layout = {
  desktop: {
    screenWidth:    1440,
    screenHeight:   960,
    containerMax:   1100,
    paddingH:       20,
    contentWidth:   1060,
  },
  mobile: {
    screenWidth:    375,
    screenHeight:   635,
    paddingH:       20,
    contentWidth:   335,
  },
  ios: {
    screenWidth:    375,
    screenHeightMin: 667,
    screenHeightBase: 812,
    paddingH:       20,
    contentWidth:   335,
  },
  android: {
    screenWidth:    360,
    screenHeightMin: 640,
    screenHeightBase: 800,
    paddingH:       20,
    contentWidth:   320,
  },
}

export const animation = {
  spin: 'ax-spin 0.8s linear infinite',
}

export const shadow = {
  normal: {
    xsmall: '0px 1px 2px -1px rgba(23, 23, 23, 0.10)',
    small:  '0px 4px 6px -1px rgba(23, 23, 23, 0.06), 0px 2px 4px -2px rgba(23, 23, 23, 0.06)',
    medium: '0px 10px 15px -3px rgba(23, 23, 23, 0.07), 0px 4px 6px -2px rgba(23, 23, 23, 0.07)',
    large:  '0px 16px 24px -6px rgba(23, 23, 23, 0.08), 0px 6px 10px -4px rgba(23, 23, 23, 0.08)',
    xlarge: '0px 24px 38px -10px rgba(23, 23, 23, 0.12), 0px 10px 15px -5px rgba(23, 23, 23, 0.10)',
  },
  spread: {
    small:  '0px 0px 60px 0px rgba(23, 23, 23, 0.10)',
    medium: '0px 15px 75px 0px rgba(23, 23, 23, 0.16)',
  },
  segmentKnob:         '0px 0px 4px 0px rgba(0, 0, 0, 0.08)',
  switchIosKnob:       '0px 3px 8px 0px rgba(0, 0, 0, 0.12), 0px 3px 1px 0px rgba(0, 0, 0, 0.04)',
  textOverlay:         '0px 0px 12px rgba(0, 0, 0, 0.16)',
  pageIndicatorText:   '0px 0px 6px rgba(0, 0, 0, 0.08)',
}
