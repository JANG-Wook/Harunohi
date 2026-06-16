// 인라인 굵기 편집 필드 — Tiptap 에디터 + 씬/레귤러/볼드 툴바.
// 저장은 평문이 아니라 runs(세그먼트 배열)다. 편집기 ↔ runs 직렬화를 이 컴포넌트가 담당하고
// 바깥에는 runs 만 노출한다(value/onChange). 굵기는 디자인 토큰(--font-weight-*)으로만 적용.

import { useEffect, useRef } from 'react'
import { Mark } from '@tiptap/core'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import HardBreak from '@tiptap/extension-hard-break'
import History from '@tiptap/extension-history'
import { DEFAULT_WEIGHT, isRunsEmpty, normalizeRuns, toRuns } from '../lib/richText.js'
import './RichTextField.css'

/** 굵기 마크 — regular 는 마크 없음(기본). thin/bold 만 span[data-weight] 으로 표현. */
const FontWeight = Mark.create({
  name: 'fontWeight',
  addAttributes() {
    return {
      weight: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-weight'),
        renderHTML: (attrs) =>
          attrs.weight
            ? { 'data-weight': attrs.weight, style: `font-weight: var(--font-weight-${attrs.weight})` }
            : {},
      },
    }
  },
  parseHTML() {
    return [{ tag: 'span[data-weight]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0]
  },
  addCommands() {
    return {
      setFontWeight:
        (weight) =>
        ({ commands }) =>
          weight === DEFAULT_WEIGHT
            ? commands.unsetMark(this.name)
            : commands.setMark(this.name, { weight }),
    }
  },
})

/** ProseMirror doc → runs. 문단 경계·하드브레이크는 '\n' 으로 직렬화. */
function docToRuns(doc) {
  const runs = []
  doc.forEach((para, _offset, index) => {
    if (index > 0) runs.push({ text: '\n', weight: DEFAULT_WEIGHT })
    para.forEach((node) => {
      if (node.isText) {
        const mark = node.marks.find((m) => m.type.name === 'fontWeight')
        runs.push({ text: node.text, weight: mark?.attrs?.weight ?? DEFAULT_WEIGHT })
      } else if (node.type.name === 'hardBreak') {
        runs.push({ text: '\n', weight: DEFAULT_WEIGHT })
      }
    })
  })
  return normalizeRuns(runs)
}

/** runs → ProseMirror JSON doc. '\n' 은 문단 분리로 복원. */
function runsToContent(runs) {
  const paras = [[]]
  for (const r of toRuns(runs)) {
    r.text.split('\n').forEach((seg, i) => {
      if (i > 0) paras.push([])
      if (seg) {
        const marks = r.weight === DEFAULT_WEIGHT ? [] : [{ type: 'fontWeight', attrs: { weight: r.weight } }]
        paras[paras.length - 1].push({ type: 'text', text: seg, marks })
      }
    })
  }
  return {
    type: 'doc',
    content: paras.map((inl) => (inl.length ? { type: 'paragraph', content: inl } : { type: 'paragraph' })),
  }
}

const key = (runs) => JSON.stringify(normalizeRuns(toRuns(runs)))

export default function RichTextField({ value, onChange, placeholder = '', multiline = false, status = 'normal', ariaLabel }) {
  // 마지막으로 바깥에 emit 한 runs — 외부 value 변경과 자가 변경을 구분(setContent 루프 방지)
  const lastEmitted = useRef(key(value))

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      History,
      FontWeight,
      ...(multiline ? [HardBreak] : []),
    ],
    content: runsToContent(value),
    editorProps: {
      attributes: { class: 'rtf__content', role: 'textbox', 'aria-label': ariaLabel || '' },
      // 단일 행(제목)은 Enter 로 문단이 늘지 않도록 차단
      handleKeyDown: (_view, event) => {
        if (!multiline && event.key === 'Enter') {
          event.preventDefault()
          return true
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      const runs = docToRuns(editor.state.doc)
      lastEmitted.current = key(runs)
      onChange(runs)
    },
  })

  // 외부 value 변경(카드 전환·기본값으로 등) 시 에디터 내용 동기화 — 자가 변경이면 건너뜀
  useEffect(() => {
    if (!editor) return
    if (key(value) === lastEmitted.current) return
    lastEmitted.current = key(value)
    editor.commands.setContent(runsToContent(value), { emitUpdate: false })
  }, [value, editor])

  const showPlaceholder = isRunsEmpty(value)

  // Bold 토글 — 선택 영역이 볼드면 active(라벨이 볼드체). 누르면 적용/해제 토글.
  const isBold = useEditorState({
    editor,
    selector: ({ editor }) => editor?.isActive('fontWeight', { weight: 'bold' }) ?? false,
  }) ?? false

  const toggleBold = (e) => {
    e.preventDefault() // 선택 영역 유지 + 버튼에 포커스 머무르지 않게
    editor?.chain().focus().setFontWeight(isBold ? 'regular' : 'bold').run()
  }

  return (
    <div className={['rtf', status === 'negative' && 'rtf--negative'].filter(Boolean).join(' ')}>
      <div className="rtf__toolbar">
        <button
          type="button"
          className={['rtf__weight', isBold && 'is-active'].filter(Boolean).join(' ')}
          style={{ fontWeight: isBold ? 'var(--font-weight-bold)' : 'var(--font-weight-regular)' }}
          onMouseDown={toggleBold}
          aria-pressed={isBold}
        >
          Bold
        </button>
      </div>
      <div className="rtf__box">
        {showPlaceholder && <span className="rtf__placeholder">{placeholder}</span>}
        <EditorContent editor={editor} className={multiline ? 'rtf__editor rtf__editor--multiline' : 'rtf__editor'} />
      </div>
    </div>
  )
}
