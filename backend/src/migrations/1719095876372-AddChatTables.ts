import { MigrationInterface, QueryRunner } from "typeorm"

export class AddChatTables1719095876372 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create chat_rooms table for direct messaging
        await queryRunner.query(`
            CREATE TABLE "chat_rooms" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar(255) NOT NULL,
                "user1Id" uuid NOT NULL,
                "user2Id" uuid NOT NULL,
                "description" text,
                "isDirectMessage" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "FK_chat_rooms_user1" FOREIGN KEY ("user1Id") REFERENCES "users" ("id") ON DELETE CASCADE,
                CONSTRAINT "FK_chat_rooms_user2" FOREIGN KEY ("user2Id") REFERENCES "users" ("id") ON DELETE CASCADE
            )
        `);
        
        // Create chat_messages table
        await queryRunner.query(`
            CREATE TABLE "chat_messages" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "text" text NOT NULL,
                "roomId" uuid NOT NULL,
                "userId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "FK_chat_messages_rooms" FOREIGN KEY ("roomId") REFERENCES "chat_rooms" ("id") ON DELETE CASCADE,
                CONSTRAINT "FK_chat_messages_users" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE
            )
        `);
        
        // Add indexes for better performance
        await queryRunner.query(`CREATE INDEX "IDX_chat_messages_roomId" ON "chat_messages" ("roomId")`);
        await queryRunner.query(`CREATE INDEX "IDX_chat_messages_userId" ON "chat_messages" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_chat_messages_createdAt" ON "chat_messages" ("createdAt")`);
        await queryRunner.query(`CREATE INDEX "IDX_chat_rooms_user1Id" ON "chat_rooms" ("user1Id")`);
        await queryRunner.query(`CREATE INDEX "IDX_chat_rooms_user2Id" ON "chat_rooms" ("user2Id")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_chat_rooms_users" ON "chat_rooms" ("user1Id", "user2Id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_chat_rooms_users"`);
        await queryRunner.query(`DROP INDEX "IDX_chat_rooms_user2Id"`);
        await queryRunner.query(`DROP INDEX "IDX_chat_rooms_user1Id"`);
        await queryRunner.query(`DROP INDEX "IDX_chat_messages_createdAt"`);
        await queryRunner.query(`DROP INDEX "IDX_chat_messages_userId"`);
        await queryRunner.query(`DROP INDEX "IDX_chat_messages_roomId"`);
        
        // Drop tables
        await queryRunner.query(`DROP TABLE "chat_messages"`);
        await queryRunner.query(`DROP TABLE "chat_rooms"`);
    }
} 