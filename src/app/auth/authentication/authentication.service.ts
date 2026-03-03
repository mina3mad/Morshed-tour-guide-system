import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/app/user-profiles/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './../../user-profiles/users/dto/create-user.dto';
import { compareSync, hashSync } from 'bcrypt';
import { OtpCodesService } from '../otp-codes/otp-codes.service';
import { OtpCodeType } from '../otp-codes/enum/otp-code-type.enum';
import { CustomI18nService } from 'src/i18n/i18n.service';
import { UserResponseDto } from 'src/app/user-profiles/users/dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { AuthLoginInputDto } from './dto/auth-login-input.dto';
import { AuthLoginResponseDto } from './dto/auth-login-response.dto';
import { OtpCode } from '../otp-codes/entities/otp-code.entity';
import { OtpCodeStatus } from '../otp-codes/enum/otp-code-status.enum';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserGender } from 'src/app/user-profiles/users/enum/user-gender.enum';
import { TokensService } from '../tokens/tokens.service';
import { UserRole } from 'src/app/user-profiles/users/enum/user-role.enum';
import { ClientProfilesService } from 'src/app/user-profiles/client-profiles/client-profiles.service';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OtpCode)
    private readonly otpRepository: Repository<OtpCode>,
    private readonly otpCodeService: OtpCodesService,
    private readonly i18n: CustomI18nService,
    private readonly tokensService: TokensService,
    private readonly clientProfilesService:ClientProfilesService
  ) {}

  async signUp(
    createUserDto: CreateUserDto,
  ): Promise<{ message: string; User: UserResponseDto }> {
    const { email, password } = createUserDto;

    const emailLowerCase = email.toLocaleLowerCase();

    const existingEmail = await this.userRepository.findOne({
      where: { email: emailLowerCase },
    });
    if (existingEmail) {
      throw new ConflictException(this.i18n.translate('common.emailExist'));
    }

    const existingPhone = await this.userRepository.findOne({
      where: { phone: createUserDto.phone },
    });
    if (existingPhone) {
      throw new ConflictException(this.i18n.translate('common.phoneExist'));
    }

    const hashedPassword = hashSync(password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      email: emailLowerCase,
      password: hashedPassword,
    });
    const savedUser = await this.userRepository.save(user);

    //create client profile if role is client
    if (savedUser.role === UserRole.Client) {
      await this.clientProfilesService.createProfile(savedUser.id);
    }

    //create otp
    const otpSent = await this.otpCodeService.generateOtp(
      email,
      OtpCodeType.SignUp,
    );
    if (!otpSent) {
      throw new BadRequestException(this.i18n.translate('common.failedOtp'));
    }

    const userRes = plainToInstance(UserResponseDto, savedUser, {
      excludeExtraneousValues: true,
    });

    return {
      message: this.i18n.translate('common.signUpSuccessfully'),
      User: userRes,
    };
  }

  async login(
    authLoginInput: AuthLoginInputDto,
  ): Promise<AuthLoginResponseDto> {
    const emailLowerCase = authLoginInput.email.toLowerCase();
    const user = await this.userRepository.findOne({
      where: { email: emailLowerCase },
    });

    if (!user || !user.isVerified) {
      throw new UnauthorizedException(
        this.i18n.translate('common.invalidCredentials'),
      );
    }

    // Compare the input password with the stored hash
    const isMatch = compareSync(authLoginInput.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException(
        this.i18n.translate('common.invalidCredentials'),
      );
    }

    // Update user's device token if provided
    if (authLoginInput.deviceToken) {
      await this.userRepository.update(user.id, {
        deviceToken: authLoginInput.deviceToken,
      });
    }

    // Generate an access and refresh token for the authenticated user
    const { accessToken, refreshToken } =
      await this.tokensService.generateTokens(user);

    //  const { password, ...userResponse } = user;
    const userRes = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });

    return {
      accessToken,
      refreshToken,
      user: userRes,
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { email, newPassword } = resetPasswordDto;
    const emailLowerCase = email.toLowerCase();
    const user = await this.userRepository.findOne({
      where: { email: emailLowerCase },
    });

    if (!user) {
      throw new NotFoundException(this.i18n.translate('common.userNotFound'));
    }

    const otpCode = await this.otpRepository.findOne({
      where: {
        user: { id: user.id },
        type: OtpCodeType.ForgetPassword,
        state: OtpCodeStatus.Used,
      },
      relations: ['user'],
    });
    if (!otpCode || new Date() > otpCode.expireAt) {
      throw new UnauthorizedException(
        this.i18n.translate('common.otpCodeExpired'),
      );
    }
    await this.otpRepository.softDelete(otpCode.id);
    user.password = hashSync(newPassword, 10);
    await this.userRepository.save(user);

    return { message: this.i18n.translate('common.passwordResetSuccessfully') };
  }

  async googleLogin(googleUser: {
    googleId: string;
    email: string;
    avatar: string;
    firstName: string;
    lastName: string;
    gender?: string;
  }): Promise<AuthLoginResponseDto> {
    const emailLowerCase = googleUser.email.toLowerCase();

    let user = await this.userRepository.findOne({
      where: { email: emailLowerCase },
    });

    if (user) {
      // يوزر موجود - ربط الـ googleId لو مش مربوط
      if (!user.googleId) {
        user.googleId = googleUser.googleId;
        user.avatar = googleUser.avatar;
        user.isVerified = true;
        await this.userRepository.save(user);
      }
    } else {
      // يوزر جديد - إنشاء account
      user = this.userRepository.create({
        email: emailLowerCase,
        googleId: googleUser.googleId,
        avatar: googleUser.avatar,
        role:UserRole.Client,
        isVerified: true,
        password: null,
      });
      await this.userRepository.save(user);
      // Auto-create client profile for Google sign-ups
      await this.clientProfilesService.createProfile(user.id);
    }

    const { accessToken, refreshToken } =
      await this.tokensService.generateTokens(user);
    const userRes = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });

    return {
      accessToken,
      refreshToken,
      user: userRes,
    };
  }
}
