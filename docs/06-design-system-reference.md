<!-- Harunohi 디자인 시스템 reference — HailMary 자산의 토큰 · 컴포넌트 · 함정 정리 -->

# 06. 디자인 시스템 Reference

> 📌 **새 UI 작업을 시작하기 전에 이 문서를 먼저 확인하세요.**
> 토큰의 의미를 추측하지 말고 이 표를 기준으로 결정해야 색·간격·컴포넌트 사용이 일관됩니다.

소스 위치 — `frontend/src/design-system/`
참조 시점 — 2026-05-20

---

## 목차

- [1. 토큰 (Tokens)](#1-토큰)
- [2. 사용 컨벤션 (가장 중요)](#2-사용-컨벤션)
- [3. 컴포넌트 39종](#3-컴포넌트-39종)
- [4. 아이콘](#4-아이콘)
- [5. 특이사항 / 함정](#5-특이사항--함정)

---

## 1. 토큰

### 1.1 색상 — Semantic

#### Label (텍스트)
| 토큰 | Light | Dark | 용도 |
|------|-------|------|------|
| `--color-label-strong` | #000000 | #ffffff | 최강조 텍스트 (거의 안 씀) |
| `--color-label-normal` | #171719 | #f7f7f8 | **본문 기본** |
| `--color-label-neutral` | rgba(46,47,51,.88) | rgba(194,196,200,.88) | 약간 톤 다운된 본문 |
| `--color-label-alternative` | rgba(55,56,60,.61) | rgba(174,176,182,.61) | 보조 정보 |
| `--color-label-assistive` | rgba(55,56,60,.28) | rgba(174,176,182,.28) | placeholder, 캡션 |
| `--color-label-disable` | rgba(55,56,60,.16) | rgba(152,155,162,.16) | 비활성 |

#### Background
| 토큰 | Light | Dark | 용도 |
|------|-------|------|------|
| `--color-bg-normal` | #FFFFFF | #1b1c1e | 기본 표면 |
| `--color-bg-normal-alternative` | #F7F7F8 | #0f0f10 (가장 어두움) | **작업 캔버스 / 베이스** |
| `--color-bg-elevated` | #FFFFFF | #212225 (가장 밝음) | **떠있는 패널 / 카드 / 모달** |
| `--color-bg-elevated-alternative` | #F7F7F8 | #141415 | 떠있는 보조 면 |
| `--color-bg-transparent` | rgba(255,255,255,.08) | rgba(33,34,37,.61) | 투명 면 |

#### Line (경계선)
| 토큰 | Light | Dark | 용도 |
|------|-------|------|------|
| `--color-line-normal` | rgba(112,115,124,.22) | rgba(112,115,124,.32) | 일반 경계선 (투명) |
| `--color-line-strong` | rgba(112,115,124,.52) | rgba(194,196,200,.52) | 강한 경계 |
| `--color-line-neutral` | rgba(112,115,124,.16) | rgba(112,115,124,.28) | 약한 경계 |
| `--color-line-alternative` | rgba(112,115,124,.08) | rgba(112,115,124,.22) | 매우 약한 |
| `--color-line-solid-normal` | #E1E2E4 | #37383c | **솔리드 경계** |
| `--color-line-solid-neutral` | #EAEBEC | #333438 | 솔리드 약한 |
| `--color-line-solid-alternative` | #F4F4F5 | #2e2f33 | 솔리드 매우 약한 |

#### Fill (반투명 채움)
| 토큰 | Light | Dark | 용도 |
|------|-------|------|------|
| `--color-fill-normal` | rgba(112,115,124,.08) | rgba(112,115,124,.22) | 활성 메뉴, 칩 등 |
| `--color-fill-alternative` | rgba(112,115,124,.05) | rgba(112,115,124,.12) | hover 배경 |
| `--color-fill-strong` | rgba(112,115,124,.16) | rgba(112,115,124,.28) | pressed 배경 |

#### Interaction
| 토큰 | Light | Dark |
|------|-------|------|
| `--color-interaction-inactive` | #989BA2 | #5a5c63 |
| `--color-interaction-disable` | #F4F4F5 | #2e2f33 |

#### Primary (브랜드)
| 토큰 | Light | Dark |
|------|-------|------|
| `--color-primary-normal` | #0066FF | #3385ff |
| `--color-primary-strong` | #005EEB | #1a75ff |
| `--color-primary-heavy` | #0054D1 | #0066ff |

#### Status
| 토큰 | Light | Dark |
|------|-------|------|
| `--color-status-positive` | #00BF40 | #1ed45a |
| `--color-status-cautionary` | #FF9200 | #ffa938 |
| `--color-status-negative` | #FF4242 | #ff6363 |

#### Accent (강조 7종 BG + 11종 FG)
- BG (Solid 배경): `--color-accent-bg-{red-orange | lime | cyan | light-blue | violet | purple | pink}`
- FG (Foreground/텍스트): `--color-accent-fg-{red | red-orange | orange | lime | green | cyan | light-blue | blue | violet | purple | pink}`

#### Inverse / Static / Material
- `--color-inverse-primary`, `--color-inverse-background`, `--color-inverse-label`
- `--color-static-white` (#FFFFFF), `--color-static-black` (#000000)
- `--color-material-dimmer` rgba(23,25,25,.52) — 모달 backdrop 등

### 1.2 타이포그래피

#### Font
- `--font-family-base` — `'Pretendard JP Variable', 'Pretendard JP', sans-serif`
- Weights — `--font-weight-{bold(700) | semibold(600) | medium(500) | regular(400)}`

#### Scale (16종)
| Variant | Size | Line Height | Letter Spacing |
|---------|------|-------------|----------------|
| `display-1` | 56px | 1.286 | -0.0319em |
| `display-2` | 40px | 1.3 | -0.0282em |
| `display-3` | 36px | 1.334 | -0.027em |
| `title-1` | 32px | 1.375 | -0.0253em |
| `title-2` | 28px | 1.358 | -0.0236em |
| `title-3` | 24px | 1.334 | -0.023em |
| `heading-1` | 22px | 1.364 | -0.0194em |
| `heading-2` | 20px | 1.4 | -0.012em |
| `headline-1` | 18px | 1.445 | -0.002em |
| `headline-2` | 17px | 1.412 | 0 |
| `body-1-normal/reading` | 16px | 1.5 / 1.625 | 0.0057em |
| `body-2-normal/reading` | 15px | 1.467 / 1.6 | 0.0096em |
| `label-1-normal/reading` | 14px | 1.429 / 1.571 | 0.0145em |
| `label-2` | 13px | 1.385 | 0.0194em |
| `caption-1` | 12px | 1.334 | 0.0252em |
| `caption-2` | 11px | 1.273 | 0.0311em |

### 1.3 Spacing (4px 기반)

`--spacing-{0-5 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 10 | 12 | 14 | 16 | 20 | 24 | 32 | 40 | 48 | 56}` — 단위 px

**가장 자주 쓰는 값** — 8, 12, 16, 20, 24, 32

### 1.4 Shadow

| 토큰 | Value |
|------|-------|
| `--shadow-normal-xsmall` | 0 1px 2px -1px rgba(23,23,23,.10) |
| `--shadow-normal-small` | 0 4px 6px -1px / 0 2px 4px -2px rgba(23,23,23,.06) |
| `--shadow-normal-medium` | 0 10px 15px -3px / 0 4px 6px -2px rgba(23,23,23,.07) |
| `--shadow-normal-large` | 0 16px 24px -6px / 0 6px 10px -4px rgba(23,23,23,.08) |
| `--shadow-normal-xlarge` | 0 24px 38px -10px / 0 10px 15px -5px |
| `--shadow-spread-small` | 0 0 60px rgba(23,23,23,.10) |
| `--shadow-spread-medium` | 0 15px 75px rgba(23,23,23,.16) |
| `--shadow-segment-knob` | 컴포넌트 전용 |
| `--shadow-switch-ios-knob` | 컴포넌트 전용 |
| `--shadow-text-overlay` | 텍스트 위 오버레이용 |

### 1.5 Radius / Icon / Breakpoints

- `--radius-full` — 9999px
- `--icon-size` — 24px / `--icon-container-size` — 64px (터치 영역)
- Breakpoints — xs (0–767), sm (768–991), md (992–1199), lg (1200–1599), xl (1600+)
- Layout — `--screen-desktop-width: 1440px`, `--container-max-width: 1100px`, `--layout-padding-horizontal: 20px`
- Divider — `--divider-thickness-normal: 1px`, `--divider-thickness-thick: 12px`

### 1.6 Interaction Opacity (color-mix)

| 상태 | Normal | Light | Strong |
|------|--------|-------|--------|
| hovered | 0.05 | 0.04 | 0.08 |
| focused | 0.08 | 0.06 | 0.12 |
| pressed | 0.12 | 0.09 | 0.18 |

---

## 2. 사용 컨벤션

가장 자주 헷갈리는 부분을 명확히 정리.

### 2.1 Background 선택 가이드 ⭐

| 상황 | 토큰 |
|------|------|
| **앱 전체 베이스 / 작업 캔버스** | `--color-bg-normal-alternative` |
| **사이드바 / 헤더 / 탑바 (떠있는 패널)** | `--color-bg-elevated` |
| **카드 / 모달 / Step 노드** | `--color-bg-elevated` |
| **일반 표면 (위 둘 외 fallback)** | `--color-bg-normal` |
| **모달 backdrop** | `--color-material-dimmer` 또는 `rgba(0,0,0,.48)` |

> **핵심 — 다크 모드에서 `bg-elevated`가 가장 밝고(#212225), `bg-normal-alternative`가 가장 어둡다(#0f0f10).** 캔버스가 가장 어둡고, 그 위에 패널들이 밝게 떠 있는 구조.

### 2.2 Label 위계

| 위계 | 토큰 |
|------|------|
| 본문 기본 | `--color-label-normal` |
| 보조 정보 | `--color-label-alternative` |
| placeholder, 캡션 | `--color-label-assistive` |
| 비활성 | `--color-label-disable` |

### 2.3 Line / Border

- **솔리드 경계가 필요한 경우** → `--color-line-solid-normal`
- **반투명이 어울리는 경우** (콘텐츠 위 hover, 약한 구분) → `--color-line-normal` / `--color-line-alternative`
- **약한 구분선** → `--color-line-solid-alternative`

### 2.4 Fill (hover/active 배경)

- hover 상태 → `--color-fill-alternative`
- active/selected 상태 → `--color-fill-normal`
- pressed → `--color-fill-strong`

### 2.5 새 UI 작업 시작 시 체크리스트

- [ ] 배경 → 2.1 표 따라 결정
- [ ] 텍스트 위계 → 2.2 표 따라 결정
- [ ] 디자인 시스템 컴포넌트가 이미 있는지 3장 확인
- [ ] 없으면 토큰만으로 직접 구현 + 코드 주석으로 명시

---

## 3. 컴포넌트 39종

### 3.1 액션

#### Button — 메인 버튼
- variant: `solid` | `outlined`
- color: `primary` | `assistive`
- size: `large` | `medium` | `small`
- props: `label`, `leadingIcon`, `trailingIcon`, `iconOnly`, `disabled`, `loading`, `onClick`
- 예: `<Button label="확인" variant="solid" color="primary" size="medium" />`

#### TextButton — 텍스트만 버튼 (낮은 위계)
- color: `primary` | `assistive`
- size: `medium` | `small`
- props: `label`, `leadingIcon`, `trailingIcon`, `disabled`, `loading`, `onClick`

#### IconButton — 4종 변형 (별도 컴포넌트)
| 컴포넌트 | 용도 | 특이 props |
|---------|------|-----------|
| **IconButtonNormal** | 배경/테두리 없는 아이콘 버튼 | `badge` (빨간 점) |
| **IconButtonOutlined** | 외곽선 있는 중간 위계 | `size` (medium 40px / small 32px / custom) |
| **IconButtonSolid** | 채워진 높은 위계 | `backgroundColor` |
| **IconButtonBackground** | 원형 배경 | `alternative` (frosted vs solid) |
- 공통: `icon` (필수), `color`, `disabled`, `onClick`, `aria-label` (필수)

### 3.2 입력

#### Textfield — 단일 행 입력
- props: `status` (normal/positive/negative), `disabled`, `heading`, `required`, `description`, `placeholder`, `icon`, `trailingContent`, `trailingButton`, `forceFocused`, `...input props`
- `trailingButton`: `{label, variant:'normal'|'assistive', disabled}`
- 예: `<Textfield heading="이메일" required icon="mail" placeholder="example@..." />`

#### Textarea — 여러 행 입력
- props: `status` (normal/negative), `resize` (normal/limit/fixed), `disabled`, `heading`, `required`, `description`, `placeholder`, `maxLength`, `value`, `onChange`, `leadingContent`, `trailingContent`
- **resize**: normal=자유, limit=최대 208px 스크롤, fixed=고정 78px

#### Select — 드롭다운 **트리거만**
- props: `render` (text/chip), `status`, `disabled`, `forceFocused`, `heading`, `required`, `description`, `placeholder`, `value`, `leadingIcon`, `overflow`, `onRemoveChip`, `onClick`
- **드롭다운 패널은 Menu와 결합해 부모에서 직접 관리** (5.2 참조)

#### Checkbox
- props: `state` (unchecked/checked/indeterminate), `size` (medium/small), `tight`, `bold`, `disabled`, `label`, `onChange`

#### Radio
- props: `checked`, `size` (medium/small), `tight`, `disabled`, `label`, `onChange`

#### Switch
- props: `active`, `size` (medium/small), `platform` (normal/ios), `disabled`, `onChange`
- **⚠️ `onChange`는 인자를 받지 않음** — `onChange={() => setActive(!active)}` 패턴

#### SegmentedControl
- props: `variant` (solid/outlined), `size` (large/medium/small), `items` (Array<{label, icon?}> 2–6개), `value` (index), `onChange`

### 3.3 날짜·시간

#### Calendar — 월 단위 선택
- props: `mode` (single/range), `value`, `onChange`, `width`

#### DateInput — 트리거 + Calendar 팝오버
- props: `mode`, `value`, `onChange`, `placeholder`, `heading`, `disabled`, `calendarWidth`

#### TimeInput — 트리거 + TimeSlotChips 팝오버
- props: `value` (HH:MM), `onChange`, `slots`, `placeholder`, `heading`, `disabled`

#### TimeSlotChips — 시간 그리드
- props: `slots`, `value`, `onChange`, `columns`

### 3.4 디스플레이

#### Card — 썸네일 기반 정보 카드
- props: `platform` (desktop/mobile), `src`, `alt`, `title`, `caption`, `extraCaption`, `thumbnailOverlay`, `overlayCaption`, `saved`, `onToggleSave`, `onClick`, `skeleton`, `topContent`, `bottomContent`
- desktop = 3:2 썸네일 / mobile = 4:3
- `skeleton={true}` 시 콘텐츠 무시

#### Avatar — 프로필 이미지
- variant: `person` (원형) | `company` | `academy` (둥근 사각)
- size: `xsmall(24)` | `small(32)` | `medium(40)` | `large(48)` | `xlarge(56)`
- props: `src`, `alt`, `badge`, `interaction`, `onClick`

#### Thumbnail — 비율 고정 이미지
- props: `src`, `alt`, `ratio` (default '1/1'), `radius`

#### ListCard — Card + ListCell 조합

#### Typography
- variant: 위 1.2 표의 16종 + `-normal/-reading` suffix 있는 것
- weight: `bold` | `semibold` | `medium` | `regular`
- props: `color` (CSS 변수), `as` (HTML tag, default `p`)

#### Icon
- props: `name` (camelCase), `size` (number | xsmall/small/medium/large/xlarge), `color` (default currentColor)
- navigation 아이콘은 `navigationCareer` 형태로

#### Chip — 분류·상태 표시
- variant: `outlined` | `solid`
- size: `xsmall` | `small` | `medium` | `large`
- props: `active`, `disabled`, `label`, `leadingContent`, `trailingContent`, `onClick`

#### ContentBadge — 콘텐츠 뱃지
- props: `label`, `variant`

### 3.5 피드백

#### Alert — 다이얼로그
- props: `platform` (ios/android/web), `title`, `body` (필수), `primaryAction`, `secondaryAction`
- action: `{label, variant: 'normal'|'negative', onClick}`

#### Snackbar — 일시 알림
- props: `message`, `description`, `icon`, `actionLabel`, `onAction`, `onClose`

#### Toast — 토스트

#### Spinner — 로딩 인디케이터
- props: `size` (default 28), `color`, `trackColor`, `animate` (default true)

### 3.6 네비게이션 / 구조

#### Tab — 탭 바
- props: `items` (Array<{label, icon?}>), `value` (index), `onChange`, `size` (small/medium/large = 40/48/56px), `resize` (hug/fill), `horizontalPadding`, `trailingContent`, `scroll`

#### Menu — 드롭다운/컨텍스트 메뉴
- props: `items`, `variant` (normal/radio/checkbox), `cellPadding` ('8px'/'12px'), `actionArea`, `scrollable`
- item: `{type?, label, caption?, active?, disabled?, onClick?}`
- actionArea: `{leadingLabel, onLeadingAction, trailingLabel, onTrailingAction}`

#### Tooltip — 도움말
- props: `size` (medium/small), `position` (top/bottom/left/right), `align` (start/center/end), `label`, `shortcut`, `shortcutText`

#### Divider — 구분선
- props: `variant` (normal=1px / thick=12px), `vertical`

#### ListCell — 리스트 항목
- props: `label`, `description`, `verticalPadding` (none/small/medium/large), `verticalAlign` (top/center), `textEllipsis`, `selected`, `disabled`, `divider`, `chevron`, `leadingContent`, `trailingContent`, `onClick`

#### ActionArea — 메뉴 하단 액션 영역

#### Category — 카테고리 라벨/필터

#### FramedStyle — 프레임 스타일 wrapper

### 3.7 페이지네이션

#### PaginationDots — 도트 인디케이터
- props: `totalPages`, `currentPage` (0-based), `onChange`

#### PaginationNavigation — 이전/다음 버튼
- props: `hasPrevious`, `hasNext`, `onPrevious`, `onNext`

#### PageIndicatorCounter — "1 / 10" 카운터
- props: `currentPage`, `totalPages`

### 3.8 고급

#### ChatRoom — 채팅 UI 통합
- props: `title`, `placeholder`, `initialValue`, `initialMessages`, `topBanner`, `bottomBanner`, `onReset`, `onClose`, `onPlus`, `onSend`, `resetDisabled`, `closeDisabled`, `children`
- 메시지 객체 — user: `{id, type:'user', text}` / bot: `{id, type:'bot', botName, title, body, mainButton, subButton, timestamp, mode, ...}`
- **⚠️ chrome (상태바·헤더·입력) 토글 없음** — 5.3 참조

#### ToggleIcon — 상태별 아이콘 전환
- props: `active`, `offIcon`, `onIcon`, `onClick`

### 3.9 스켈레톤 / 체크

#### SkeletonText / SkeletonRect / SkeletonCircle — 로딩 플레이스홀더

#### CheckMark — 체크 마크 그래픽

---

## 4. 아이콘

`Icon` 컴포넌트의 `name` prop으로 사용. camelCase 변환된 파일명 그대로.

### 분류별

#### 화살표 (12종)
arrowDown, arrowLeft, arrowRight, arrowUp, arrowUpRight,
arrowDownThick, arrowLeftThick, arrowRightThick, arrowUpThick, arrowUpRightThick,
arrowTurnDownLeft, arrowTurnDownRight

#### Caret (2종)
caretDown, caretUp

#### Chevron (다수)
- 기본: chevronDown / Left / Right / Up
- Small / Thick / ThickSmall variants
- Tight: chevronLeftTight / RightTight (+ ThickSmall variants)
- Double: chevronDoubleLeft / Right (+ Small / Thick variants)

#### Circle (17종)
circle, circleFill, circleBlock, circleCheck(Fill), circleClose(Fill), circleDot, circleExclamation(Fill), circleInfo(Fill), circlePlus(Fill), circlePoint, circleQuestion(Fill), circleUpRight(Fill)

#### Square (다수)
square, squareFill, squareCaret, squareCheck, squareHan(gul), squareKana, squareLatin(Fill), squareMore, squarePlay, squarePlus(Fill)

#### Logo (11종)
logoApple, logoBrunch, logoFacebook, logoGooglePlay, logoInstagram, logoKakao, logoLinkedIn, logoMicrosoft, logoNaverBlog, logoX, logoYoutube

#### 자주 쓰는 의미 아이콘
- 일반: search, close(Thick), plus(Thick), minus(Thick), check(Thick), more(Horizontal/Vertical/VerticalTight), filter(Fill), refresh, reset, share, shareIos, download, upload, copy, externalLink, link, edit, pencil(Fill), trash, write
- 상태: bell(Fill, Plus), eye(Fill, Slash, SlashFill), bookmark(Fill), heart(Fill, InHeart), like(Fill), dislike(Fill), star(Fill), flag(Fill), pin(Fill), lock(Fill, Open, OpenFill)
- 대화: chat, message(Fill), bubble(Fill, Plus, PlusFill), phone(Fill), mail(Open)
- 사람: person(Fill, Plus, PlusFill), persons(Fill), agent, faceSmile(Fill)
- 문서: document(Fill), documentText(Fill), documentSearch, documentPerson(Fill), book(Fill), bookmark, folder(Fill), folderStar(Fill), folderJob(Fill), template(Fill)
- 미디어: image, camera(Fill), video, microphone(Fill, Slash, SlashFill), musicMicrophone, play, pause
- 데이터/도구: calendar, calendarPerson, clock(Fill), keyboard, code, setting, tune, palette(Fill), magicWand, sparkle(Fill, Alt)
- 위치/이동: home(Fill), location(Fill), compass(Fill), globe(Fill), pin(Fill), send(Fill)
- 경고/정보: exclamation, triangle(Fill), triangleExclamation(Fill), question, circleInfo(Fill), circleExclamation(Fill)
- 비즈니스: businessBag(Fill), graduation(Fill), passport(Fill), certificate, presentation, medal, trophy(Fill), crown(Fill), thunder(Fill), megaphone(Fill)

#### Navigation (5종)
navigationCareer, navigationMenu, navigationMypage, navigationRecruit, navigationSocial
(또는 prefix 없이 `career`, `menu`, ... 가능)

### Icon size 매핑

| size | px |
|------|-----|
| `xsmall` | 16 |
| `small` | 20 |
| `medium` | 28 |
| `large` | 32 |
| `xlarge` | 24 |
| number | 그대로 px |

---

## 5. 특이사항 / 함정

작업 중 자주 발이 걸리는 곳들. 새 컴포넌트 만들기 전에 한 번씩 확인.

### 5.1 Switch onChange는 인자 없음

```jsx
// ❌ 잘못된 예
<Switch active={isOn} onChange={(v) => setIsOn(v)} />

// ✅ 올바른 예
<Switch active={isOn} onChange={() => setIsOn(!isOn)} />
```

### 5.2 Select는 트리거 + Menu 결합

Select 자체는 드롭다운을 렌더하지 않음. 부모에서 Menu와 결합.

```jsx
const [open, setOpen] = useState(false)
const ref = useRef(null)
// ... ref 외부 클릭 시 닫기 useEffect

return (
  <div ref={ref} style={{ position: 'relative' }}>
    <Select value={selectedLabel} onClick={() => setOpen(o => !o)} forceFocused={open} />
    {open && (
      <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 30 }}>
        <Menu items={items} />
      </div>
    )}
  </div>
)
```

### 5.3 ChatRoom에 chrome 토글 없음

`ChatStatusBar`, `ChatHeader`, `ChatInput`은 항상 렌더. 숨기려면 CSS로 자식 인덱스 타깃.

```css
/* ChatRoom 루트의 자식: 1)상태바 2)헤더 3)스크롤 4)입력 */
.my-wrap > div > :nth-child(1),
.my-wrap > div > :nth-child(2),
.my-wrap > div > :nth-child(4) { display: none !important; }
```

### 5.4 디자인 시스템에 없는 컴포넌트

다음 패턴은 DS에 직접 대응이 없어 토큰으로 직접 구현 필요. 구현 시 **코드 주석으로 명시**.

- **입력 폼 모달** — Alert는 알림용이라 입력 필드를 못 담음. 직접 구현.
- **사이드바 네비게이션 항목** — Menu는 드롭다운, ListCell은 셀 단위. 라우터 NavLink 기반은 직접.
- **Ghost 카드 (`+` 추가)** — Card는 썸네일 기반이라 ghost용 아님.
- **캔버스 노드** — React Flow 외부 컴포넌트 사용.

### 5.5 Button color 옵션 한정

`color`는 `primary` | `assistive`만. **`negative`(빨강) 없음**. 삭제 버튼은 `outlined` + `assistive` + trash 아이콘으로.

### 5.6 Textfield의 `value`/`onChange`

`...props`로 `<input>`에 그대로 전달됨. 표준 React 패턴.
```jsx
<Textfield value={text} onChange={(e) => setText(e.target.value)} />
```

### 5.7 Avatar 크기 vs IconButtonOutlined small 정렬

`Avatar size="small"` = 32px = `IconButtonOutlined size="small"` 동일 크기. 헤더에서 둘 나란히 둘 때 매칭됨.

### 5.8 Tab은 인덱스 기반

react-router 와 연동하려면 URL → 인덱스 매핑 필요.

```jsx
const currentIndex = MODE_TABS.findIndex(t => location.pathname.endsWith(`/${t.key}`))
<Tab items={...} value={currentIndex} onChange={(i) => navigate(...)} />
```

### 5.9 다크 모드 자동 적용

`tokens.css`가 `:root[data-theme="dark"]`와 `@media (prefers-color-scheme: dark)` 모두 처리. **토큰만 쓰면 자동으로 다크 대응됨**.

### 5.10 forceFocused는 쇼케이스용

`Textfield`, `Select`, `Textarea`에서 `forceFocused={true}` 시 실제 포커스와 무관하게 포커스 스타일. **드롭다운 열림 상태를 시각화**하는 데도 유용.

### 5.11 Card skeleton

`<Card skeleton />` 시 다른 props 무시하고 로딩 스켈레톤 표시.

### 5.12 SegmentedControl outlined

outlined 모드에서는 세그먼트 간 우측 구분선 표시 (마지막 제외).

---

## 부록 — 자주 쓰는 패턴 모음

### A. 페이지 헤더
```jsx
<div className="page-header">
  <Typography variant="title-2" weight="bold" as="h1">{pageTitle}</Typography>
  <Button variant="solid" color="primary" leadingIcon={<Icon name="plus" />} label="..." />
</div>
```

### B. 폼 필드
```jsx
<Textfield heading="필드명" required description="설명" placeholder="..." />
<Textarea heading="긴 내용" resize="limit" maxLength={500} />
<SegmentedControl items={options} value={idx} onChange={setIdx} size="small" />
```

### C. 모달 (DS에 없어 직접 구현)
```jsx
{open && (
  <div className="modal-backdrop" onClick={onBackdrop}>
    <div className="modal" /* bg-elevated + radius + shadow */>
      <header /* head: border-bottom */>...</header>
      <div /* body */>...</div>
      <footer /* foot: 별도 배경 없음 */>
        <Button variant="outlined" color="assistive" label="취소" />
        <Button variant="solid" color="primary" label="확인" />
      </footer>
    </div>
  </div>
)}
```

### D. 사이드바 패널 (DS에 직접 대응 없음)
```css
.sidebar {
  width: 280px;
  background: var(--color-bg-elevated);
  border-right: 1px solid var(--color-line-solid-normal);
}
```

### E. 작업 캔버스 영역
```css
.canvas {
  background: var(--color-bg-normal-alternative);
}
```
