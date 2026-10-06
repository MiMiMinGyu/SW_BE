# 🌱 Farmunity Backend

농업 커뮤니티 웹 서비스 **Farmunity**의 백엔드 API 서버입니다. 프론트엔드와 AI 예측 서버는 [Dandelion](https://github.com/2uGod/Dandelion) 저장소에 있습니다.

> 🏅 명지대학교 창의적 SW프로그램 경진대회 수상 (2025년 2학기)

## 주요 기능

| 모듈 | 경로 | 기능 |
| --- | --- | --- |
| auth | `/auth` | 회원가입, 로그인, 로그아웃 (JWT) |
| users | `/users` | 내 프로필 조회·수정, 프로필 이미지 업로드 |
| crops | `/crops` | 내 작물 등록·조회·수정·삭제 |
| schedules | `/schedules` | 작물일지와 일정 관리, 날짜·작물별 캘린더 조회, 색상 지정 |
| posts | `/posts` | 게시글 작성·조회·수정·삭제, 좋아요, 체험 예약 게시글 |
| comments | `/posts/:postId/comments` | 댓글 작성·조회·수정·삭제 |
| tags | `/tags` | 인기 태그 조회, 태그 검색 |
| reservations | `/reservations` | 체험 예약 신청, 내 예약·받은 예약 조회, 승인과 취소 |
| ncpms | `/ncpms` | 병·해충 정보 검색, 작물별 병해충 정보, 내 작물 기반 추천 |
| ai | `/ai` | 증상 설명을 받아 가능성 있는 병과 대처법 안내 (Gemini) |

전체 API 명세는 서버 실행 후 Swagger(`/api-docs`)에서 확인할 수 있습니다.

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| Framework | NestJS, TypeScript |
| Database | PostgreSQL, TypeORM |
| 인증 | JWT, Passport, bcrypt |
| 검증 · 문서 | class-validator, Swagger |
| 외부 API | Google Gemini, 국가농작물병해충관리시스템(NCPMS) |

## 설계 포인트

- 전역 ValidationPipe로 DTO에 정의되지 않은 값이 들어오면 요청을 거부합니다.
- 전역 예외 필터와 응답 변환 인터셉터로 응답 형식을 통일했습니다.
- 사용자 유형(취미 농부, 전문가)에 따라 체험 예약 게시글 작성과 예약 승인 권한을 구분합니다.
- Gemini에는 응답 스키마를 지정해 병명, 설명, 해결 방법을 항상 같은 JSON 구조로 받습니다.

## 프로젝트 구조

```
SW_BE/
├── src/
│   ├── auth/           # 인증
│   ├── users/          # 사용자
│   ├── crops/          # 작물
│   ├── schedules/      # 작물일지, 일정
│   ├── posts/          # 게시글
│   ├── comments/       # 댓글
│   ├── tags/           # 태그
│   ├── reservations/   # 체험 예약
│   ├── ncpms/          # 병해충 정보 연동
│   ├── ai/             # Gemini 증상 진단
│   ├── common/         # 예외 필터, 인터셉터
│   └── configs/        # TypeORM 설정
├── migrations/
├── SETUP_GUIDE.md      # 개발 환경 설정 안내
└── DEPLOYMENT_GUIDE.md # 배포 시 이미지 저장 방식 안내
```

## 실행 방법

Node.js(LTS)와 PostgreSQL이 필요합니다. 자세한 설치 과정은 [SETUP_GUIDE.md](SETUP_GUIDE.md)를 참고하세요.

**1. 환경 변수**

프로젝트 최상위에 `.env` 파일을 만듭니다.

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=비밀번호
DB_DATABASE=smartfarming_dev

# JWT
JWT_SECRET=임의의_긴_문자열
JWT_EXPIRES_IN=7d

# Gemini (필수, 없으면 서버가 시작되지 않습니다)
GEMINI_API_KEY=발급받은_키

# Server
NODE_ENV=development
PORT=3000
```

**2. 데이터베이스 생성**

PostgreSQL에 `smartfarming_dev` 데이터베이스를 만듭니다.

**3. 실행**

```bash
npm install
npm run start:dev
```

- 서버: `http://localhost:3000`
- Swagger: `http://localhost:3000/api-docs`
