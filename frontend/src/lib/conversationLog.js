// 저장된 대화 로그 이벤트(content)를 조회 화면용 읽기 텍스트로 요약하는 헬퍼.
// content 형태는 런타임 history 이벤트와 동일(simulatorRuntime 참조).

/** 발신자 → 말풍선 방향/역할 (user=오른쪽, bot=왼쪽, system=중앙 안내). */
export function roleOf(sender) {
  if (sender === 'user') return 'user'
  if (sender === 'bot') return 'bot'
  return 'system'
}

/** 메시지 한 건을 읽기용 텍스트로 요약. 비면 빈 문자열. */
export function summarizeContent(contentType, content) {
  if (!content) return ''
  switch (contentType) {
    case 'user-click':
      return content.label ?? ''
    case 'user-utterance':
      return content.text ?? ''
    case 'system':
      return content.text ?? ''
    case 'memory-update':
      return `메모리 갱신: ${(content.keys ?? []).join(', ')}`
    case 'bot':
      return botText(content)
    default:
      return content.text ?? content.label ?? ''
  }
}

/** 봇 응답 이벤트 → 제목 + 본문 텍스트. 비면 폼 안내문으로 폴백. */
function botText(content) {
  const cfg = content?.response?.messageConfig
  const texts = cfg?.texts
  if (!texts) return ''
  const title = Array.isArray(texts.title)
    ? texts.title.map((t) => t?.text ?? '').join('')
    : (texts.title ?? '')
  const body = texts.body ?? ''
  const joined = [title, body].filter(Boolean).join('\n')
  return joined || cfg?.form?.guideText || ''
}
