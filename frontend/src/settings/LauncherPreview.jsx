// 런처 미리보기(에디터용) — 고객사 홈페이지를 흉내낸 배경판(stage) 우측 하단에 런처 버튼 배치.
// 말풍선 + 버튼 + 꼬리 자체는 공용 LauncherButtonPreview 가 담당.

import LauncherButtonPreview from './LauncherButtonPreview.jsx'
import './LauncherPreview.css'

export default function LauncherPreview({ config }) {
  return (
    <div className="launcher-preview">
      <div className="launcher-preview__stage">
        <div className="launcher-preview__dock">
          <LauncherButtonPreview config={config} />
        </div>
      </div>
    </div>
  )
}
