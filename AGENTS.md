# 모든 에이전트 공통 필수 규칙 — Team G

이 저장소를 작업하는 Codex, 하위 에이전트, Dot, PAOS 및 기타 자동화 도구는 작업 전에 이 규칙을 확인한다. 사용자가 반복해서 강조하고 모든 에이전트에게 공유하도록 명시한 지침이다.

- 사용자의 구체적인 변경 지시 없이는 디자인, 와이어프레임, 레이아웃을 변경하지 않는다.
- 특히 온보딩의 원본 디자인, HTML/CSS, 화면 구성 및 진입 흐름을 그대로 유지한다.
- “목업 데이터 전부 삭제”, “골조만 남기기”는 디자인 변경이나 온보딩 화면 대체를 허용하는 지시가 아니다.
- 목업 정리는 데이터와 연결 로직에 한정한다. 화면 또는 진입 흐름을 바꿔야 한다면 임의로 진행하지 말고 구체적인 영향을 설명하고 범위를 확인한다.
- 작업 전 Git 상태와 기존 로컬 변경을 확인하고 보존한다. 작업 후 diff에서 디자인과 온보딩 진입 흐름을 변경하지 않았는지 검토한다.
- 다른 에이전트에게 작업을 인계하거나 위임할 때 이 규칙을 반드시 함께 전달한다. 이 파일에 기록했다는 이유만으로 외부 도구나 다른 대화에 전달 완료했다고 주장하지 않는다.

- G팀 쇼핑몰 프로젝트에서 CSS를 새로 작성하거나 추가할 때는 별도 CSS 파일을 만들지 않고 `app/globals.css`를 사용한다. 기존 선택자와 적용 범위를 유지한다. 이 규칙은 다른 프로젝트에는 적용하지 않는다.

## 취향·메인 추천 연결 및 검토 순서 — 2026-10-30

- 현재 겉모습·서버 이미지·이미지 역할·페이지와 컴포넌트 계층을 보존한다. 저장된 취향은 메인 추천 캐러셀에 연결한다. 로그인·취향 미저장은 기존 취향 찾기 안내 카드, 비로그인은 랜덤 상품을 표시한다. 사용자 승인 이미지 예외: 첫 추천 원물은 06 투명 컷아웃, DIY 메인·목록은 기존 투명 컷아웃을 사용하며 상세 갤러리는 유지한다. 관련 API 계약과 결정 이력은 `TASTE-HOME-FLOW.md`를 따른다.
- 변경은 GitHub 이슈 → 작업 브랜치 → PR → 바로 독립 테스트·검증 및 Claude Code 교차검토 → 수정·재검증 → 사람 머지 순서로 진행한다. 자동 머지·머지 전 배포 금지. 실행하지 못한 검토는 미검증이다.
- 프로젝트 대화·검토 전달은 한국어를 사용한다. 기존 영문 제품 UI는 별도 변경 지시 없이 번역하지 않는다.

## Shared context source

- Canonical shared context: https://github.com/axfehlerlee/my-ai-context/blob/main/AI_CONTEXT.md (project display name: `paos`; main dot: `에요`). Read the relevant current sections when project context or all-agent sharing is required; do not substitute local memory for this source.
- For all-agent sharing, follow the repository's `/all` policy: prepare English handoffs, update authorized shared records, notify only connected in-scope agents, and distinguish saved, delivered, acknowledged, and adopted states.
- The Team G design and onboarding preservation rules above remain mandatory. A shared-context update does not authorize changing product design.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Ignore routine debugging and unverified changes. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Keep a qualifying candidate through the reporting pass even if you resolve or work around it. A successful fix changes the report outcome; it does not erase the friction that qualified it.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `node node_modules/next/dist/bin/next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->
