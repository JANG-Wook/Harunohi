// API 응답 viewer — JSON 트리. 각 leaf 필드에 "변수로 등록" 버튼.
//
// onRegisterVariable({ originalKey, sampleValue, sourcePath, sourceType: 'api' }) 콜백으로
// 부모(BotCanvasPage)에 전달, 봇 변수 목록에 추가됨.

import Icon from '../design-system/components/Icon/Icon.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import './ApiResponseViewer.css'

/** leaf 인지 판정 — 객체/배열이면 더 펼치고, 원시값이면 등록 가능한 leaf */
function isLeaf(value) {
  if (value === null || value === undefined) return true
  return typeof value !== 'object'
}

/** 한 노드를 그리는 재귀 컴포넌트 */
function TreeNode({ label, value, path, depth, onRegisterVariable }) {
  if (isLeaf(value)) {
    const display = String(value ?? '')
    return (
      <div className="resp-tree__row" style={{ paddingLeft: depth * 16 }}>
        <span className="resp-tree__key">{label}</span>
        <span className="resp-tree__value" title={display}>
          {display === '' ? <em className="resp-tree__empty">(빈 문자열)</em> : display}
        </span>
        <button
          type="button"
          className="resp-tree__register"
          onClick={() =>
            onRegisterVariable?.({
              originalKey: label,
              sampleValue: display,
              sourcePath: path,
              sourceType: 'api',
            })
          }
        >
          <Icon name="plus" size={12} />
          변수
        </button>
      </div>
    )
  }
  // 객체/배열 — 키 헤더 + 자식들 재귀
  const entries = Array.isArray(value)
    ? value.map((v, i) => [String(i), v])
    : Object.entries(value)
  return (
    <div className="resp-tree__group">
      <div className="resp-tree__row resp-tree__row--group" style={{ paddingLeft: depth * 16 }}>
        <span className="resp-tree__key">{label}</span>
        <span className="resp-tree__type">{Array.isArray(value) ? `[${entries.length}]` : '{…}'}</span>
      </div>
      {entries.map(([k, v]) => (
        <TreeNode
          key={k}
          label={k}
          value={v}
          path={path ? `${path}.${k}` : k}
          depth={depth + 1}
          onRegisterVariable={onRegisterVariable}
        />
      ))}
    </div>
  )
}

export default function ApiResponseViewer({ result, onRegisterVariable }) {
  if (!result) return null
  const { ok, status, body, error, calledAt } = result

  return (
    <section className="resp-tree">
      <header className="resp-tree__head">
        <Typography variant="label-1-normal" weight="semibold" color="var(--color-label-neutral)" as="span">
          응답
        </Typography>
        <span
          className={[
            'resp-tree__status',
            ok ? 'resp-tree__status--ok' : 'resp-tree__status--fail',
          ].join(' ')}
        >
          {error ? '오류' : `${status} ${ok ? 'OK' : 'FAIL'}`}
        </span>
        <Typography variant="caption-1" color="var(--color-label-assistive)" as="span">
          {new Date(calledAt).toLocaleTimeString('ko-KR')}
        </Typography>
      </header>

      {error ? (
        <div className="resp-tree__error">
          <Icon name="circleExclamationFill" size={14} color="var(--color-status-negative)" />
          <Typography variant="caption-1" color="var(--color-status-negative)" as="span">
            {error}
          </Typography>
        </div>
      ) : isLeaf(body) ? (
        <div className="resp-tree__error">
          <Typography variant="caption-1" color="var(--color-label-alternative)" as="span">
            응답이 JSON 객체가 아닙니다. 원본: {String(body ?? '')}
          </Typography>
        </div>
      ) : (
        <div className="resp-tree__body">
          {Object.entries(body).map(([k, v]) => (
            <TreeNode
              key={k}
              label={k}
              value={v}
              path={k}
              depth={0}
              onRegisterVariable={onRegisterVariable}
            />
          ))}
        </div>
      )}
    </section>
  )
}
