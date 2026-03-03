import { Logger } from '@nestjs/common';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateGuideProfilesTable1771258515689 implements MigrationInterface {
  private readonly logger = new Logger(
    CreateGuideProfilesTable1771258515689.name,
  );
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'guide_profiles',
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
          {
            name: 'yearsOfExperience',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'hourlyRate',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'ratingCount',
            type: 'int',
            default: 0,
            isNullable: false,
          },
          {
            name: 'averageRating',
            type: 'decimal',
            default: 0,
            isNullable: false,
          },
          {
            name: 'bookingCount',
            type: 'int',
            default: 0,
            isNullable: false,
          },
          {
            name: 'image',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['Pending', 'Approved', 'Rejected'],
            default: "'Pending'",
            isNullable: false,
          },
          {
            name: 'isSubscribed',
            type: 'boolean',
            default: false,
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
      INSERT INTO "guide_profiles" (
        "id", 
        "userId", 
        "yearsOfExperience", 
        "hourlyRate", 
        "ratingCount", 
        "averageRating", 
        "bookingCount", 
        "image", 
        "status", 
        "isSubscribed", 
        "createdAt", 
        "updatedAt"
      )
      VALUES 
      -- Approved guides
      (
        'd1a2a3a4-5a6a-7a8a-9b0b-1b2b3b4c5b6d',
        'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', -- Guide 1 UUID (John)
        5,
        50,
        120,
        4.8,
        350,
        'https://example.com/images/guide1.jpg',
        'Approved',
        true,
        NOW(),
        NOW()
      ),
      (
        'd1a2a3a5-5a6c-7a8a-9b0b-1b2b3b4c5b6b',
        'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', -- Guide 2 UUID (Sarah)
        8,
        75,
        200,
        4.9,
        520,
        'https://example.com/images/guide2.jpg',
        'Approved',
        true,
        NOW(),
        NOW()
      )
    `);
    this.logger.log('Guide profiles table created and seeded successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Dropping guide_profiles table');
    await queryRunner.dropTable('guide_profiles');
  }
}
