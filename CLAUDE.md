# 프로젝트: 음성 기반 DRT 프로토타입 (하루 제작 버전)

## 목적
하루 안에 만드는 발표 시연용 웹앱. 실제 운영 기능이 아니라, 핵심 기능 3가지가 작동하는 "흐름"을 보여주는 것이 목적이다.
완벽함보다 끝까지 작동하는 것이 우선이다.

## 핵심 기능
1. Routine: 반복 이동을 찾아 먼저 알림
2. Chain: 가는 편과 오는 편을 하나로 묶은 하루 이동 계획
3. Community: 같은 방향 승객을 한 차에 묶어 차량 수 절감

## 디자인 시안
- `design/UI 디밸롭.png`가 최신 기준 시안 (구성·카드·목록·음성 화면). `design/mockup.png.png`는 이전 시안
- 색은 브랜드 블루 #207fba 하나가 기본. 브랜드 그라데이션(민트 #8decd0 → 블루)은 **홈 화면에서만** 쓴다(큰 마이크, 보내기 버튼, 홈의 주요 버튼). 홈 밖의 버튼·탭·선택 칩·지도 핀은 플랫 단색, 스위치 바탕도 플랫 단색, 카드·목록 아이콘 칩은 연한 회색 플랫. 예외 색은 알림 빨강, 준비 중 주황, 예약됨 초록 세 가지뿐 (정의는 `app/globals.css`, `lib/colors.ts`)
- 글씨 위계: 제목·카드 제목만 굵게(세미볼드), 설명·본문은 보통. 크기: 제목 22px, 본문 17px, 보조 15px, 버튼 높이 56px
- 단, 다른 승객 이름·집 위치는 시안에 있어도 표시하지 않는다 (개인정보 원칙)

## 화면 (이용자 앱 하나 + 운영 요약 화면 하나)
- `/` 시연 조작판: 장면 버튼, 처음으로 버튼
- `/onboarding` 온보딩 4장
- `/rider` 홈 (하단 탭: 홈 / 내 이동 / 내 루틴 / 설정. 음성 예약은 홈에서 큰 마이크로 바로 한다)
- `/rider/voice` 음성 예약
- `/rider/routine-alert` 루틴 알림 (홈 상단 질문으로 통합, 이 주소는 홈으로 연결)
- `/rider/routines` 내 루틴
- `/rider/chain` 내 이동 (하루 이동 계획 + 이동 중 + 귀가 호출을 한 화면에 단계별로)
- `/rider/live` (내 이동으로 연결)
- `/rider/together` 함께 타기 + 운행 현황 (내 이동 안의 카드에서 들어감)
- `/admin` 묶기 전후 비교 한 화면
- 기사 앱은 만들지 않는다

## 기술 규칙 (하루 버전 단순화)
- Next.js (App Router) + TypeScript + Tailwind + lucide-react 아이콘
- 서버·DB·API 라우트를 만들지 않는다. 모든 상태는 브라우저 안에서 Zustand로 관리
- 데이터는 `/lib/data.ts` 안에 직접 작성한 가짜 데이터
- 음성: 브라우저 Web Speech API(ko-KR)와 speechSynthesis. 외부 API 없음
- 뜻 파악은 키워드 규칙만 사용 (Claude API 사용 안 함)
- 지도: react-leaflet + OpenStreetMap, SSR 비활성화
- 시간은 `/lib/store.ts`의 가상 시각만 사용 (`new Date()` 직접 사용 금지)
- 테스트 코드는 작성하지 않는다. 대신 각 단계 끝에 직접 눌러보고 확인한다

## 일러스트
- 시안의 3D 일러스트는 코드로 그리지 않는다
- `Illustration` 부품이 `/public/images/{name}.png`를 불러오고, 없으면 연한 파랑 둥근 사각형을 보여준다

## 어르신 화면 규칙
- 본문 최소 20px, 제목 28px 이상, 보조 설명 최소 18px
- 회색 설명 글씨는 시안보다 한 단계 진하게
- 버튼 최소 높이 64px
- 모든 안내는 글자 + 음성
- 화면이 길어지면 세로 스크롤 허용, 하단 탭 고정
- 이모지 사용 금지

## 개인정보 원칙
- 합승 안내에는 인원 수와 익명 사람 아이콘만. 다른 승객 이름·집 위치 표시 금지

## 작업 규칙
- 한 번에 한 블록만 작업한다
- 막히면 20분 이상 붙잡지 말고, 더 단순한 방법을 제안한다
- 블록이 끝나면 `npm run build`가 통과하는지 확인하고 git commit
- 사용자는 개발 입문자다. 설명은 쉬운 말로, 짧게

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
