# 🌱 SmartFarming API 개발환경 설정 가이드

## 필요한 프로그램 설치

### 1. Node.js 설치

- [Node.js 공식사이트](https://nodejs.org/)에서 LTS 버전 다운로드
- 설치 후 터미널에서 확인: `node --version`

### 2. PostgreSQL 설치

- [PostgreSQL 공식사이트](https://www.postgresql.org/download/windows/)에서 다운로드
- 설치 시 비밀번호는 **`password`**로 설정 (또는 기억하기 쉬운 것)
- 포트: **5432** (기본값)

### 3. Git 설치

- [Git 공식사이트](https://git-scm.com/)에서 다운로드

## 프로젝트 설정

### 1. 코드 다운로드

```bash
git clone https://github.com/MiMiMinGyu/SW_BE.git
cd SW_BE
git checkout feat/mypage
```

### 2. 환경변수 설정

루트 폴더에 `.env` 파일 생성:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=smartfarming_dev

# JWT
JWT_SECRET=my-super-secret-key-for-development
JWT_EXPIRES_IN=7d

# Server
NODE_ENV=development
```

### 3. 데이터베이스 생성

pgAdmin 실행 → 데이터베이스 생성:

- 이름: `smartfarming_dev`

### 4. 의존성 설치 및 실행

```bash
npm install
npm run start:dev
```

### 5. 확인

- 서버: http://localhost:3000
- Swagger: http://localhost:3000/api-docs

## 테스트 데이터 생성

Swagger에서 순서대로 실행:

1. **회원가입** - `POST /auth/signup`

```json
{
  "email": "test@example.com",
  "password": "password123",
  "nickname": "테스트유저",
  "name": "홍길동",
  "userType": "hobby"
}
```

2. **로그인** - `POST /auth/login`

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

3. **Authorize 버튼 클릭** → Bearer 토큰 입력

4. **작물 생성** - `POST /crops`

```json
{
  "name": "토마토",
  "variety": "방울토마토",
  "plantingDate": "2025-08-01",
  "status": "growing"
}
```

5. **작물일지 생성** - `POST /crop-diaries`

```json
{
  "title": "첫 일지",
  "content": "토마토 씨앗을 심었습니다",
  "date": "2025-08-13",
  "cropId": 1
}
```

## 문제 해결

### 서버가 시작되지 않는 경우

1. PostgreSQL 서비스 실행 확인
2. 데이터베이스 생성 확인
3. `.env` 파일 내용 확인

### DB 연결 오류

```bash
# PostgreSQL 서비스 시작 (Windows)
net start postgresql-x64-14
```

### 포트 충돌

- 3000번 포트가 사용중인 경우 다른 프로그램 종료

## 🎯 개발 완료 후

프론트엔드와 연동 시 API Base URL: `http://localhost:3000`
