# 🚀 배포 환경에서의 이미지 저장 방식

현재는 개발환경에서 로컬 파일시스템을 사용하지만, 실제 운영환경에서는 다음과 같은 방식을 권장합니다:

## 📁 권장 저장 방식들

### 1. **클라우드 스토리지 (가장 권장)**
```typescript
// AWS S3 예시
import { S3 } from 'aws-sdk';

const s3 = new S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// 업로드
const uploadResult = await s3.upload({
  Bucket: process.env.S3_BUCKET_NAME,
  Key: `profile-images/${fileName}`,
  Body: fileBuffer,
  ContentType: file.mimetype,
  ACL: 'public-read', // 공개 접근 허용
}).promise();

// DB에 저장할 URL: uploadResult.Location
```

### 2. **전용 스토리지 서버**
- 별도의 파일 서버 구축
- `/var/www/uploads` 같은 시스템 디렉터리 사용
- Nginx로 정적 파일 서빙

### 3. **CDN 사용**
- CloudFront (AWS)
- Cloudflare
- 이미지 최적화 + 글로벌 배포

## 🔄 마이그레이션 예시

```typescript
// 환경별 설정
export const getStorageConfig = () => {
  const env = process.env.NODE_ENV;
  
  if (env === 'production') {
    return {
      type: 'S3',
      bucket: process.env.S3_BUCKET,
      region: process.env.AWS_REGION,
    };
  }
  
  // 개발환경에서는 로컬 저장
  return {
    type: 'LOCAL',
    path: './uploads',
  };
};
```

## 💰 비용 비교
- **로컬 저장**: 무료, 서버 용량 제한
- **AWS S3**: 월 ~$0.023/GB (저장) + 전송비용
- **Google Cloud Storage**: 월 ~$0.020/GB
- **Azure Blob**: 월 ~$0.0184/GB

## 🚧 현재 개발환경 사용법
현재는 학습/개발 목적이므로 로컬 저장을 유지하되:
1. `.gitignore`에 `uploads/` 추가 (이미 추가됨)
2. 주기적으로 테스트 이미지 정리
3. 운영배포 시 클라우드 스토리지로 변경