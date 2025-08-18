import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColorFieldsAndScheduleType1755532587456 implements MigrationInterface {
  name = 'AddColorFieldsAndScheduleType1755532587456';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crop 테이블에 color 필드 추가
    await queryRunner.query(
      `ALTER TABLE "crops" ADD COLUMN "color" varchar(7) NOT NULL DEFAULT '#4CAF50'`,
    );

    // Schedule 테이블 수정
    await queryRunner.query(
      `ALTER TABLE "schedules" ADD COLUMN "color" varchar(7)`,
    );

    // Schedule type enum 생성 및 컬럼 추가
    await queryRunner.query(
      `CREATE TYPE "schedules_type_enum" AS ENUM('crop_diary', 'personal')`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedules" ADD COLUMN "type" "schedules_type_enum" NOT NULL DEFAULT 'crop_diary'`,
    );

    // crop 컬럼을 nullable로 변경 (개인 일정 지원)
    await queryRunner.query(
      `ALTER TABLE "schedules" ALTER COLUMN "crop" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "schedules" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "schedules_type_enum"`);
    await queryRunner.query(`ALTER TABLE "schedules" DROP COLUMN "color"`);
    await queryRunner.query(`ALTER TABLE "crops" DROP COLUMN "color"`);
    await queryRunner.query(`ALTER TABLE "schedules" ALTER COLUMN "crop" SET NOT NULL`);
  }
}