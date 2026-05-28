// SSO 팝업 흐름 — 팝업 열기 + postMessage 리스너 + 토큰 교환 한 번에.
//
// 사용처: 시뮬레이터의 SSO 모드 응답에서 advanceSsoIfNeeded 가 호출.
//
// 동작.
//   1) ssoUrl 에 state 파라미터 부착해 팝업으로 open
//   2) 팝업이 window.opener.postMessage({ type:'harunohi:sso-success', authCode, state }) 보내길 대기
//   3) state 검증 (CSRF 방지)
//   4) exchangeUrl 에 authCode POST → accessToken / memberCode 받음
//   5) 결과 반환
//
// 종료 조건.
//   - 성공: { ok: true, accessToken, memberCode }
//   - 팝업 차단: { ok: false, error: '팝업 차단' }
//   - 팝업 닫힘 (취소): { ok: false, error: '로그인이 취소되었어요' }
//   - 타임아웃: { ok: false, error: '로그인 시간이 초과되었어요 (60초)' }
//   - URL 누락: { ok: false, error: '...설정 필요' }
//   - 교환 실패: { ok: false, error: 응답 메시지 }

const DEFAULT_TIMEOUT_MS = 60_000

/** state 생성 — CSRF 방지를 위해 매 호출마다 새 토큰 */
function generateState() {
  return `harunohi_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
}

/** ssoUrl 에 state 쿼리 파라미터 부착 — 기존 쿼리 유무에 따라 ? / & */
function withState(url, state) {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}state=${encodeURIComponent(state)}`
}

/**
 * SSO 전체 흐름을 Promise 로 실행.
 *
 * config: { ssoUrl, exchangeUrl }
 * options: { timeoutMs?: number }
 * 반환: Promise<{ ok, accessToken?, memberCode?, error? }>
 */
export function runSsoFlow({ ssoUrl, exchangeUrl }, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  return new Promise((resolve) => {
    if (!ssoUrl) {
      resolve({ ok: false, error: 'SSO URL 이 비어있어요. 응답 인스펙터에서 설정해 주세요.' })
      return
    }
    if (!exchangeUrl) {
      resolve({ ok: false, error: '토큰 교환 URL 이 비어있어요. 응답 인스펙터에서 설정해 주세요.' })
      return
    }

    const state = generateState()
    const url = withState(ssoUrl, state)
    const popup = window.open(url, 'harunohi-sso', 'width=460,height=720')

    if (!popup) {
      resolve({ ok: false, error: '팝업이 차단되었어요. 브라우저 설정에서 팝업을 허용해 주세요.' })
      return
    }

    let handled = false

    const cleanup = () => {
      window.removeEventListener('message', onMessage)
      clearInterval(closeTimer)
      clearTimeout(timeoutTimer)
      try {
        if (!popup.closed) popup.close()
      } catch {
        // 다른 출처면 closed 접근 거부될 수 있음 — 무시
      }
    }

    const finish = (result) => {
      if (handled) return
      handled = true
      cleanup()
      resolve(result)
    }

    const onMessage = async (event) => {
      const data = event?.data
      if (!data || data.type !== 'harunohi:sso-success') return
      if (data.state !== state) return // CSRF — 다른 인스턴스의 메시지 무시

      const authCode = data.authCode
      if (!authCode) {
        finish({ ok: false, error: 'authCode 가 누락된 응답' })
        return
      }

      try {
        const res = await fetch(exchangeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authCode }),
        })
        const raw = await res.text()
        let body = raw
        try {
          body = JSON.parse(raw)
        } catch {
          // JSON 아니면 그대로
        }
        if (!res.ok) {
          finish({
            ok: false,
            error: body?.message || `토큰 교환 실패 (${res.status})`,
          })
          return
        }
        finish({
          ok: true,
          accessToken: body?.accessToken ?? '',
          memberCode: body?.memberCode ?? '',
        })
      } catch (err) {
        finish({ ok: false, error: err?.message || '토큰 교환 네트워크 오류' })
      }
    }

    window.addEventListener('message', onMessage)

    // 사용자가 팝업을 그냥 닫는 경우 — closed 폴링
    const closeTimer = setInterval(() => {
      try {
        if (popup.closed) {
          finish({ ok: false, error: '로그인이 취소되었어요.' })
        }
      } catch {
        // ignore
      }
    }, 500)

    // 타임아웃
    const timeoutTimer = setTimeout(() => {
      finish({ ok: false, error: `로그인 시간이 초과되었어요 (${Math.round(timeoutMs / 1000)}초).` })
    }, timeoutMs)
  })
}
