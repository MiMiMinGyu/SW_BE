# SmartFarming API 시스템 명세서

## 📋 목차
1. [시스템 개요](#시스템-개요)
2. [기술 스택](#기술-스택)
3. [API 모듈별 상세 기능](#api-모듈별-상세-기능)
4. [데이터베이스 설계](#데이터베이스-설계)
5. [보안 및 인증](#보안-및-인증)
6. [파일 업로드 시스템](#파일-업로드-시스템)
7. [외부 API 연동](#외부-api-연동)
8. [배포 및 운영](#배포-및-운영)

---

## 🌱 시스템 개요

### 프로젝트 정보
- **프로젝트명**: SmartFarming API
- **버전**: 1.0.0
- **개발 프레임워크**: NestJS (Node.js)
- **API 문서**: Swagger UI 자동 생성
- **데이터베이스**: PostgreSQL + TypeORM

### 시스템 목적
스마트 농업을 위한 종합 플랫폼으로, 농업인들이 작물 관리, 병해충 진단, 커뮤니티 활동, 전문가 예약 등을 통해 효율적인 농업 활동을 할 수 있도록 지원하는 백엔드 API 시스템입니다.

### 주요 특징
- 🤖 **AI 병해충 진단**: Google Gemini API를 활용한 증상 기반 진단
- 📊 **공공데이터 연동**: 국립농업과학원 병해충 관리시스템(NCPMS) API
- 📅 **작물일지 관리**: 이미지 업로드와 캘린더 기반 일정 관리
- 👥 **커뮤니티 기능**: 게시판, 댓글, 좋아요 시스템
- 📝 **예약 시스템**: 전문농업인과 일반 농업인 매칭
- 🔐 **역할 기반 권한**: HOBBY, EXPERT, ADMIN 사용자 구분

---

## 🛠 기술 스택

### Backend Framework
- **NestJS** (v11.0.1): TypeScript 기반 백엔드 프레임워크
- **Express.js**: HTTP 서버 엔진

### 데이터베이스
- **PostgreSQL**: 주 데이터베이스
- **TypeORM** (v0.3.25): ORM 및 마이그레이션 관리

### 인증 및 보안
- **JWT (JSON Web Token)**: 사용자 인증
- **Passport.js**: 인증 미들웨어
- **bcrypt**: 비밀번호 암호화

### API 문서화
- **Swagger UI**: 자동 API 문서 생성
- **@nestjs/swagger**: NestJS Swagger 통합

### 파일 처리
- **Multer**: 파일 업로드 처리
- **정적 파일 서빙**: Express static middleware

### 외부 API
- **Google Gemini API**: AI 병해충 진단
- **NCPMS API**: 농촌진흥청 병해충 정보 시스템
- **node-fetch**: HTTP 클라이언트

### 개발 도구
- **TypeScript**: 정적 타입 시스템
- **ESLint + Prettier**: 코드 품질 관리
- **Jest**: 단위 테스트 프레임워크

---

## 📚 API 모듈별 상세 기능

### 1. 인증 시스템 (Auth Module)

#### 🔐 주요 기능
- **회원가입**: 이메일 중복 확인, 비밀번호 암호화
- **로그인**: JWT 토큰 발급
- **로그아웃**: 클라이언트 측 토큰 삭제 안내

#### API 엔드포인트
```
POST /auth/signup    - 회원가입
POST /auth/login     - 로그인
POST /auth/logout    - 로그아웃
```

#### 핵심 기능 설명
- **비밀번호 보안**: bcrypt를 사용한 해시 암호화
- **JWT 토큰**: 7일 만료, Bearer 토큰 방식
- **사용자 타입**: HOBBY(취미농업), EXPERT(전문농업), ADMIN(관리자)

### 2. 사용자 관리 (Users Module)

#### 👤 주요 기능
- **프로필 조회**: 현재 로그인 사용자 정보
- **프로필 수정**: 닉네임, 이름, 관심작물 수정
- **프로필 이미지**: 이미지 업로드 및 관리

#### API 엔드포인트
```
GET    /users/me         - 내 프로필 조회
PATCH  /users/me         - 프로필 수정
POST   /users/me/image   - 프로필 이미지 업로드
```

#### 데이터 구조
```typescript
interface User {
  id: number;
  email: string;
  nickname: string;
  name?: string;
  interestCrops?: string;
  profileImage?: string;
  userType: UserType;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. 게시판 시스템 (Posts Module)

#### 📝 주요 기능
- **다양한 게시글 유형**: 일반글, 질문, 일지, 노하우, 예약글, 자유게시판, 건의게시판
- **고급 검색**: 제목/내용 검색, 카테고리 필터, 태그 검색
- **좋아요 시스템**: 게시글 좋아요/취소
- **권한 관리**: 건의게시판(관리자 전용), 예약글(전문농업인 전용)

#### API 엔드포인트
```
POST   /posts                 - 게시글 작성
POST   /posts/reservation     - 예약 게시글 작성 (전문농업인)
GET    /posts                 - 게시글 목록 조회
GET    /posts/:id             - 게시글 상세 조회
PATCH  /posts/:id             - 게시글 수정
DELETE /posts/:id             - 게시글 삭제
GET    /posts/:id/like        - 좋아요 상태 조회
POST   /posts/:id/like        - 좋아요 토글
```

#### 게시글 카테고리
- **GENERAL**: 전체
- **QUESTION**: 질문
- **DIARY**: 일지
- **KNOWHOW**: 노하우
- **RESERVATION**: 예약 (전문농업인 전용)
- **FREE**: 자유게시판
- **SUGGESTION**: 건의게시판 (관리자 전용)

#### 검색 및 필터링
- **텍스트 검색**: 제목, 내용에서 키워드 검색
- **카테고리 필터**: 게시글 유형별 분류
- **태그 검색**: 관련 태그로 필터링
- **정렬**: 최신순, 인기순, 조회순
- **페이지네이션**: 페이지별 조회 (기본 20개)

### 4. 댓글 시스템 (Comments Module)

#### 💬 주요 기능
- **댓글 작성**: 게시글에 댓글 추가
- **댓글 수정/삭제**: 작성자만 가능
- **댓글 조회**: 게시글별 댓글 목록

#### API 엔드포인트
```
POST   /posts/:postId/comments    - 댓글 작성
GET    /posts/:postId/comments    - 게시글 댓글 목록
GET    /comments/:id              - 특정 댓글 조회
PATCH  /comments/:id              - 댓글 수정
DELETE /comments/:id              - 댓글 삭제
```

### 5. 예약 시스템 (Reservations Module)

#### 📅 주요 기능
- **예약 신청**: 전문농업인 게시글에 예약 신청
- **예약 관리**: 상태 변경, 승인, 거절, 취소
- **예약 조회**: 내 예약, 받은 예약 목록

#### API 엔드포인트
```
POST   /reservations/posts/:postId     - 예약 신청
GET    /reservations/my               - 내 예약 목록
GET    /reservations/received         - 받은 예약 목록
PATCH  /reservations/:id/status       - 예약 상태 변경
PATCH  /reservations/:id/cancel       - 예약 취소
GET    /reservations/:id              - 예약 상세 조회
```

#### 예약 상태
- **PENDING**: 대기중
- **CONFIRMED**: 승인됨
- **CANCELLED**: 취소됨
- **COMPLETED**: 완료됨

### 6. 작물 관리 (Crops Module)

#### 🌱 주요 기능
- **작물 등록**: 사용자별 작물 정보 관리
- **작물 수정/삭제**: 등록된 작물 정보 변경
- **작물 조회**: 내 작물 목록 및 상세 정보

#### API 엔드포인트
```
POST   /crops        - 작물 등록
GET    /crops        - 내 작물 목록
GET    /crops/:id    - 특정 작물 조회
PATCH  /crops/:id    - 작물 정보 수정
DELETE /crops/:id    - 작물 삭제
```

### 7. 작물일지 시스템 (Schedules Module)

#### 📖 주요 기능
- **일지 작성**: 이미지 첨부 가능한 작물일지
- **캘린더 뷰**: 월별, 일별 일지 조회
- **색상 관리**: 캘린더 표시용 색상 설정
- **검색 기능**: 날짜 범위, 작물별 필터링

#### API 엔드포인트
```
POST   /schedules                    - 작물일지 생성
GET    /schedules                    - 일지 목록 조회
GET    /schedules/date-range         - 날짜 범위 조회
GET    /schedules/date/:date         - 특정 날짜 조회
GET    /schedules/:id                - 일지 상세 조회
PATCH  /schedules/:id                - 일지 수정
DELETE /schedules/:id                - 일지 삭제
PATCH  /schedules/:id/color          - 색상 변경
```

#### 캘린더 기능
- **월별 조회**: React-calendar 연동 최적화
- **작물별 필터**: 특정 작물의 일지만 조회
- **색상 코딩**: HEX 색상으로 일지 구분

### 8. AI 진단 시스템 (AI Module)

#### 🤖 주요 기능
- **증상 기반 진단**: 사용자 입력 증상을 AI가 분석
- **병해충 추천**: 가능성 있는 질병 3가지 제시
- **해결방안 제공**: 각 질병별 치료법 안내

#### API 엔드포인트
```
POST /ai/symptom-check    - 증상 진단
```

#### AI 진단 과정
1. **사용자 입력**: 작물명과 증상 설명 (최소 5자)
2. **AI 분석**: Google Gemini API로 증상 분석
3. **결과 반환**: JSON 형태로 질병명, 설명, 해결방법 제공

#### 응답 형식
```json
[
  {
    "diseaseName": "토마토 역병",
    "description": "잎이 노랗게 변하고 시들어가는 증상",
    "solution": "구리 계열 살균제 살포 및 배수 개선"
  }
]
```

### 9. 병해충 정보 시스템 (NCPMS Module)

#### 🔬 주요 기능
- **공공데이터 연동**: 농촌진흥청 병해충 관리시스템
- **병 정보 검색**: 작물별, 병명별 검색
- **해충 정보 검색**: 작물별, 해충명별 검색
- **개인화 추천**: 등록 작물 기반 맞춤 정보

#### API 엔드포인트
```
GET /ncpms/diseases/search              - 병 정보 검색
GET /ncpms/pests/search                 - 해충 정보 검색
GET /ncpms/crops/:cropName/health-info  - 작물별 종합 정보
GET /ncpms/my-crops/health-recommendations - 내 작물 기반 추천
```

#### 검색 파라미터
- **작물명**: 토마토, 배추, 고추 등
- **병해충명**: 역병, 진딧물, 배추좀나방 등
- **조회 개수**: 기본 10개, 최대 50개
- **페이지네이션**: 시작 위치 지정

---

## 💾 데이터베이스 설계

### 주요 엔티티

#### Users (사용자)
```sql
- id: PRIMARY KEY
- email: UNIQUE, NOT NULL
- password: NOT NULL (해시화)
- nickname: NOT NULL
- name: VARCHAR(100)
- interestCrops: TEXT
- profileImage: VARCHAR(255)
- userType: ENUM (HOBBY, EXPERT, ADMIN)
- createdAt, updatedAt: TIMESTAMP
```

#### Posts (게시글)
```sql
- id: PRIMARY KEY
- title: NOT NULL
- content: TEXT
- category: ENUM (PostCategory)
- viewCount: INTEGER
- likeCount: INTEGER
- userId: FOREIGN KEY → Users
- maxParticipants: INTEGER (예약글)
- currentParticipants: INTEGER (예약글)
- reservationStartDate: DATE (예약글)
- reservationEndDate: DATE (예약글)
- createdAt, updatedAt: TIMESTAMP
```

#### Comments (댓글)
```sql
- id: PRIMARY KEY
- content: TEXT NOT NULL
- postId: FOREIGN KEY → Posts
- userId: FOREIGN KEY → Users
- createdAt, updatedAt: TIMESTAMP
```

#### Crops (작물)
```sql
- id: PRIMARY KEY
- name: NOT NULL
- variety: VARCHAR(100)
- plantingDate: DATE
- expectedHarvestDate: DATE
- description: TEXT
- userId: FOREIGN KEY → Users
- createdAt, updatedAt: TIMESTAMP
```

#### Schedules (작물일지)
```sql
- id: PRIMARY KEY
- title: NOT NULL
- content: TEXT
- date: DATE NOT NULL
- color: VARCHAR(7) (HEX 색상)
- imageUrl: VARCHAR(255)
- cropId: FOREIGN KEY → Crops
- userId: FOREIGN KEY → Users
- createdAt, updatedAt: TIMESTAMP
```

#### Reservations (예약)
```sql
- id: PRIMARY KEY
- participantCount: INTEGER NOT NULL
- status: ENUM (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- cancelReason: TEXT
- postId: FOREIGN KEY → Posts
- userId: FOREIGN KEY → Users
- createdAt, updatedAt: TIMESTAMP
```

### 관계 설정
- **Users ↔ Posts**: 1:N (사용자는 여러 게시글 작성 가능)
- **Users ↔ Comments**: 1:N (사용자는 여러 댓글 작성 가능)
- **Posts ↔ Comments**: 1:N (게시글은 여러 댓글 보유 가능)
- **Users ↔ Crops**: 1:N (사용자는 여러 작물 등록 가능)
- **Crops ↔ Schedules**: 1:N (작물은 여러 일지 보유 가능)
- **Posts ↔ Reservations**: 1:N (예약글은 여러 예약 보유 가능)
- **Users ↔ PostLikes**: N:M (사용자-게시글 좋아요 관계)

---

## 🔒 보안 및 인증

### JWT 인증 시스템
- **토큰 방식**: Bearer Token
- **만료 시간**: 7일
- **암호화**: 환경변수 기반 시크릿 키

### 비밀번호 보안
- **해시 알고리즘**: bcrypt
- **솔트 라운드**: 10라운드

### 권한 관리
- **가드 시스템**: NestJS Guards 활용
- **역할 기반 접근**: AdminGuard로 관리자 권한 확인
- **소유권 검증**: 사용자별 리소스 접근 제어

### 입력 검증
- **DTO 유효성 검사**: class-validator
- **화이트리스트**: 정의된 필드만 허용
- **타입 변환**: 자동 타입 변환 및 검증

---

## 📁 파일 업로드 시스템

### 지원 파일 형식
- **이미지**: JPEG, PNG, WebP
- **최대 크기**: 5MB

### 저장 구조
```
uploads/
├── profiles/    - 프로필 이미지
└── logs/        - 작물일지 이미지
```

### 보안 기능
- **파일 유형 검증**: MIME 타입 확인
- **파일 크기 제한**: 5MB 제한
- **파일명 안전화**: UUID 기반 고유 파일명

### 업로드 처리
- **Multer 미들웨어**: 파일 업로드 처리
- **메모리 효율성**: 스트림 기반 처리
- **에러 핸들링**: 업로드 실패 시 적절한 에러 메시지

---

## 🌐 외부 API 연동

### Google Gemini API
- **용도**: AI 병해충 진단
- **모델**: gemini-1.5-flash-latest
- **입력**: 사용자 증상 설명
- **출력**: JSON 형태 진단 결과

### NCPMS API (농촌진흥청)
- **용도**: 공식 병해충 정보 조회
- **제공 정보**: 병 정보, 해충 정보, 방제법
- **검색 기능**: 작물명, 병해충명 기반 검색

### API 연동 특징
- **에러 핸들링**: 외부 API 오류 시 적절한 대응
- **응답 가공**: 사용자 친화적 형태로 데이터 변환
- **캐싱 최적화**: 자주 조회되는 데이터 최적화

---

## 🚀 배포 및 운영

### 환경 설정
```env
# 데이터베이스
DATABASE_URL=postgresql://user:password@localhost:5432/smartfarming

# JWT
JWT_SECRET=your_jwt_secret

# 외부 API
GEMINI_API_KEY=your_gemini_api_key
NCPMS_API_KEY=your_ncpms_api_key

# 서버 설정
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

### 빌드 및 실행
```bash
# 개발 환경
npm run start:dev

# 프로덕션 빌드
npm run build
npm run start:prod

# 테스트
npm test
npm run test:e2e
```

### 모니터링
- **글로벌 예외 필터**: 모든 에러 로깅
- **응답 변환 인터셉터**: 일관된 응답 형식
- **로깅 시스템**: NestJS Logger

### 성능 최적화
- **데이터베이스 인덱싱**: 자주 조회되는 컬럼
- **페이지네이션**: 대용량 데이터 처리
- **이미지 최적화**: 파일 크기 제한

---

## 📊 API 사용 통계

### 주요 엔드포인트별 기능
1. **인증 관련**: 3개 엔드포인트
2. **사용자 관리**: 3개 엔드포인트
3. **게시판 시스템**: 7개 엔드포인트
4. **댓글 시스템**: 5개 엔드포인트
5. **예약 시스템**: 6개 엔드포인트
6. **작물 관리**: 5개 엔드포인트
7. **작물일지**: 12개 엔드포인트
8. **AI 진단**: 1개 엔드포인트
9. **병해충 정보**: 4개 엔드포인트

**총 46개 API 엔드포인트**

### 사용자 역할별 접근 권한
- **일반 사용자**: 기본 CRUD 작업
- **전문농업인**: 예약글 작성, 예약 관리
- **관리자**: 건의게시판 접근, 전체 데이터 관리

---

## 🔮 확장 가능성

### 향후 개발 계획
1. **실시간 채팅**: WebSocket 기반 실시간 소통
2. **푸시 알림**: 예약 승인, 댓글 등 알림 시스템
3. **데이터 분석**: 작물 성장 패턴 분석
4. **IoT 연동**: 센서 데이터 수집 및 분석
5. **모바일 앱**: React Native 기반 모바일 앱

### 기술적 확장
- **마이크로서비스**: 서비스별 분리
- **캐싱 시스템**: Redis 도입
- **CDN**: 이미지 및 정적 파일 최적화
- **로드 밸런싱**: 고가용성 확보

---

이 문서는 SmartFarming API 시스템의 전체적인 구조와 기능을 PPT 제작을 위해 정리한 명세서입니다. 각 모듈별 상세 기능과 기술적 구현 사항이 포함되어 있어 프레젠테이션 자료 작성에 활용하실 수 있습니다.