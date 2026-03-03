import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { RefreshToken } from 'src/app/auth/tokens/entities/token.entity';
import { I18n_Module } from 'src/i18n/i18n.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, RefreshToken]), I18n_Module],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
