// 모달 접근성 — 포커스 트랩 + 복원 훅.
// 열릴 때 모달 안 첫 포커스 가능한 요소(없으면 컨테이너)로 포커스 이동, Tab 순환을 모달 내부로 가둠,
// 닫힐 때 직전에 포커스됐던 요소로 복원. 시각 변화 없음(키보드 포커스 동작만 추가).
// Escape 닫기는 각 모달의 기존 핸들러를 그대로 둔다 (중복 처리 방지).

import { useEffect } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useFocusTrap(ref, isOpen) {
  useEffect(() => {
    if (!isOpen) return
    const node = ref.current
    if (!node) return

    const prevFocused = document.activeElement

    const getFocusable = () =>
      Array.from(node.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null)

    // 첫 포커스 — 모달 안에 이미 포커스가 있으면(autoFocus 등) 존중, 없을 때만 첫 요소로 이동
    if (!node.contains(document.activeElement)) {
      const focusables = getFocusable()
      ;(focusables[0] ?? node).focus?.()
    }

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return
      const items = getFocusable()
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    node.addEventListener('keydown', onKeyDown)
    return () => {
      node.removeEventListener('keydown', onKeyDown)
      // 닫힐 때 원래 위치로 복원 (요소가 아직 문서에 있을 때만)
      if (prevFocused && typeof prevFocused.focus === 'function' && document.contains(prevFocused)) {
        prevFocused.focus()
      }
    }
  }, [isOpen, ref])
}
