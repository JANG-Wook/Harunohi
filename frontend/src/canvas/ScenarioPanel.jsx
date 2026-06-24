// 좌측 패널 — Figma Pages/Layers 패턴. 상단 시나리오 목록 + 하단 선택 시나리오의 응답 목록.
// 시나리오 추가/선택/이름변경/삭제 + 응답 추가/선택/삭제 + 트리거 선택을 담당.

import { useEffect, useRef, useState } from 'react'
import Alert from '../design-system/components/Alert/Alert.jsx'
import Button from '../design-system/components/Button/Button.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import Textfield from '../design-system/components/Textfield/Textfield.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import { isStepComplete } from '../lib/stepTypes.js'
import VariableAddModal from './VariableAddModal.jsx'
import './ScenarioPanel.css'

export default function ScenarioPanel({
  // 변수 (봇 전역)
  variables = [],
  onAddVariable,
  onUpdateVariable,
  onDeleteVariable,
  // 등록 API (봇 전역)
  apis = [],
  onAddApi,
  onSelectApi,
  // 시나리오
  scenarios,
  currentScenarioId,
  onSelectScenario,
  onAddScenario,
  onRenameScenario,
  onDeleteScenario,
  getIncomingLinks,
  // 응답 (현재 시나리오 기준)
  responses,
  selectedResponseId,
  onSelectResponse,
  onAddResponse,
  onDeleteResponse,
  onRenameResponse,
  // 트리거 — 현재 시나리오의 트리거 선택
  triggerSelected,
  onSelectTrigger,
  // UI 적용 — 적용된 런처(챗봇 설정) 이름 + 모달 열기
  appliedLauncherName,
  onApplyUI,
}) {
  /* 변수 모달 — null = 닫힘, { isNew, variable } = 열림 */
  const [variableModal, setVariableModal] = useState(null)
  const openAddVariable = () => setVariableModal({ isNew: true, variable: null })
  const openEditVariable = (v) => setVariableModal({ isNew: false, variable: v })
  const closeVariableModal = () => setVariableModal(null)
  /* 이름 변경 중인 시나리오 id — null 이면 모두 보기 모드 */
  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef(null)

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renamingId])

  const startRename = (sc) => {
    setRenamingId(sc.id)
    setRenameValue(sc.name)
  }
  const commitRename = () => {
    const trimmed = renameValue.trim()
    if (renamingId && trimmed) onRenameScenario(renamingId, trimmed)
    setRenamingId(null)
  }
  const cancelRename = () => setRenamingId(null)

  /* 이름 변경 중인 응답 id — 시나리오 rename 과 별도 상태 (동시에 두 개 활성 불가) */
  const [renamingResponseId, setRenamingResponseId] = useState(null)
  const [renameResponseValue, setRenameResponseValue] = useState('')
  const renameResponseInputRef = useRef(null)

  useEffect(() => {
    if (renamingResponseId && renameResponseInputRef.current) {
      renameResponseInputRef.current.focus()
      renameResponseInputRef.current.select()
    }
  }, [renamingResponseId])

  const startRenameResponse = (step) => {
    setRenamingResponseId(step.id)
    setRenameResponseValue(step.name)
  }
  const commitRenameResponse = () => {
    const trimmed = renameResponseValue.trim()
    if (renamingResponseId && trimmed) onRenameResponse?.(renamingResponseId, trimmed)
    setRenamingResponseId(null)
  }
  const cancelRenameResponse = () => setRenamingResponseId(null)

  /* 삭제 확인 다이얼로그 — 응답 개수를 보여주고 동의 받기 */
  const [deleteTarget, setDeleteTarget] = useState(null)
  const askDelete = (sc) => setDeleteTarget(sc)
  const confirmDelete = () => {
    if (deleteTarget) onDeleteScenario(deleteTarget.id)
    setDeleteTarget(null)
  }

  /* 삭제 가드 다이얼로그 — Esc 닫기 */
  useEffect(() => {
    if (!deleteTarget) return
    const onKey = (e) => {
      if (e.key === 'Escape') setDeleteTarget(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [deleteTarget])

  /* 삭제 가드용 응답 이름 미리보기 (최대 5개) — 시나리오 안의 응답 이름들 */
  const previewResponses = deleteTarget?.responses ?? []
  const previewNames = previewResponses.slice(0, 5).map((r) => r.name || '(이름 없음)')
  const extraCount = previewResponses.length - previewNames.length

  /* 다른 시나리오에서 이 시나리오로 들어오는 cross-scenario 링크 정보 (최대 5개 미리보기) */
  const incomingLinks = deleteTarget && getIncomingLinks ? getIncomingLinks(deleteTarget.id) : []
  const incomingPreview = incomingLinks
    .slice(0, 5)
    .map((l) => `${l.fromScenarioName} · ${l.fromResponseName}`)
  const incomingExtra = incomingLinks.length - incomingPreview.length

  /* 삭제 다이얼로그 body 조립 — 응답 N개 + (있으면) 들어오는 링크 정보 */
  let deleteBody = ''
  if (deleteTarget) {
    if (previewResponses.length === 0) {
      deleteBody = '시나리오에 응답이 없습니다. 삭제하면 되돌릴 수 없습니다.'
    } else {
      deleteBody = `이 시나리오에 응답 ${previewResponses.length}개가 들어있어요. 함께 삭제됩니다.\n${previewNames.join(', ')}${extraCount > 0 ? ` 외 ${extraCount}개` : ''}`
    }
    if (incomingLinks.length > 0) {
      deleteBody += `\n\n다른 시나리오에서 이 시나리오로 연결된 링크 ${incomingLinks.length}개가 끊어집니다.\n${incomingPreview.join(', ')}${incomingExtra > 0 ? ` 외 ${incomingExtra}개` : ''}`
    }
  }

  return (
    <aside className="scenario-panel">
      {/* ── API 섹션 (봇 전역, 데이터 소스 — 변수의 인과 상위) ── */}
      <div className="scenario-panel__section scenario-panel__section--apis">
        <div className="scenario-panel__head">
          <Typography variant="label-1-normal" weight="semibold" color="var(--color-label-neutral)" as="span">
            API
          </Typography>
          <button
            type="button"
            className="scenario-panel__action scenario-panel__action--add"
            onClick={() => onAddApi?.()}
            aria-label="API 추가"
          >
            <Icon name="plus" size={14} />
          </button>
        </div>
        {apis.length === 0 ? (
          <div className="scenario-panel__empty">
            <Typography variant="caption-1" color="var(--color-label-assistive)" as="span">
              아직 등록된 API 가 없어요.
            </Typography>
          </div>
        ) : (
          <ul className="scenario-panel__apis sidebar-scroll">
            {apis.map((a) => (
              <li
                key={a.id}
                className="scenario-panel__api"
                onClick={() => onSelectApi?.(a.id)}
              >
                <span className="scenario-panel__api-method">{a.method}</span>
                <span className="scenario-panel__api-name" title={a.url}>
                  {a.name || '(이름 없음)'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── 변수 섹션 (봇 전역, API 응답에서 파생됨) ──────────── */}
      <div className="scenario-panel__section scenario-panel__section--variables">
        <div className="scenario-panel__head">
          <Typography variant="label-1-normal" weight="semibold" color="var(--color-label-neutral)" as="span">
            변수
          </Typography>
          <button
            type="button"
            className="scenario-panel__action scenario-panel__action--add"
            onClick={openAddVariable}
            aria-label="변수 추가"
          >
            <Icon name="plus" size={14} />
          </button>
        </div>
        {variables.length === 0 ? (
          <div className="scenario-panel__empty">
            <Typography variant="caption-1" color="var(--color-label-assistive)" as="span">
              아직 등록된 변수가 없어요.
            </Typography>
          </div>
        ) : (
          <ul className="scenario-panel__variables sidebar-scroll">
            {variables.map((v) => {
              const displayKey = v.displayName?.trim() || v.originalKey
              return (
                <li
                  key={v.id}
                  className="scenario-panel__variable"
                  onClick={() => openEditVariable(v)}
                >
                  <span className="scenario-panel__variable-key">
                    {`{{$${displayKey}}}`}
                  </span>
                  <span className="scenario-panel__variable-value" title={v.sampleValue}>
                    {v.sampleValue || '—'}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* ── 시나리오 섹션 ──────────────────────────────────────── */}
      <div className="scenario-panel__section scenario-panel__section--scenarios">
        <div className="scenario-panel__head">
          <Typography variant="label-1-normal" weight="semibold" color="var(--color-label-neutral)" as="span">
            시나리오
          </Typography>
          <button
            type="button"
            className="scenario-panel__action scenario-panel__action--add"
            onClick={onAddScenario}
            aria-label="시나리오 추가"
          >
            <Icon name="plus" size={14} />
          </button>
        </div>

        <ul className="scenario-panel__scenarios sidebar-scroll">
          {scenarios.map((sc) => {
            const isActive = sc.id === currentScenarioId
            const isRenaming = renamingId === sc.id
            return (
              <li
                key={sc.id}
                className={[
                  'scenario-panel__scenario',
                  isActive && 'scenario-panel__scenario--active',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => !isRenaming && onSelectScenario(sc.id)}
              >
                {isRenaming ? (
                  <input
                    ref={renameInputRef}
                    type="text"
                    className="scenario-panel__scenario-rename"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename()
                      if (e.key === 'Escape') cancelRename()
                    }}
                    onClick={(e) => e.stopPropagation()}
                    aria-label="시나리오 이름"
                  />
                ) : (
                  <span
                    className="scenario-panel__scenario-name"
                    onDoubleClick={(e) => {
                      e.stopPropagation()
                      startRename(sc)
                    }}
                  >
                    {sc.name}
                  </span>
                )}
                <div className="scenario-panel__scenario-actions">
                  <button
                    type="button"
                    className="scenario-panel__action scenario-panel__action--edit"
                    aria-label="시나리오 이름 변경"
                    onClick={(e) => {
                      e.stopPropagation()
                      startRename(sc)
                    }}
                  >
                    <Icon name="pencil" size={12} />
                  </button>
                  <button
                    type="button"
                    className="scenario-panel__action scenario-panel__action--delete"
                    aria-label="시나리오 삭제"
                    disabled={scenarios.length <= 1}
                    onClick={(e) => {
                      e.stopPropagation()
                      askDelete(sc)
                    }}
                  >
                    <Icon name="close" size={12} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {/* ── 응답 섹션 ──────────────────────────────────────────── */}
      <div className="scenario-panel__section scenario-panel__section--responses">
        <div className="scenario-panel__head">
          <Typography variant="label-1-normal" weight="semibold" color="var(--color-label-neutral)" as="span">
            응답
          </Typography>
          <Button
            variant="solid"
            color="primary"
            size="small"
            label="응답 추가"
            onClick={onAddResponse}
          />
        </div>

        <div className="scenario-panel__search">
          <Textfield placeholder="검색" icon="search" />
        </div>

        <div className="scenario-panel__total">
          <Typography variant="caption-1" color="var(--color-label-assistive)" as="span">
            전체 {responses.length}개
          </Typography>
        </div>

        <ul className="scenario-panel__items sidebar-scroll">
          {/* 트리거 — 현재 시나리오의 진입점, 고정 항목 */}
          <li
            className={[
              'scenario-panel__item',
              'scenario-panel__item--trigger',
              triggerSelected && 'scenario-panel__item--active',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={onSelectTrigger}
          >
            <span
              className="scenario-panel__item-icon"
              style={{ color: 'var(--color-primary-normal)' }}
            >
              <Icon name="thunderFill" size={16} />
            </span>
            <Typography variant="label-1-normal" weight="medium" as="span">
              트리거
            </Typography>
          </li>

          {responses.map((step) => {
            const isSelected = step.id === selectedResponseId
            const complete = isStepComplete(step)
            const statusIcon = complete ? 'circleCheck' : 'triangleExclamationFill'
            const statusColor = complete
              ? 'var(--color-label-alternative)'
              : 'var(--color-status-cautionary)'
            const isRenaming = renamingResponseId === step.id

            return (
              <li
                key={step.id}
                className={[
                  'scenario-panel__item',
                  isSelected && 'scenario-panel__item--active',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => !isRenaming && onSelectResponse(step.id)}
              >
                <span className="scenario-panel__item-icon" style={{ color: statusColor }}>
                  <Icon name={statusIcon} size={16} />
                </span>
                {isRenaming ? (
                  <input
                    ref={renameResponseInputRef}
                    type="text"
                    className="scenario-panel__item-rename"
                    value={renameResponseValue}
                    onChange={(e) => setRenameResponseValue(e.target.value)}
                    onBlur={commitRenameResponse}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRenameResponse()
                      if (e.key === 'Escape') cancelRenameResponse()
                    }}
                    onClick={(e) => e.stopPropagation()}
                    aria-label="응답 이름"
                  />
                ) : (
                  <span
                    className="scenario-panel__item-name"
                    onDoubleClick={(e) => {
                      e.stopPropagation()
                      startRenameResponse(step)
                    }}
                  >
                    {step.name}
                  </span>
                )}
                {/* 응답 액션 버튼들 — 호버 시 노출. DS 에 24px 타이트 아이콘 버튼이 없어 토큰으로 직접 구현 */}
                <div className="scenario-panel__item-actions">
                  <button
                    type="button"
                    className="scenario-panel__action scenario-panel__action--edit"
                    aria-label="응답 이름 변경"
                    onClick={(e) => {
                      e.stopPropagation()
                      startRenameResponse(step)
                    }}
                  >
                    <Icon name="pencil" size={12} />
                  </button>
                  <button
                    type="button"
                    className="scenario-panel__action scenario-panel__action--delete"
                    aria-label="응답 삭제"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteResponse?.(step.id)
                    }}
                  >
                    <Icon name="close" size={12} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {/* UI 적용 — 맨 아래 고정. 적용된 챗봇 설정(런처) 이름 표시 */}
      <div className="scenario-panel__footer">
        <button type="button" className="scenario-panel__apply" onClick={onApplyUI}>
          <span className="scenario-panel__apply-label">UI 적용</span>
          {appliedLauncherName && (
            <span className="scenario-panel__apply-current">{appliedLauncherName}</span>
          )}
          <Icon name="chevronRightSmall" size={16} />
        </button>
      </div>

      {/* 변수 등록/편집 모달 — 신규: onAddVariable, 편집: onUpdateVariable + 모달 내 삭제 */}
      {variableModal && (
        <VariableAddModal
          variable={variableModal.variable}
          isNew={variableModal.isNew}
          existing={variables}
          onSubmit={(payload) => {
            if (variableModal.isNew) {
              onAddVariable?.(payload)
            } else {
              onUpdateVariable?.(variableModal.variable.id, payload)
            }
            closeVariableModal()
          }}
          onDelete={
            variableModal.isNew
              ? undefined
              : () => {
                  onDeleteVariable?.(variableModal.variable.id)
                  closeVariableModal()
                }
          }
          onClose={closeVariableModal}
        />
      )}

      {/* 시나리오 삭제 확인 다이얼로그 — 응답 개수와 이름 목록을 함께 보여줌 */}
      {deleteTarget && (
        <div
          className="scenario-panel__modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteTarget(null)
          }}
        >
          <Alert
            platform="web"
            title={`'${deleteTarget.name}' 시나리오를 삭제하시겠어요?`}
            body={deleteBody}
            primaryAction={{ label: '삭제', variant: 'negative', onClick: confirmDelete }}
            secondaryAction={{ label: '취소', onClick: () => setDeleteTarget(null) }}
          />
        </div>
      )}
    </aside>
  )
}
