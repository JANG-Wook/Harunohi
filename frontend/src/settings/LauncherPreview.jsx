// 런처 미리보기(에디터용) — 고객사 홈페이지를 흉내낸 배경판(stage) 우측 하단에 런처 버튼 배치.
// 말풍선 + 버튼 + 꼬리 자체는 공용 LauncherButtonPreview 가 담당.

import Typography from '../design-system/components/Typography/Typography.jsx'
import LauncherButtonPreview from './LauncherButtonPreview.jsx'
import './LauncherPreview.css'

export default function LauncherPreview({ config }) {
  return (
    <div className="launcher-preview">
      <div className="launcher-preview__stage">
        {/* 배경판 중앙 안내 — 버튼 클릭을 막지 않도록 pointer-events:none */}
        <div className="launcher-preview__note" aria-hidden="true">
          <Typography variant="body-2-normal" color="var(--color-label-assistive)" as="span">
            코드를 삽입하면 웹사이트 우측 하단에 플로팅 런처 버튼이 표시됩니다.
          </Typography>
        </div>
        <div className="launcher-preview__dock">
          <LauncherButtonPreview config={config} />
        </div>
      </div>
    </div>
  )
}
