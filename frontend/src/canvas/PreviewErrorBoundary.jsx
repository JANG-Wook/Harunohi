// 미리보기 렌더 예외를 가두는 에러 바운더리 — 한 노드의 미리보기가 터져도 앱 전체가 빈 화면이 되지 않게 한다.
// React 에러 바운더리는 클래스 컴포넌트로만 구현 가능.

import { Component } from 'react'

export default class PreviewErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80px',
            padding: 'var(--spacing-16)',
            color: 'var(--color-label-alternative)',
            border: '1px dashed var(--color-line-normal)',
            borderRadius: 'var(--spacing-8)',
            textAlign: 'center',
          }}
        >
          미리보기를 표시할 수 없습니다
        </div>
      )
    }
    return this.props.children
  }
}
