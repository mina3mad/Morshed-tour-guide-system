import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ClientProfilesModule } from './client-profiles/client-profiles.module';

@Module({
  imports: [UsersModule, ClientProfilesModule]
})
export class UserProfilesModule {}
