# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

Tradeoff: These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding
Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

> 📌 프로젝트 적용: 아래 「작업 프로세스 1단계」 및 「작업 원칙」 참조.

## 2. Simplicity First
Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes
Touch only what you must. Clean up only your own mess.

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

> 📌 프로젝트 적용: 아래 「금지 사항」의 "요청 범위 밖 리팩토링", "기존 아키텍처 임의 변경" 참조.

## 4. Goal-Driven Execution
Define success criteria. Loop until verified.

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

> 📌 프로젝트 적용: 아래 「작업 프로세스 3~4단계」 참조.

## 5. No Closing Colons (Korean Output)
End Korean sentences with a period, not a colon.

When the user writes in Korean, your output is also Korean:

- Don't end sentences with `:` even if the next line is a list or example.
- LLMs trained on English docs leak the colon habit into Korean. Catch it.
- The test: every Korean sentence terminator should be `.`, `?`, or `!` — not `:`.
- Colons are fine inside code, key-value pairs, or labels. Not as sentence enders.

## 6. File Header Comments in Korean
First line of every new source file: a one-line Korean comment stating its role.

When creating a new file:

- TypeScript/JavaScript: `// 사용자 인증 상태를 관리하는 Context Provider`
- Python: `# KIS API 호출을 비동기로 래핑하는 클라이언트`
- SQL: `-- 일별 집계 결과를 저장하는 머티리얼라이즈드 뷰`
- Place it directly under required directives (`'use client'`, `'use server'`, shebang).
- Skip config files (`*.config.ts`, `package.json`, etc.).

Why: agents read files selectively, not whole codebases. A one-line Korean header gives instant context so the next session (human or agent) can navigate without re-reading the entire file.

## 7. Plan + Checklist + Context Notes
Before any non-trivial task, produce three artifacts. Don't start coding without them.

- **Plan** — what we're building and why.
- **Checklist** (`checklist.md`) — concrete tasks as checkboxes. Tick as you go.
- **Context Notes** (`context-notes.md`) — decisions made during the work and the reasoning behind them. Append continuously.

If the user gives only a plan and asks you to start coding, stop and ask: "Should I create the checklist and context notes first?" The next session — yours or someone else's — needs the notes to pick up where you left off without re-deriving every decision.

> 📌 프로젝트 적용: 아래 「작업 프로세스 4단계: 작업 계획 보고」 참조.

## 8. Run Tests Before Marking Complete
If you touched code, run the tests before saying "done".

- `npm test`, `pytest`, `cargo test`, whatever the project uses — run it.
- If tests pass, report results. If they fail, fix and re-run.
- No test setup? At minimum, verify the project builds/compiles.
- Run tests proactively, before the user signals "끝", "완료", "다 됐어" — not after.

This is the step LLMs skip most often. Treat it as non-negotiable.

> 📌 프로젝트 적용: 아래 「작업 프로세스 6단계: 결과 검증」 참조.

## 9. Semantic Commits
Commit when one logical change is complete. Don't wait for the user to ask.

- The test: "Can I describe this commit in one sentence?" If yes, commit. If no, the changes are still mixed — split them.
- Good: "auth 미들웨어 추가". Bad: "auth 추가하고 UI도 고치고 버그도 수정" (split into 3).
- Don't accumulate 20 unrelated edits and lose the ability to roll back individually.
- Don't commit just to commit — meaningful units only.

Note: For solo prototypes or throwaway scripts, group commits loosely if it slows you down. The point is reversibility, not ceremony.

## 10. Read Errors, Don't Guess
Read the actual error/log line. Don't pattern-match from memory.

When something fails:

- Read the full error message and stack trace.
- Check the actual log output, not what you assume it should say.
- Don't apply a "common fix" before confirming the cause.
- If unclear, add a print/log to verify state — then fix.

This is the step LLMs skip most often after "run tests". They guess from error keywords and apply the most-recent-pattern fix. That's how a one-line bug becomes a three-file refactor.

> 📌 프로젝트 적용: 아래 「작업 프로세스 2단계: 원인 분석」 참조.

These guidelines are working if: fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

## 작업 경로 (필수)
새 세션이 열려도 아래 규칙을 반드시 따를 것.

- 프로젝트 루트: `/Users/mac/iXpert_Dev4/Harunohi`
- 프론트엔드: `/Users/mac/iXpert_Dev4/Harunohi/frontend` (Vite + React 19)
- 디자인 시스템: `/Users/mac/iXpert_Dev4/Harunohi/frontend/src/design-system` (HailMary 자산 이식)
- 문서: `/Users/mac/iXpert_Dev4/Harunohi/docs` (제품 정의, 데이터 모델, 와이어프레임 등)
- DB 스키마: `/Users/mac/iXpert_Dev4/Harunohi/db/schema.sql`
- 미리보기 서버: http://localhost:5178 (포트 5178)
- worktree 내부 경로(`.claude/worktrees/...`)는 편집 대상이 아니다.

## 프로젝트 고유 규칙

### 디자인 시스템 (필수)
- **UI 작업 전에 반드시 `docs/06-design-system-reference.md`를 먼저 확인할 것.**
  - 토큰 의미(특히 `bg-elevated` vs `bg-normal-alternative`), 컴포넌트 39종의 props, 함정(Switch onChange, Select+Menu 결합 등)이 모두 정리되어 있다.
  - 추측하지 말 것. 매번 reference 표를 보고 결정.
- **모든 UI는 HailMary 디자인 시스템 컴포넌트를 사용한다.**
  - `Button`, `Textfield`, `Textarea`, `Select`, `Tab`, `SegmentedControl`, `Card`, `Chip`, `Typography`, `Icon`, `IconButton(Normal/Outlined/Solid/Background)`, `Avatar`, `ChatRoom`, ...
  - 위치: `frontend/src/design-system/components/<Name>/<Name>.jsx`
- 네이티브 HTML 요소(`<button>`, `<input>`, `<select>`, `<textarea>`, `<h1>`~`<h6>` 등)로 새 UI를 만들지 않는다. 디자인 시스템에 없는 경우에만 토큰을 사용해 직접 구현하되, 그 사실을 코드 주석에 명시한다 (모달·사이드바 NavLink·ghost 카드 등이 해당).
- 모든 색상은 `tokens.css`의 CSS 변수(`--color-*`)를 통해서만 사용
- spacing은 `tokens.css`에 정의된 `--spacing-*` 값 사용
- 하드코딩된 색상(`#hex`, `rgb()`, `hsl()`) 절대 금지 — 단 `#ffffff` 같은 흰색을 primary 위에 올릴 때처럼 명백한 경우는 예외 (가능하면 토큰을 추가)
- `tokens.css`와 `tokens.js`는 항상 동기화 상태 유지

### 챗봇 빌더 도메인
- 시나리오는 **FAQ 시나리오**와 **기능 시나리오** 두 종류로 명확히 구분된다 (`docs/01-product-spec.md` 참조).
- 응답 모드는 **정적 메시지 / RAG 응답 / API 응답 렌더링** 3종. **완전 자유 LLM 생성은 금지**.
- 외부 노출 ID는 `public_id` (ULID). 내부 PK(`BIGINT`)는 노출하지 않는다.

## 작업 원칙
- **확장성/유연성 검토**: 현재 요구사항을 해결하되, 향후 확장이 막히지 않는 구조를 확인한다.
- **기존 코드 재사용**: 새로 만들기 전에 디자인 시스템 컴포넌트와 `tokens.css`, `tokens.js` 등 기존 리소스를 먼저 탐색한다.
- **커뮤니케이션**: 항상 개요(왜, 무엇을) → 상세 구현 계획 순서로 설명한다.

## 작업 프로세스 (필수)
> ⚠️ 추측을 사실처럼 말하지 말 것. 모든 가설은 반드시 검증 후 결론.
>
> ⛔ 코드 작성 전 반드시 4단계까지 완료하고 사용자 승인을 받을 것.

### 1단계: 문제/요청 이해
- 문제 현상을 명확히 기술한다.
- 불분명한 부분이 있으면 사용자에게 질문한다.
- "~일 것 같습니다"가 아니라 실제 코드를 확인한다.

### 2단계: 원인 분석 (문제 해결의 경우)
- 가설 수립 → 가설 검증 → 원인 확정
- ❌ "이게 원인입니다" (검증 없이)
- ✅ "가설: ~일 수 있습니다. 검증해보겠습니다." → "확인 결과, ~가 원인입니다"

### 3단계: 해결책 탐색
- 해결 방안 2~3개를 제시하고, 각 방안의 영향 범위를 분석한다.
- 사전 검증이 가능하면 검증한다.

### 4단계: 작업 계획 보고 (코드 작성 전 필수!)
> ⛔ 사용자가 "그냥 빨리 해줘"라고 해도, 이 보고를 먼저 하세요.

```
📋 작업 계획 보고

🔍 문제 상황 (What's wrong?)
어떤 상황에서 어떤 증상이 발생하는지, 왜 이 작업이 필요한지.

🎯 목표 (What we want to achieve)
이 작업이 완료되면 어떤 상태가 되어야 하는지.

🔬 원인 분석 (Why it happens) - 문제 해결의 경우
검증된 원인만 기술. 추측은 "가설"이라고 명시.

📁 변경 예정 파일
| 파일 경로 | 변경 내용 | 비고 |
|-----------|----------|------|

⚡ Before → After
[Before] 현재 상태
[After] 작업 후 기대 상태

🎨 디자인 토큰 & 컴포넌트 사용 계획
- 사용할 디자인 시스템 컴포넌트: Button, Textfield 등
- 사용할 CSS 변수: --color-*, --spacing-* 등
- 새로 필요한 토큰/컴포넌트: 있으면 명시 (없으면 "없음")

이대로 진행해도 될까요?
```

### 5단계: 작업 실행
- 승인받은 계획대로 진행한다.
- 예상치 못한 상황이 발생하면 중단 후 보고한다.

### 6단계: 결과 검증
| # | 확인 항목 | 필수 | 구체적 검증 방법 |
|---|----------|------|----------------|
| 1 | 빌드 에러 없음 | ✅ | `npm run build` 성공 |
| 2 | 네이티브 HTML 요소로 UI 임의 구현 안 함 | ✅ | 새 `<button>`, `<input>`, `<select>` 등이 디자인 시스템 컴포넌트로 대체됐는지 확인 |
| 3 | 하드코딩된 색상값 미사용 | ✅ | 새로 작성한 코드에 `#` + 6자리 패턴, `rgb()`, `hsl()` 등 없는지 확인 |
| 4 | 토큰 외 spacing 미사용 | ✅ | `8px`, `15px`, `24px` 등 `tokens.css`에 정의되지 않은 임의 값 없는지 확인 |
| 5 | 토큰 추가 시 동기화 | ✅ | `tokens.css`와 `tokens.js` 모두 수정했는지 확인 |
| 6 | 기존 기능 정상 동작 | ✅ | 기존 레이아웃/컴포넌트가 깨지지 않았는지 확인 |

### 7단계: 작업 완료
- 6단계 검증을 전부 통과한 후에만 "완료"를 선언한다.
- 변경 사항 요약을 보고한다.

## 금지 사항
| 금지 | 이유 | 올바른 대안 |
|------|------|-------------|
| 허락 없이 새 파일/컴포넌트 생성 | 프로젝트 구조 임의 변경 방지 | 사용자에게 먼저 제안 후 승인 |
| 기존 아키텍처 임의 변경 | 설계 의도 훼손 방지 | 변경 필요 시 이유와 함께 제안 |
| 요청 범위 밖 리팩토링 | 스코프 크립 방지 | "이 부분도 개선하면 좋겠는데, 할까요?" |
| 문제 발견 시 바로 수정 | 사용자가 다른 해결책을 원할 수 있음 | 문제 보고 → 해결책 2~3개 제시 → 승인 후 수정 |
| 디자인 시스템 컴포넌트 우회 | 일관성/접근성 파괴 | 디자인 시스템 컴포넌트 사용. 없으면 토큰으로 직접 구현 후 명시 |
| 디자인 토큰 없이 스타일링 | 디자인 시스템 일관성 파괴 | 항상 `var(--*)` 사용 |

## 디자인 토큰 규칙

### 스타일 값은 반드시 토큰을 통해 사용
```css
/* ❌ 금지: 하드코딩된 값 */
color: #3B82F6;
padding: 12px;
font-size: 14px;

/* ✅ 올바름: 디자인 토큰 사용 */
color: var(--color-primary-normal);
padding: var(--spacing-12);
font-size: var(--font-size-label-1);
```

### 토큰 추가 시 동기화 필수
새 토큰을 추가해야 할 경우, 아래 파일을 모두 동기화한다.

| 파일 | 역할 |
|------|------|
| `frontend/src/design-system/tokens.css` | CSS 변수 정의 (`:root`) |
| `frontend/src/design-system/tokens.js` | JS에서 사용하는 토큰 객체 (`export`) |

## 이전 세션 이어받기
- "완료됐다"는 요약을 그대로 믿지 않는다.
- 실제 코드 상태를 직접 확인한다 (파일 읽기, 검색으로 검증).
- 동작 테스트로 검증 후 진행한다.
