// 학습용 가짜 API 서버 — Vite dev 서버 미들웨어로 동작
//
// 두 가지 영역.
// 1) 가짜 SSO 로그인 — 별도 페이지(/mock-sso/login) + auth 엔드포인트 2종
//    실무의 OAuth2 authorization code flow 와 동일한 모양.
//      (a) 사용자가 /mock-sso/login 에서 ID/PW 로그인
//      (b) /api/mock/auth/login 이 짧은 임시 authCode 발급
//      (c) 챗봇이 /api/mock/auth/exchange 로 authCode → accessToken 교환
//      (d) 챗봇이 accessToken 을 Authorization 헤더에 실어 회원 정보 API 호출
// 2) 회원 정보 API — Bearer 토큰 필요. 메모리에서 토큰 → memberCode 매핑 후 데이터 반환.
//
// 토큰 저장소는 dev 서버 메모리(Map). 재시작하면 초기화 — 학습용이라 OK.

/* ── 데이터 ─────────────────────────────────────────────────── */

const MOCK_MEMBERS = {
  M001: {
    name: '홍길동',
    memberCode: 'M001',
    grade: 'VIP',
    isDelivering: 'Y',
    deliveryCount: 2,
    totalPurchase: 1250000,
  },
  M002: {
    name: '김영희',
    memberCode: 'M002',
    grade: 'GOLD',
    isDelivering: 'N',
    deliveryCount: 0,
    totalPurchase: 480000,
  },
  M003: {
    name: '이철수',
    memberCode: 'M003',
    grade: 'SILVER',
    isDelivering: 'Y',
    deliveryCount: 1,
    totalPurchase: 120000,
  },
  M004: {
    name: '박민지',
    memberCode: 'M004',
    grade: 'BRONZE',
    isDelivering: 'N',
    deliveryCount: 0,
    totalPurchase: 35000,
  },
}

// 모든 테스트 계정 비밀번호 동일 — 학습 편의
const MOCK_PASSWORD = '1234'

const RESPONSE_DELAY_MS = 200
const AUTH_CODE_TTL_MS = 60 * 1000 // 1분 (짧게 — 한 번 쓰면 폐기)
const ACCESS_TOKEN_TTL_MS = 60 * 60 * 1000 // 1시간

/* ── 토큰 저장소 — 메모리 ───────────────────────────────────── */

const issuedAuthCodes = new Map() // authCode → { memberCode, expiresAt, consumed }
const issuedAccessTokens = new Map() // accessToken → { memberCode, expiresAt }

function generateRandomToken(prefix) {
  const r = () => Math.random().toString(36).slice(2, 12)
  return `${prefix}_${r()}${r()}${r()}`
}

/* ── HTTP 유틸 ──────────────────────────────────────────────── */

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf-8')
      if (!raw) return resolve({})
      try {
        resolve(JSON.parse(raw))
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.end(JSON.stringify(payload))
}

function sendHtml(res, status, html) {
  res.statusCode = status
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.end(html)
}

function parseBearerToken(req) {
  const h = req.headers['authorization'] || req.headers['Authorization']
  if (!h || typeof h !== 'string') return null
  const m = h.match(/^Bearer\s+(.+)$/i)
  return m ? m[1].trim() : null
}

/* ── SSO 로그인 페이지 HTML ─────────────────────────────────── */

const SSO_LOGIN_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Harunohi SSO 로그인</title>
  <!-- Harunohi 디자인 토큰 — Vite dev 서버가 src/ 를 그대로 서빙 -->
  <link rel="stylesheet" href="/src/design-system/tokens.css" />
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--color-bg-normal);
      color: var(--color-label-normal);
    }
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-20);
    }
    .sso-card {
      width: 100%;
      max-width: 420px;
      background: var(--color-bg-elevated);
      border: 1px solid var(--color-line-solid-alternative);
      border-radius: var(--spacing-16);
      padding: var(--spacing-32) var(--spacing-28);
      box-shadow: 0px 8px 24px -8px rgba(23, 23, 23, 0.12);
    }
    .sso-card__brand {
      display: flex;
      align-items: center;
      gap: var(--spacing-8);
      margin-bottom: var(--spacing-8);
      color: var(--color-label-assistive);
      font-size: var(--font-size-caption-1);
      line-height: var(--line-height-caption-1);
      font-weight: 600;
      letter-spacing: 0.04em;
    }
    .sso-card__brand-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--color-primary-normal);
    }
    .sso-card__title {
      font-size: var(--font-size-title-2);
      line-height: var(--line-height-title-2);
      font-weight: 700;
      color: var(--color-label-normal);
      margin: 0 0 var(--spacing-24);
    }
    .sso-test {
      background: var(--color-fill-alternative);
      border-radius: var(--spacing-10);
      padding: var(--spacing-12) var(--spacing-16);
      margin-bottom: var(--spacing-20);
    }
    .sso-test__head {
      font-size: var(--font-size-caption-1);
      line-height: var(--line-height-caption-1);
      font-weight: 600;
      color: var(--color-label-neutral);
      margin-bottom: var(--spacing-6);
    }
    .sso-test__list {
      margin: 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .sso-test__item {
      display: flex;
      gap: var(--spacing-8);
      font-size: var(--font-size-caption-1);
      line-height: var(--line-height-caption-1);
      color: var(--color-label-alternative);
      font-family: 'SFMono-Regular', Consolas, monospace;
    }
    .sso-test__item code {
      color: var(--color-label-normal);
      font-weight: 600;
    }
    .sso-test__pw-note {
      margin-top: var(--spacing-6);
      font-size: var(--font-size-caption-1);
      line-height: var(--line-height-caption-1);
      color: var(--color-label-assistive);
    }
    .sso-form { display: flex; flex-direction: column; gap: var(--spacing-12); }
    .sso-field { display: flex; flex-direction: column; gap: var(--spacing-6); }
    .sso-field__label {
      font-size: var(--font-size-label-1);
      line-height: var(--line-height-label-1-normal);
      font-weight: 500;
      color: var(--color-label-neutral);
    }
    .sso-input {
      width: 100%;
      padding: var(--spacing-12) var(--spacing-16);
      background: var(--color-bg-normal);
      border: 1px solid var(--color-line-solid-normal);
      border-radius: var(--spacing-8);
      font-size: var(--font-size-body-2);
      line-height: var(--line-height-body-2-normal);
      font-family: inherit;
      color: var(--color-label-normal);
      outline: none;
      transition: border-color 120ms ease, box-shadow 120ms ease;
    }
    .sso-input:focus {
      border-color: var(--color-primary-normal);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-normal) 18%, transparent);
    }
    .sso-input::placeholder { color: var(--color-label-assistive); }
    .sso-button {
      width: 100%;
      padding: var(--spacing-12) var(--spacing-16);
      margin-top: var(--spacing-8);
      background: var(--color-primary-normal);
      color: #fff;
      border: none;
      border-radius: var(--spacing-8);
      font-size: var(--font-size-body-2);
      line-height: var(--line-height-body-2-normal);
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: filter 120ms ease;
    }
    .sso-button:hover { filter: brightness(0.95); }
    .sso-button:active { filter: brightness(0.9); }
    .sso-button:disabled { opacity: 0.4; cursor: not-allowed; }
    .sso-error {
      margin-top: var(--spacing-12);
      padding: var(--spacing-8) var(--spacing-12);
      background: color-mix(in srgb, var(--color-status-negative) 12%, transparent);
      color: var(--color-status-negative);
      border-radius: var(--spacing-6);
      font-size: var(--font-size-caption-1);
      line-height: var(--line-height-caption-1);
    }
    .sso-error[hidden] { display: none; }
    .sso-footer {
      margin-top: var(--spacing-20);
      text-align: center;
      font-size: var(--font-size-caption-1);
      line-height: var(--line-height-caption-1);
      color: var(--color-label-assistive);
    }
  </style>
</head>
<body>
  <main class="sso-card" role="main">
    <div class="sso-card__brand">
      <span class="sso-card__brand-dot" aria-hidden="true"></span>
      <span>HARUNOHI MOCK SSO</span>
    </div>
    <h1 class="sso-card__title">로그인</h1>

    <section class="sso-test" aria-label="테스트 계정 안내">
      <div class="sso-test__head">테스트 계정</div>
      <ul class="sso-test__list">
        <li class="sso-test__item"><code>M001</code><span>홍길동 · VIP · 배송 2건</span></li>
        <li class="sso-test__item"><code>M002</code><span>김영희 · GOLD · 미배송</span></li>
        <li class="sso-test__item"><code>M003</code><span>이철수 · SILVER · 배송 1건</span></li>
        <li class="sso-test__item"><code>M004</code><span>박민지 · BRONZE · 미배송</span></li>
      </ul>
      <div class="sso-test__pw-note">비밀번호는 모두 <code>1234</code></div>
    </section>

    <form class="sso-form" id="sso-form" autocomplete="off">
      <div class="sso-field">
        <label class="sso-field__label" for="sso-id">아이디</label>
        <input class="sso-input" id="sso-id" name="id" placeholder="예: M001" required />
      </div>
      <div class="sso-field">
        <label class="sso-field__label" for="sso-pw">비밀번호</label>
        <input class="sso-input" id="sso-pw" name="password" type="password" placeholder="1234" required />
      </div>
      <button class="sso-button" type="submit" id="sso-submit">로그인</button>
      <div class="sso-error" id="sso-error" role="alert" hidden></div>
    </form>

    <div class="sso-footer">학습용 가짜 SSO 페이지입니다.</div>
  </main>

  <script>
    (function () {
      var form = document.getElementById('sso-form')
      var submitBtn = document.getElementById('sso-submit')
      var errorEl = document.getElementById('sso-error')
      // 부모 창(챗봇) 으로부터 받은 state 값을 그대로 돌려주기 위함 — CSRF 방지의 전형
      var params = new URLSearchParams(window.location.search)
      var state = params.get('state') || ''

      function showError(msg) {
        errorEl.textContent = msg
        errorEl.hidden = false
      }

      form.addEventListener('submit', async function (e) {
        e.preventDefault()
        errorEl.hidden = true
        submitBtn.disabled = true
        submitBtn.textContent = '확인 중…'

        var id = document.getElementById('sso-id').value.trim()
        var password = document.getElementById('sso-pw').value
        try {
          var res = await fetch('/api/mock/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, password: password }),
          })
          var data = await res.json()
          if (!res.ok) {
            showError(data.message || '로그인에 실패했습니다.')
            submitBtn.disabled = false
            submitBtn.textContent = '로그인'
            return
          }
          // 성공 → 부모 창(챗봇)으로 authCode 전달 후 자동 닫힘
          if (window.opener) {
            window.opener.postMessage(
              { type: 'harunohi:sso-success', authCode: data.authCode, state: state },
              '*',
            )
          }
          submitBtn.textContent = '완료'
          // 부모가 메시지를 확실히 받을 시간을 약간 두고 닫음
          setTimeout(function () { window.close() }, 200)
        } catch (err) {
          showError('네트워크 오류가 발생했습니다.')
          submitBtn.disabled = false
          submitBtn.textContent = '로그인'
        }
      })
    })()
  </script>
</body>
</html>
`

/* ── 미들웨어 핸들러 ────────────────────────────────────────── */

/** GET /mock-sso/login — 별도 페이지 (Harunohi React 앱 바깥) */
function handleSsoLoginPage(req, res) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { code: 'METHOD_NOT_ALLOWED', message: 'GET 만 지원' })
  }
  return sendHtml(res, 200, SSO_LOGIN_HTML)
}

/** POST /api/mock/auth/login — ID/PW 검증 → 임시 authCode 발급 */
async function handleAuthLogin(req, res) {
  if (req.method === 'OPTIONS') return sendJson(res, 204, '')
  if (req.method !== 'POST') {
    return sendJson(res, 405, { code: 'METHOD_NOT_ALLOWED', message: 'POST 만 지원' })
  }
  let body
  try {
    body = await readJsonBody(req)
  } catch {
    return sendJson(res, 400, { code: 'INVALID_JSON', message: '올바른 JSON 이 아닙니다' })
  }

  await new Promise((r) => setTimeout(r, RESPONSE_DELAY_MS))

  const id = (body?.id ?? '').trim()
  const password = body?.password ?? ''

  if (!id || !password) {
    return sendJson(res, 400, { code: 'INVALID_REQUEST', message: 'id 와 password 가 필요합니다' })
  }

  const member = MOCK_MEMBERS[id]
  if (!member || password !== MOCK_PASSWORD) {
    return sendJson(res, 401, {
      code: 'INVALID_CREDENTIALS',
      message: '아이디 또는 비밀번호가 올바르지 않습니다',
    })
  }

  const authCode = generateRandomToken('ac')
  issuedAuthCodes.set(authCode, {
    memberCode: id,
    expiresAt: Date.now() + AUTH_CODE_TTL_MS,
    consumed: false,
  })
  return sendJson(res, 200, { code: 'OK', authCode, expiresIn: AUTH_CODE_TTL_MS / 1000 })
}

/** POST /api/mock/auth/exchange — authCode → accessToken 교환 (1회용) */
async function handleAuthExchange(req, res) {
  if (req.method === 'OPTIONS') return sendJson(res, 204, '')
  if (req.method !== 'POST') {
    return sendJson(res, 405, { code: 'METHOD_NOT_ALLOWED', message: 'POST 만 지원' })
  }
  let body
  try {
    body = await readJsonBody(req)
  } catch {
    return sendJson(res, 400, { code: 'INVALID_JSON', message: '올바른 JSON 이 아닙니다' })
  }

  await new Promise((r) => setTimeout(r, RESPONSE_DELAY_MS))

  const authCode = body?.authCode
  if (!authCode) {
    return sendJson(res, 400, { code: 'INVALID_REQUEST', message: 'authCode 가 필요합니다' })
  }
  const record = issuedAuthCodes.get(authCode)
  if (!record) {
    return sendJson(res, 401, { code: 'INVALID_AUTH_CODE', message: '존재하지 않는 authCode' })
  }
  if (record.consumed) {
    return sendJson(res, 401, { code: 'AUTH_CODE_CONSUMED', message: '이미 사용된 authCode' })
  }
  if (Date.now() > record.expiresAt) {
    return sendJson(res, 401, { code: 'AUTH_CODE_EXPIRED', message: '만료된 authCode' })
  }

  // 1회용 — 사용 표시
  record.consumed = true
  issuedAuthCodes.set(authCode, record)

  const accessToken = generateRandomToken('at')
  issuedAccessTokens.set(accessToken, {
    memberCode: record.memberCode,
    expiresAt: Date.now() + ACCESS_TOKEN_TTL_MS,
  })

  return sendJson(res, 200, {
    code: 'OK',
    accessToken,
    tokenType: 'Bearer',
    expiresIn: ACCESS_TOKEN_TTL_MS / 1000,
    memberCode: record.memberCode,
  })
}

/** POST /api/mock/member-info — Authorization: Bearer 필요 */
async function handleMemberInfo(req, res) {
  if (req.method === 'OPTIONS') return sendJson(res, 204, '')
  if (req.method !== 'POST') {
    return sendJson(res, 405, { code: 'METHOD_NOT_ALLOWED', message: 'POST 만 지원' })
  }
  await new Promise((r) => setTimeout(r, RESPONSE_DELAY_MS))

  const token = parseBearerToken(req)
  if (!token) {
    return sendJson(res, 401, {
      code: 'UNAUTHORIZED',
      message: 'Authorization 헤더(Bearer 토큰) 가 필요합니다',
    })
  }
  const tokenRecord = issuedAccessTokens.get(token)
  if (!tokenRecord) {
    return sendJson(res, 401, { code: 'INVALID_TOKEN', message: '존재하지 않는 토큰' })
  }
  if (Date.now() > tokenRecord.expiresAt) {
    issuedAccessTokens.delete(token)
    return sendJson(res, 401, { code: 'TOKEN_EXPIRED', message: '만료된 토큰' })
  }

  const member = MOCK_MEMBERS[tokenRecord.memberCode]
  if (!member) {
    return sendJson(res, 404, { code: 'NOT_FOUND', message: '회원을 찾을 수 없습니다' })
  }
  return sendJson(res, 200, { code: 'OK', message: 'success', data: member })
}

/* ── Vite 플러그인 ──────────────────────────────────────────── */

export default function mockApiPlugin() {
  return {
    name: 'harunohi-mock-api',
    configureServer(server) {
      server.middlewares.use('/mock-sso/login', handleSsoLoginPage)
      server.middlewares.use('/api/mock/auth/login', handleAuthLogin)
      server.middlewares.use('/api/mock/auth/exchange', handleAuthExchange)
      server.middlewares.use('/api/mock/member-info', handleMemberInfo)
    },
  }
}
