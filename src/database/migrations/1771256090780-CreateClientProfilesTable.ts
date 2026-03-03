import { Logger } from '@nestjs/common';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateClientProfilesTable1771256090780 implements MigrationInterface {
  private readonly logger = new Logger(
    CreateClientProfilesTable1771256090780.name,
  );
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'client_profiles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
            isPrimary: true,
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
            isUnique: true, // One-to-one relationship with users
          },
          {
            name: 'name',
            type: 'varchar(100)',
            isNullable: true,
          },
          //   {
          //     name: "country",
          //     type: "varchar(100)",
          //     isNullable: true,
          //   },
          {
            name: 'image',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'bookingCount',
            type: 'int',
            default: 0,
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
      }),
    );
    await queryRunner.query(`
      INSERT INTO "client_profiles" (
        "id", 
        "userId", 
        "image", 
        "bookingCount", 
        "createdAt", 
        "updatedAt"
      )
      VALUES 
      (
        'c5d6e7f8-9a0b-1c2d-3e4f-5a6b7c8d9e0f',
        'c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', -- Client 1 UUID
        'https://example.com/images/client1.jpg',
        5,
        NOW(),
        NOW()
      ),
      (
        'd6e7f8a9-0b1c-2d3e-4f5a-6b7c8d9e0f1a',
        'd4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a', -- Client 2 UUID
        'https://example.com/images/client2.jpg',
        12,
        NOW(),
        NOW()
      )
    `);

    this.logger.log('Client profiles table created and seeded successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Dropping client_profiles table');
    await queryRunner.dropTable('client_profiles');
  }
}
