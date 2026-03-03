import { Module } from '@nestjs/common';
import { ClientProfilesService } from './client-profiles.service';
import { ClientProfilesController } from './client-profiles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientProfile } from './entities/client-profile.entity';
import { I18n_Module } from 'src/i18n/i18n.module';
import { CloudinaryService } from 'src/shared/cloudinary.service';
import { User } from '../users/entities/user.entity';

@Module({
  imports:[TypeOrmModule.forFeature([ClientProfile,User]),
    I18n_Module,],
  providers: [ClientProfilesService,CloudinaryService],
  controllers: [ClientProfilesController],
  exports:[ClientProfilesService]
})
export class ClientProfilesModule {}
