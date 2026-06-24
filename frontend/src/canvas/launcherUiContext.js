// 봇 빌더에 적용된 런처(챗봇 설정)의 대화방 UI 스타일을 하위(미리보기)로 전달하는 Context.
// 값은 chatUiStyle.resolveChatUi() 결과(또는 null=미적용 시 기본 챗룸).

import { createContext, useContext } from 'react'

export const LauncherUiContext = createContext(null)

export const useLauncherUi = () => useContext(LauncherUiContext)
