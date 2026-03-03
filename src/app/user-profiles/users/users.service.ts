import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RefreshToken } from 'src/app/auth/tokens/entities/token.entity';
import { Response } from 'express';
import { CustomI18nService } from 'src/i18n/i18n.service';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly i18n: CustomI18nService,
  ) {}

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find();
    return plainToInstance(UserResponseDto, users, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(this.i18n.translate('common.userNotFound'));
    }
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
    if (!user) {
      throw new NotFoundException(this.i18n.translate('common.userNotFound'));
    }
    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(this.i18n.translate('common.userNotFound'));
    }

    if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
      const phoneExists = await this.userRepository.findOne({
        where: { phone: updateUserDto.phone },
      });
      if (phoneExists) {
        throw new ConflictException(this.i18n.translate('common.phoneExist'));
      }
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailExists = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (emailExists) {
        throw new ConflictException(this.i18n.translate('common.emailExist'));
      }
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    return plainToInstance(UserResponseDto, updatedUser, {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(this.i18n.translate('common.userNotFound'));
    }
    await this.userRepository.softDelete(id);
    return { message: this.i18n.translate('common.deletedSuccessfully') };
  }

  
  async toggleActivation(id: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(this.i18n.translate('common.userNotFound'));
    }

    user.isActive = !user.isActive;
    await this.userRepository.save(user);

    const messageKey = user.isActive
      ? 'common.activatedSuccessfully'
      : 'common.deactivatedSuccessfully';

    return { message: this.i18n.translate(messageKey) };
  }


  async logout(userId: string, res: Response) {
    //i can add in users Boolean logedIn and when i logout make it flase then in auth guard check both userExist and logged in
    await this.refreshTokenRepository.delete({
      user: { id: userId },
    });

    res.clearCookie('refreshToken', {
      path: '/api/token/refresh',
    });

    return { message: this.i18n.translate('common.loggedOutSuccessfully') };
  }
}
