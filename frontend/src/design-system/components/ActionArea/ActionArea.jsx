/**
 * ActionArea (Bottom) 컴포넌트
 *
 * 화면 하단에 위치하는 주요 액션 영역입니다.
 * variant에 따라 버튼 레이아웃과 스타일이 달라집니다.
 *
 * Props:
 *  variant          — 'strong' | 'neutral' | 'compact' | 'cancel'   기본: 'strong'
 *  mainAction       — { label: string, onClick?: fn }               필수
 *  alternativeAction— { label: string, onClick?: fn } | null        선택
 *  subAction        — { label: string, onClick?: fn } | null        선택 (strong/neutral)
 *  caption          — string | null   strong/neutral: 버튼 위, compact: 왼쪽
 *  extra            — ReactNode | null  버튼 영역 위 콘텐츠 슬롯
 *  divider          — boolean  상단 구분선 표시 여부
 *  sticky           — boolean  sticky 모드 (상단 그라디언트 페이드)
 *  safeArea         — 'web' | 'ios' | 'android'                     기본: 'web'
 *  compactContent   — ReactNode | null  compact variant 왼쪽 콘텐츠 슬롯
 *  className        — 추가 클래스
 *
 * 사용 예:
 *  <ActionArea
 *    variant="strong"
 *    mainAction={{ label: '확인', onClick: handleConfirm }}
 *    alternativeAction={{ label: '취소', onClick: handleCancel }}
 *    divider
 *  />
 *  <ActionArea
 *    variant="compact"
 *    mainAction={{ label: '다음', onClick: handleNext }}
 *    compactContent={<span>선택된 항목 3개</span>}
 *    safeArea="ios"
 *  />
 */

const SAFE_AREA_HEIGHT = {
  web:     0,
  ios:     34,
  android: 14,
}

/* ── 버튼 base 스타일 ────────────────────────────────────────── */
const BTN_BASE = {
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  border:         'none',
  borderRadius:   'var(--spacing-12)',
  paddingTop:     'var(--spacing-12)',
  paddingBottom:  'var(--spacing-12)',
  paddingLeft:    'var(--spacing-24)',
  paddingRight:   'var(--spacing-24)',
  cursor:         'pointer',
  fontSize:       'var(--font-size-label-1)',
  lineHeight:     'var(--line-height-label-1)',
  fontWeight:     'var(--font-weight-semibold)',
  whiteSpace:     'nowrap',
  boxSizing:      'border-box',
}

function PrimaryButton({ label, onClick, style }) {
  return (
    <button
      style={{
        ...BTN_BASE,
        backgroundColor: 'var(--color-primary-normal)',
        color:           'var(--color-static-white)',
        ...style,
      }}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  )
}

function OutlinedButton({ label, onClick, style }) {
  return (
    <button
      style={{
        ...BTN_BASE,
        backgroundColor: 'transparent',
        border:          '1px solid var(--color-line-neutral)',
        color:           'var(--color-label-normal)',
        ...style,
      }}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  )
}

function SubTextButton({ label, onClick, primary }) {
  return (
    <button
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        background:     'none',
        border:         'none',
        cursor:         'pointer',
        paddingTop:     'var(--spacing-4)',
        paddingBottom:  'var(--spacing-4)',
        fontSize:       'var(--font-size-label-2)',
        lineHeight:     'var(--line-height-label-2)',
        fontWeight:     'var(--font-weight-semibold)',
        color:          primary
          ? 'var(--color-primary-normal)'
          : 'var(--color-label-alternative)',
        width:          '100%',
        textAlign:      'center',
      }}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  )
}

/* ── 그라디언트 오버레이 (sticky 모드) ─────────────────────────── */
function StickyGradient() {
  return (
    <div
      style={{
        height:     'var(--spacing-48)',
        background: 'linear-gradient(to bottom, transparent, var(--color-bg-elevated))',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}

/* ── 캡션 텍스트 ─────────────────────────────────────────────── */
const CAPTION_STYLE = {
  margin:     0,
  fontSize:   'var(--font-size-caption-1)',
  lineHeight: 'var(--line-height-caption-1)',
  fontWeight: 'var(--font-weight-regular)',
  color:      'var(--color-label-alternative)',
}

/* ── Strong 레이아웃 ─────────────────────────────────────────── */
function StrongLayout({ mainAction, alternativeAction, subAction, caption }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-12)' }}>
      {caption && (
        <p style={{ ...CAPTION_STYLE, textAlign: 'center' }}>{caption}</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
        <PrimaryButton
          label={mainAction.label}
          onClick={mainAction.onClick}
          style={{ width: '100%' }}
        />
        {alternativeAction && (
          <OutlinedButton
            label={alternativeAction.label}
            onClick={alternativeAction.onClick}
            style={{ width: '100%' }}
          />
        )}
      </div>
      {subAction && (
        <SubTextButton label={subAction.label} onClick={subAction.onClick} />
      )}
    </div>
  )
}

/* ── Neutral 레이아웃 ────────────────────────────────────────── */
function NeutralLayout({ mainAction, alternativeAction, subAction, caption }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-12)' }}>
      {caption && (
        <p style={{ ...CAPTION_STYLE, textAlign: 'center' }}>{caption}</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'row', gap: 'var(--spacing-12)' }}>
        {alternativeAction && (
          <OutlinedButton
            label={alternativeAction.label}
            onClick={alternativeAction.onClick}
            style={{ flex: 1 }}
          />
        )}
        <PrimaryButton
          label={mainAction.label}
          onClick={mainAction.onClick}
          style={{ flex: 1 }}
        />
      </div>
      {subAction && (
        <SubTextButton label={subAction.label} onClick={subAction.onClick} />
      )}
    </div>
  )
}

/* ── Compact 레이아웃 ────────────────────────────────────────── */
function CompactLayout({ mainAction, alternativeAction, caption, compactContent }) {
  const hasLeft = compactContent || caption

  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 'var(--spacing-12)' }}>
      {hasLeft && (
        <div style={{ flex: 1, minWidth: 0 }}>
          {compactContent ?? (
            caption && <p style={CAPTION_STYLE}>{caption}</p>
          )}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'row', gap: 'var(--spacing-8)', flexShrink: 0 }}>
        {alternativeAction && (
          <OutlinedButton
            label={alternativeAction.label}
            onClick={alternativeAction.onClick}
          />
        )}
        <PrimaryButton
          label={mainAction.label}
          onClick={mainAction.onClick}
        />
      </div>
    </div>
  )
}

/* ── Cancel 레이아웃 ─────────────────────────────────────────── */
function CancelLayout({ mainAction, subAction, caption }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-12)' }}>
      {caption && (
        <p style={{ ...CAPTION_STYLE, textAlign: 'center' }}>{caption}</p>
      )}
      <OutlinedButton
        label={mainAction.label}
        onClick={mainAction.onClick}
        style={{ width: '100%' }}
      />
      {subAction && (
        <SubTextButton label={subAction.label} onClick={subAction.onClick} primary />
      )}
    </div>
  )
}

/* ── ActionArea (Bottom) ─────────────────────────────────────── */
export default function ActionArea({
  variant          = 'strong',
  mainAction,
  alternativeAction = null,
  subAction         = null,
  caption           = null,
  extra             = null,
  divider           = false,
  sticky            = false,
  safeArea          = 'web',
  compactContent    = null,
  className,
  ...props
}) {
  const safeAreaH = SAFE_AREA_HEIGHT[safeArea] ?? 0

  const layoutProps = { mainAction, alternativeAction, subAction, caption, compactContent }

  return (
    <div
      className={className}
      role="region"
      aria-label="액션 영역"
      {...props}
    >
      {sticky && <StickyGradient />}

      {divider && (
        <div
          style={{ height: '1px', backgroundColor: 'var(--color-line-neutral)' }}
          role="separator"
          aria-hidden="true"
        />
      )}

      {extra && (
        <div style={{ marginTop: 'var(--spacing-20)', marginLeft: 'var(--spacing-20)', marginRight: 'var(--spacing-20)' }}>
          {extra}
        </div>
      )}

      <div style={{ padding: 'var(--spacing-20)' }}>
        {variant === 'strong'  && <StrongLayout  {...layoutProps} />}
        {variant === 'neutral' && <NeutralLayout {...layoutProps} />}
        {variant === 'compact' && <CompactLayout {...layoutProps} />}
        {variant === 'cancel'  && <CancelLayout  {...layoutProps} />}
      </div>

      {safeAreaH > 0 && (
        <div style={{ height: `${safeAreaH}px` }} aria-hidden="true" />
      )}
    </div>
  )
}
