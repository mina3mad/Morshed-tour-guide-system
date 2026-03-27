import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientProfile } from './entities/client-profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomI18nService } from 'src/i18n/i18n.service';
import { ClientProfileResponseDto } from './dto/client-profile-response.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';
import { S3Service } from 'src/shared/s3.service';

@Injectable()
export class ClientProfilesService {
  constructor(
    @InjectRepository(ClientProfile)
    private readonly clientProfileRepository: Repository<ClientProfile>,
    private readonly s3Service: S3Service,
    private readonly i18n: CustomI18nService,
  ) {}

  // Called automatically during signUp when role = Client
  async createProfile(userId: string): Promise<ClientProfile> {
    const existing = await this.clientProfileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (existing) {
      throw new ConflictException(
        this.i18n.translate('clientProfileAlreadyExist'),
      );
    }

    const profile = this.clientProfileRepository.create({ userId });
    return this.clientProfileRepository.save(profile);
  }

  async getMyProfile(userId: string): Promise<ClientProfileResponseDto> {
    const profile = await this.clientProfileRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
    if (!profile) {
      throw new NotFoundException(
        this.i18n.translate('common.profileNotFound'),
      );
    }
    return plainToInstance(ClientProfileResponseDto, profile, {
      excludeExtraneousValues: true,
    });
  }

  async updateMyProfile(
    userId: string,
    updateDto: UpdateClientProfileDto,
    imageFile?: Express.Multer.File,
  ): Promise<ClientProfileResponseDto> {
    const profile = await this.clientProfileRepository.findOne({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException(
        this.i18n.translate('common.profileNotFound'),
      );
    }

    if (imageFile) {
      // Delete old image if exists
      if (profile.image) {
        await this.s3Service.deleteFile(
          `photos/client_profile_images/${profile.image}`,
        );
      }
      const uploaded = await this.s3Service.uploadFile(
        imageFile,
        'photos/client_profile_images',
      );
      profile.image = uploaded;
    }

    Object.assign(profile, updateDto);
    const updated = await this.clientProfileRepository.save(profile);

    return plainToInstance(ClientProfileResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(): Promise<ClientProfileResponseDto[]> {
    const profiles = await this.clientProfileRepository.find({
      relations: ['user'],
    });
    return plainToInstance(ClientProfileResponseDto, profiles, {
      excludeExtraneousValues: true,
    });
  }

  async softDelete(id: string): Promise<{ message: string }> {
    const profile = await this.clientProfileRepository.findOne({
      where: { id },
    });
    if (!profile) {
      throw new NotFoundException(this.i18n.translate('common.profileNotFound'));
    }
    await this.clientProfileRepository.softDelete(id);
    return {
      message: this.i18n.translate('common.clientProfileDeletedSuccessfully'),
    };
  }
}
