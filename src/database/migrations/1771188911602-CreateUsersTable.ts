import { Logger } from '@nestjs/common';
import bcrypt, { hashSync } from 'bcrypt';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1771188911602 implements MigrationInterface {
  private readonly logger = new Logger(CreateUsersTable1771188911602.name);
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
            isPrimary: true,
          },
          {
            name: 'email',
            type: 'varchar(100)',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'phone',
            type: 'varchar(15)',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'gender',
            type: 'enum',
            enum: ['Male', 'Female', 'PreferNotToSay'],
            isNullable: true,
          },
          {
            name: 'password',
            type: 'varchar(255)',
            isNullable: true,
          },
            {
              name: "country",
              type: "varchar(100)",
              isNullable: true,
            },
          {
            name: 'role',
            type: 'enum',
            enum: ['Admin', 'Guide', 'Client'],
            default: "'Client'",
            isNullable: false,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'isVerified',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'deviceToken',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'googleId',
            type: 'varchar(255)',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'avatar',
            type: 'varchar(255)',
            isNullable: true,
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
      }),
    );

    //Seed users with multiple roles
    const users = [
      {
        id: 'd7d0411e-4d70-47ad-b79a-74f0c9fbfe27',
        email: 'admin@example.com',
        phone: '+1234567890',
        gender: 'Male',
        password: 'Admin@123',
        role: 'Admin',
      },
      {
        id: 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
        email: 'john.guide@example.com',
        phone: '+1987654321',
        gender: 'Male',
        password: 'Guide@123',
        role: 'Guide',
      },
      {
        id: 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
        email: 'sarah.guide@example.com',
        phone: '+1122334455',
        gender: 'Female',
        password: 'Guide@456',
        role: 'Guide',
      },
      {
        id: 'c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
        email: 'client1@example.com',
        phone: '+1555666777',
        gender: 'Male',
        password: 'Client@123',
        role: 'Client',
      },
      {
        id: 'd4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a',
        email: 'client2@example.com',
        phone: '+1444333222',
        gender: 'Female',
        password: 'Client@456',
        role: 'Client',
      },
    ];

    for (const user of users) {
      const hashedPassword = hashSync(user.password, 10);
      await queryRunner.query(`
            INSERT INTO "users" (
          "id", "email", "phone", "gender", "password", "role", 
          "createdAt", "updatedAt"
        ) VALUES (
          '${user.id}', 
          '${user.email}', 
          ${user.phone ? `'${user.phone}'` : null}, 
          '${user.gender}', 
          '${hashedPassword}', 
          '${user.role}',
          NOW(), 
          NOW()
        )
            `);
      this.logger.log('users table created and seeded successfully');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Droping users table');
    await queryRunner.dropTable('users');
  }
}
