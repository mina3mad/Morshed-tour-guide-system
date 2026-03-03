// import { Logger } from '@nestjs/common';
// import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

// export class CreateClientProfileTranslationsTable1771257527734 implements MigrationInterface {
//   private readonly logger = new Logger(
//     CreateClientProfileTranslationsTable1771257527734.name,
//   );
//   public async up(queryRunner: QueryRunner): Promise<void> {
//     await queryRunner.createTable(
//       new Table({
//         name: 'client_profile_translations',
//         columns: [
//           {
//             name: 'id',
//             type: 'uuid',
//             generationStrategy: 'uuid',
//             default: 'uuid_generate_v4()',
//             isPrimary: true,
//           },
//           {
//             name: 'clientId',
//             type: 'uuid',
//             isNullable: false,
//           },
//           {
//             name: 'languageCode',
//             type: 'varchar(10)', // e.g., 'en', 'ar', 'fr', 'es'
//             isNullable: false,
//           },
//           {
//             name: 'name',
//             type: 'varchar(100)',
//             isNullable: true,
//           },
//           {
//             name: 'country',
//             type: 'varchar(100)',
//             isNullable: true,
//           },
//           {
//             name: 'createdAt',
//             type: 'timestamp',
//             default: 'CURRENT_TIMESTAMP',
//             isNullable: false,
//           },
//           {
//             name: 'updatedAt',
//             type: 'timestamp',
//             default: 'CURRENT_TIMESTAMP',
//             onUpdate: 'CURRENT_TIMESTAMP',
//             isNullable: false,
//           },
//           {
//             name: 'deletedAt',
//             type: 'timestamp',
//             isNullable: true,
//           },
//         ],
//         foreignKeys: [
//           {
//             columnNames: ['clientId'],
//             referencedTableName: 'client_profiles',
//             referencedColumnNames: ['id'],
//             onDelete: 'CASCADE',
//             onUpdate: 'CASCADE',
//           },
//         ],
//         uniques: [
//           {
//             name: 'UQ_client_language',
//             columnNames: ['clientId', 'languageCode'],
//           },
//         ],
//       }),
//     );

//     await queryRunner.createIndex(
//       'client_profile_translations',
//       new TableIndex({
//         name: 'IDX_client_profile_translations_languageCode',
//         columnNames: ['languageCode'],
//       }),
//     );
//     await queryRunner.query(`
//       INSERT INTO "client_profile_translations" (
//         "id", 
//         "clientId", 
//         "languageCode", 
//         "name", 
//         "country", 
//         "createdAt", 
//         "updatedAt"
//       )
//       VALUES 
//       -- English translations
//       (
//         'b0c1d2e3-4f5a-6b7c-8d9e-0f1a2b3c4d5e',
//         'c5d6e7f8-9a0b-1c2d-3e4f-5a6b7c8d9e0f', -- Client 1 profile
//         'en',
//         'Ahmed Mohamed',
//         'Egypt',
//         NOW(),
//         NOW()
//       ),
//       (
//         'c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f',
//         'd6e7f8a9-0b1c-2d3e-4f5a-6b7c8d9e0f1a', -- Client 2 profile
//         'en',
//         'Sarah Johnson',
//         'United States',
//         NOW(),
//         NOW()
//       ),
      
//       -- Arabic translations
//       (
//         'a5b6c7d8-9e0f-1a2b-3c4d-5e6f7a8b9c0d',
//         'c5d6e7f8-9a0b-1c2d-3e4f-5a6b7c8d9e0f', -- Client 1 profile
//         'ar',
//         'أحمد محمد',
//         'مصر',
//         NOW(),
//         NOW()
//       ),
      
//       -- French translations
//       (
//         'd8e9f0a1-2b3c-4d5e-6f7a-8b9c0d1e2f3a',
//         'd6e7f8a9-0b1c-2d3e-4f5a-6b7c8d9e0f1a', -- Client 2 profile
//         'fr',
//         'Sarah Johnson',
//         'États-Unis',
//         NOW(),
//         NOW()
//       ),
//       (
//         'e9f0a1b2-3c4d-5e6f-7a8b-9c0d1e2f3a4b',
//         'c5d6e7f8-9a0b-1c2d-3e4f-5a6b7c8d9e0f', -- Client 1 profile
//         'fr',
//         'James Smith',
//         'Royaume-Uni',
//         NOW(),
//         NOW()
//       ),
      
//       -- Spanish translations
//       (
//         'f0a1b2c3-4d5e-6f7a-8b9c-0d1e2f3a4b5c',
//         'd6e7f8a9-0b1c-2d3e-4f5a-6b7c8d9e0f1a', -- Client 2 profile
//         'es',
//         'Sarah Johnson',
//         'Estados Unidos',
//         NOW(),
//         NOW()
//       )
//     `);

//     this.logger.log(
//       'Client profile translations table created and seeded successfully',
//     );
//   }

//   public async down(queryRunner: QueryRunner): Promise<void> {
//     this.logger.log('Dropping client_profile_translations table');
//     await queryRunner.dropIndex(
//       'client_profile_translations',
//       'IDX_client_profile_translations_languageCode',
//     );
//     await queryRunner.dropTable('client_profile_translations');
//   }
// }
