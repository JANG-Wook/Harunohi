// cURL 명령어 파서 — 비개발자가 개발자에게 받은 cURL 을 붙여넣어 자동 채우기.
//
// 지원 플래그.
//   -X / --request METHOD           HTTP method
//   -H / --header "Key: Value"       헤더 (여러 번)
//   -d / --data / --data-raw ...     Request Body
//   첫 인용/플래그 아닌 토큰         URL
// 백슬래시 + 개행은 공백으로 정규화.

const ARG_PATTERN =
  // 1) 작은따옴표 묶음 ('…') — 안에 escape 없음 (cURL 관례)
  // 2) 큰따옴표 묶음 ("…") — 안에 \" escape 가능
  // 3) 비공백 시퀀스
  /'([^']*)'|"((?:\\.|[^"\\])*)"|(\S+)/g

function tokenize(input) {
  const tokens = []
  // 라인 연결 (\\\n → 공백)
  const flat = input.replace(/\\\s*\n/g, ' ')
  let m
  while ((m = ARG_PATTERN.exec(flat)) !== null) {
    if (m[1] !== undefined) tokens.push(m[1])
    else if (m[2] !== undefined) tokens.push(m[2].replace(/\\(.)/g, '$1'))
    else tokens.push(m[3])
  }
  return tokens
}

/** cURL 문자열 → { method, url, headers, body, errors }.
 *  errors 는 발견된 경고들 (성공해도 일부 무시된 부분 안내). */
export function parseCurl(input) {
  const errors = []
  if (!input?.trim()) return { method: '', url: '', headers: [], body: '', errors: ['빈 입력'] }
  const tokens = tokenize(input.trim())
  if (tokens.length === 0) return { method: '', url: '', headers: [], body: '', errors: ['파싱 실패'] }
  // 첫 토큰이 'curl' 이면 건너뛰기
  let i = tokens[0] === 'curl' ? 1 : 0

  let method = ''
  let url = ''
  const headers = []
  let body = ''

  while (i < tokens.length) {
    const t = tokens[i]
    // 메소드
    if (t === '-X' || t === '--request') {
      method = (tokens[i + 1] || '').toUpperCase()
      i += 2
      continue
    }
    // 헤더
    if (t === '-H' || t === '--header') {
      const raw = tokens[i + 1] ?? ''
      const idx = raw.indexOf(':')
      if (idx > 0) {
        headers.push({
          id: headers.length + 1,
          key: raw.slice(0, idx).trim(),
          value: raw.slice(idx + 1).trim(),
        })
      } else {
        errors.push(`헤더 형식이 'Key: Value' 가 아닙니다: ${raw}`)
      }
      i += 2
      continue
    }
    // Body — -d / --data / --data-raw / --data-binary
    if (t === '-d' || t === '--data' || t === '--data-raw' || t === '--data-binary') {
      body = tokens[i + 1] ?? ''
      // body 가 있는데 method 미지정이면 cURL 관례상 POST
      if (!method) method = 'POST'
      i += 2
      continue
    }
    // 무시할 플래그 (값 + 다음 토큰 소비)
    if (
      t === '-A' || t === '--user-agent' ||
      t === '-e' || t === '--referer' ||
      t === '-u' || t === '--user' ||
      t === '--cookie' || t === '-b'
    ) {
      // 값을 헤더로 보존하지 않고 단순히 스킵 (학습용 도구라 OK)
      i += 2
      errors.push(`'${t}' 플래그는 무시됐습니다.`)
      continue
    }
    // boolean 플래그 (값 없음) — 무시
    if (
      t === '-L' || t === '--location' ||
      t === '-k' || t === '--insecure' ||
      t === '-v' || t === '--verbose' ||
      t === '-s' || t === '--silent' ||
      t === '-i' || t === '--include' ||
      t === '--compressed'
    ) {
      i += 1
      continue
    }
    // 알 수 없는 플래그
    if (t.startsWith('-')) {
      errors.push(`알 수 없는 플래그 '${t}' 는 무시됐습니다.`)
      i += 1
      continue
    }
    // URL — 첫 비플래그 토큰
    if (!url) {
      url = t
      i += 1
      continue
    }
    // 두 번째 비플래그 토큰은 무시
    i += 1
  }

  if (!method) method = 'GET'
  if (!url) errors.push('URL 을 찾지 못했습니다.')

  return { method, url, headers, body, errors }
}
