// 대화방 챗봇 기본 아바타 — 프로필 미설정 시 사용(로봇 아이콘 + 연파랑 배경).
// 아이콘 정의는 profileAvatar.js 가 단일 출처.

import { buildProfileAvatar } from './profileAvatar.js'

/** 기본 챗봇 아바타 (img src 로 사용 가능한 데이터 URI) */
export const DEFAULT_BOT_AVATAR = buildProfileAvatar('robot', '#EAF1FF')
