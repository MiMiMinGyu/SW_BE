import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTypeAndColorToSchedules1692345600000 implements MigrationInterface {
  name = 'AddTypeAndColorToSchedules1692345600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Schedule 테이블에 type enum과 color 필드 추가
    await queryRunner.query(`
      CREATE TYPE "public"."schedules_type_enum" AS ENUM('crop_diary', 'personal')
    `);
    
    await queryRunner.query(`
      ALTER TABLE "schedules" 
      ADD "type" "public"."schedules_type_enum" NOT NULL DEFAULT 'crop_diary'
    `);
    
    await queryRunner.query(`
      ALTER TABLE "schedules" 
      ADD "color" varchar(7)
    `);

    // crop 필드를 nullable로 변경
    await queryRunner.query(`
      ALTER TABLE "schedules" 
      ALTER COLUMN "cropId" DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 변경사항 되돌리기
    await queryRunner.query(`
      ALTER TABLE "schedules" 
      ALTER COLUMN "cropId" SET NOT NULL
    `);
    
    await queryRunner.query(`
      ALTER TABLE "schedules" 
      DROP COLUMN "color"
    `);
    
    await queryRunner.query(`
      ALTER TABLE "schedules" 
      DROP COLUMN "type"
    `);
    
    await queryRunner.query(`
      DROP TYPE "public"."schedules_type_enum"
    `);
  }
}