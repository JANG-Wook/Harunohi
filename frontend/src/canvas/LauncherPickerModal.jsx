// UI 적용 모달 — 챗봇 설정(런처) 목록에서 하나를 골라 봇 미리보기/시뮬레이터에 적용.
// 적용 결과는 봇에 launcherId 로 영속되고, 미리보기는 해당 런처의 대화방 UI 설정대로 렌더된다.

import { useEffect, useRef, useState } from 'react'
import Button from '../design-system/components/Button/Button.jsx'
import Icon from '../design-system/components/Icon/Icon.jsx'
import IconButtonNormal from '../design-system/components/IconButton/IconButtonNormal.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import { loadLauncherList, latestVersion, DEFAULT_LAUNCHER_ID } from '../lib/launcherConfig.js'
import './LauncherPickerModal.css'

export default function LauncherPickerModal({ open, currentLauncherId, onApply, onClose }) {
  const [launchers, setLaunchers] = useState([])
  const [selectedId, setSelectedId] = useState(currentLauncherId ?? DEFAULT_LAUNCHER_ID)
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setLaunchers(loadLauncherList())
    setSelectedId(currentLauncherId ?? DEFAULT_LAUNCHER_ID)
    dialogRef.current?.focus()
  }, [open, currentLauncherId])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const apply = () => {
    if (selectedId) onApply(selectedId)
  }

  return (
    <div
      className="lpm__backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="lpm__modal" role="dialog" aria-modal="true" aria-labelledby="lpm-title" ref={dialogRef} tabIndex={-1}>
        <header className="lpm__head">
          <Typography variant="headline-1" weight="semibold" as="span" id="lpm-title">
            UI 적용
          </Typography>
          <IconButtonNormal icon={<Icon name="close" size={18} />} size="small" onClick={onClose} aria-label="닫기" />
        </header>

        <p className="lpm__desc">적용할 챗봇 설정을 선택하면 미리보기와 시뮬레이터가 해당 대화방 UI로 표시됩니다.</p>

        <ul className="lpm__list sidebar-scroll">
          {launchers.map((entry) => {
            const selected = entry.id === selectedId
            const isApplied = entry.id === (currentLauncherId ?? DEFAULT_LAUNCHER_ID)
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  className={['lpm__item', selected && 'is-selected'].filter(Boolean).join(' ')}
                  onClick={() => setSelectedId(entry.id)}
                >
                  <span className="lpm__radio" aria-hidden="true">
                    {selected && <span className="lpm__radio-dot" />}
                  </span>
                  <span className="lpm__item-main">
                    <span className="lpm__item-name">
                      {entry.name}
                      {entry.id === DEFAULT_LAUNCHER_ID && <span className="lpm__badge">기본값</span>}
                    </span>
                    <span className="lpm__item-sub">최신 버전 / {latestVersion(entry)?.name ?? '—'}</span>
                  </span>
                  {isApplied && <span className="lpm__applied">적용 중</span>}
                </button>
              </li>
            )
          })}
        </ul>

        <footer className="lpm__foot">
          <Button variant="outlined" color="assistive" size="medium" label="취소" onClick={onClose} />
          <Button variant="solid" color="primary" size="medium" label="적용" disabled={!selectedId} onClick={apply} />
        </footer>
      </div>
    </div>
  )
}
