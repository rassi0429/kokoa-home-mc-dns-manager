import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTargetHostnameColumn1710334977000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "minecraft_servers" 
            ADD COLUMN "targetHostname" character varying(255) NOT NULL DEFAULT '';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "minecraft_servers" 
            DROP COLUMN "targetHostname";
        `);
    }
}
