import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserTypeEnum1755321022215 implements MigrationInterface {
  name = 'UpdateUserTypeEnum1755321022215';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add temporary text column
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "userType_temp" TEXT`,
    );

    // Step 2: Copy data and convert PROFESSIONAL to EXPERT
    await queryRunner.query(
      `UPDATE "users" SET "userType_temp" = CASE WHEN "userType" = 'PROFESSIONAL' THEN 'EXPERT' ELSE "userType"::text END`,
    );

    // Step 3: Drop the original column
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "userType"`);

    // Step 4: Create new enum type with EXPERT instead of PROFESSIONAL
    await queryRunner.query(
      `CREATE TYPE "public"."users_usertype_enum_new" AS ENUM('HOBBY', 'EXPERT', 'ADMIN')`,
    );

    // Step 5: Add new column with new enum type
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "userType" "public"."users_usertype_enum_new" DEFAULT 'HOBBY'`,
    );

    // Step 6: Copy data from temp column to new enum column
    await queryRunner.query(
      `UPDATE "users" SET "userType" = "userType_temp"::"public"."users_usertype_enum_new"`,
    );

    // Step 7: Drop temporary column
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "userType_temp"`);

    // Step 8: Drop old enum type and rename new one
    await queryRunner.query(`DROP TYPE "public"."users_usertype_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."users_usertype_enum_new" RENAME TO "users_usertype_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add temporary text column
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "userType_temp" TEXT`,
    );

    // Step 2: Copy data and convert EXPERT to PROFESSIONAL
    await queryRunner.query(
      `UPDATE "users" SET "userType_temp" = CASE WHEN "userType" = 'EXPERT' THEN 'PROFESSIONAL' ELSE "userType"::text END`,
    );

    // Step 3: Drop the current column
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "userType"`);

    // Step 4: Create old enum type with PROFESSIONAL
    await queryRunner.query(
      `CREATE TYPE "public"."users_usertype_enum_old" AS ENUM('HOBBY', 'PROFESSIONAL', 'ADMIN')`,
    );

    // Step 5: Add column with old enum type
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "userType" "public"."users_usertype_enum_old" DEFAULT 'HOBBY'`,
    );

    // Step 6: Copy data from temp column to enum column
    await queryRunner.query(
      `UPDATE "users" SET "userType" = "userType_temp"::"public"."users_usertype_enum_old"`,
    );

    // Step 7: Drop temporary column
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "userType_temp"`);

    // Step 8: Drop new enum type and rename old one
    await queryRunner.query(`DROP TYPE "public"."users_usertype_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."users_usertype_enum_old" RENAME TO "users_usertype_enum"`,
    );
  }
}
