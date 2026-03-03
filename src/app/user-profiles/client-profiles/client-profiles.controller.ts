import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CurrentUser } from 'src/app/auth/authorization/decorator/current-user.decorator';
import { ClientProfilesService } from './client-profiles.service';
import { Roles } from 'src/app/auth/authorization/decorator/roles.decorator';
import { UserRole } from '../users/enum/user-role.enum';
import { JwtAuthGuard } from 'src/app/auth/authorization/guard/jwt.auth.guard';
import { RolesGuard } from 'src/app/auth/authorization/guard/role.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageMulterConfig } from 'src/shared/file-filter';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';
import { ClientProfileResponseDto } from './dto/client-profile-response.dto';

@Controller('clientProfile')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientProfilesController {
  constructor(private readonly clientProfilesService: ClientProfilesService) {}

  @Get('me')
  @Roles(UserRole.Client)
  async getMyProfile(
    @CurrentUser() user: { userId: string },
  ): Promise<ClientProfileResponseDto> {
    return await this.clientProfilesService.getMyProfile(user.userId);
  }

  @Patch('me')
  @Roles(UserRole.Client)
  @UseInterceptors(FileInterceptor('image', imageMulterConfig))
  async updateMyProfile(
    @CurrentUser() user: { userId: string },
    @Body() updateDto: UpdateClientProfileDto,
    @UploadedFile() imageFile?: Express.Multer.File,
  ) {
    return await this.clientProfilesService.updateMyProfile(
      user.userId,
      updateDto,
      imageFile,
    );
  }

  @Get()
  @Roles(UserRole.Client)
  findAll() {
    return this.clientProfilesService.findAll();
  }

  @Delete(':id')
  @Roles(UserRole.Admin,UserRole.Client)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientProfilesService.softDelete(id);
  }
}
