import { diskStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModuleOptions } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';

// 파일 업로드 상수
export const UPLOAD_CONSTANTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
  UPLOAD_DIR: './uploads',
} as const;

// 허용된 이미지 타입 타입 정의
type AllowedImageType = (typeof UPLOAD_CONSTANTS.ALLOWED_IMAGE_TYPES)[number];

/**
 * 파일명 생성 함수
 */
export const generateFileName = (
  originalName: string,
  prefix: string = '',
): string => {
  const timestamp = Date.now();
  const randomNum = Math.round(Math.random() * 1e9);
  const ext = path.extname(originalName);
  const baseName = path
    .basename(originalName, ext)
    .replace(/[^a-zA-Z0-9가-힣]/g, '_'); // 특수문자 제거

  return `${prefix}${baseName}-${timestamp}-${randomNum}${ext}`;
};

/**
 * 이미지 파일 필터
 */
export const imageFileFilter = (
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
): void => {
  const isValidImageType = UPLOAD_CONSTANTS.ALLOWED_IMAGE_TYPES.includes(
    file.mimetype as AllowedImageType,
  );

  if (!isValidImageType) {
    return callback(
      new BadRequestException(
        `지원하지 않는 파일 형식입니다. 지원 형식: ${UPLOAD_CONSTANTS.ALLOWED_IMAGE_TYPES.join(', ')}`,
      ),
      false,
    );
  }
  callback(null, true);
};

/**
 * 업로드 디렉토리 생성
 */
export const ensureUploadDir = (dir: string): void => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * Multer 설정 팩토리
 */
export const multerConfigFactory = (
  configService: ConfigService,
): MulterModuleOptions => {
  const uploadDir = configService.get<string>(
    'UPLOAD_DIR',
    UPLOAD_CONSTANTS.UPLOAD_DIR,
  );

  // 업로드 디렉토리 확인 및 생성
  ensureUploadDir(uploadDir);

  return {
    storage: diskStorage({
      destination: uploadDir,
      filename: (req, file, callback) => {
        const fileName = generateFileName(file.originalname, 'profile-');
        callback(null, fileName);
      },
    }),
    fileFilter: imageFileFilter,
    limits: {
      fileSize: UPLOAD_CONSTANTS.MAX_FILE_SIZE,
      files: 1,
    },
  };
};

/**
 * 프로필 이미지 업로드용 Multer 설정
 */
export const profileImageMulterConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      ensureUploadDir(UPLOAD_CONSTANTS.UPLOAD_DIR);
      cb(null, UPLOAD_CONSTANTS.UPLOAD_DIR);
    },
    filename: (req, file, callback) => {
      const fileName = generateFileName(file.originalname, 'profile-');
      callback(null, fileName);
    },
  }),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: UPLOAD_CONSTANTS.MAX_FILE_SIZE,
    files: 1,
  },
};
