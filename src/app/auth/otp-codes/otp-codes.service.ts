import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OtpCode } from './entities/otp-code.entity';
import { IsNull, Repository } from 'typeorm';
import { User } from 'src/app/user-profiles/users/entities/user.entity';
import { OtpCodeType } from './enum/otp-code-type.enum';
import { CustomI18nService } from 'src/i18n/i18n.service';
import * as emailTemplates from '../../../shared/email/templates/emailTemplates.json';
import { sendEmail } from '../../../shared/email/utils/sendEmail';
import { OtpCodeStatus } from './enum/otp-code-status.enum';

@Injectable()
export class OtpCodesService {
  constructor(
    @InjectRepository(OtpCode)
    private readonly otpRepository: Repository<OtpCode>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly i18n: CustomI18nService,
  ) {}
  async generateOtp(email: string, type: OtpCodeType): Promise<string> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(
        this.i18n.translate('common.userNotFound'),
      );
    }

    // Delete any existing OTPs for this user and type
    const otpCodes = await this.otpRepository.find({
      where: { user: { id: user.id }, type, deletedAt: IsNull() },
      relations: ['user'],
    });

    if (otpCodes.length > 0) {
      await this.otpRepository.softDelete(otpCodes.map((otp) => otp.id));
    }
    // await this.otpRepository.delete({
    //   user: {id:user.id},
    //   type: type,
    // });

    const code = this.generateSecureCode();
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 10);

    const otp = this.otpRepository.create({
      user,
      code,
      type,
      state:OtpCodeStatus.Generated,
      expireAt: expirationDate,
    });

    await this.otpRepository.save(otp);

    //send verification email
    const otpTemplate =
      type == OtpCodeType.SignUp
        ? emailTemplates.createAccount
        : emailTemplates.forgetPassword;
    const templateSubject = otpTemplate.subject;
    const templateBody = otpTemplate.body
      .replace('{{code}}', otp.code)
      .replace('{{minutes}}', '10');

    await sendEmail({
      to: email,
      subject: templateSubject,
      html: templateBody,
    });

    return otp.code;
  }

  async resendOtpCode(body): Promise<{ message: string }> {
    const { email, type } = body;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(this.i18n.translate('common.userNotFound'));
    }

    const lastOtp = await this.otpRepository.findOne({
      where: { user: { id: user.id }, type },
      order: { createdAt: 'DESC' },
    });

    if (lastOtp) {
      const oneMinuteAgo = new Date();
      oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);

      if (new Date(lastOtp.createdAt) > oneMinuteAgo) {
        throw new BadRequestException(
          this.i18n.translate('common.otpSentLessThanOneMinute'),
        );
      }
    }

    await this.otpRepository.softDelete({
      user: { id: user.id },
      type: type,
    });

    const code = this.generateSecureCode();
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 10);

    const otpCode = this.otpRepository.create({
      code,
      user: { id: user.id },
      type,
      expireAt: expirationDate,
    });

    const otpTemplate =
      type == OtpCodeType.SignUp
        ? emailTemplates.createAccount
        : emailTemplates.forgetPassword;
    const templateSubject = otpTemplate.subject;
    const templateBody = otpTemplate.body
      .replace('{{code}}', code)
      .replace('{{minutes}}', '10');

    await sendEmail({
      to: email,
      subject: templateSubject,
      html: templateBody,
    });

    await this.otpRepository.save(otpCode);

    return { message: this.i18n.translate('common.otpSend') };
  }

  async verifyUserForSignUp(
    code: string,
    email: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(this.i18n.translate('common.userNotFound'));
    }
    if (user.isVerified) {
      throw new BadRequestException(
        this.i18n.translate('common.userAlreadyVerified'),
      );
    }

    await this.verifyOtp(email, code, OtpCodeType.SignUp);

    user.isVerified = true;
    await this.userRepository.save(user);

    return { message: this.i18n.translate('common.verifiedSuccessfully') };
  }

  async UseResetPasswordOtpCode(code: string, email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return false;
    }
    await this.verifyOtp(email, code, OtpCodeType.ForgetPassword);
    return true;
  }

  async verifyOtp(
    email: string,
    code: string,
    type: OtpCodeType,
  ): Promise<Boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(this.i18n.translate('common.userNotFound'));
    }

    const otpCode = await this.otpRepository.findOne({
      where: {
        code,
        user: { id: user.id },
        type,
        state:OtpCodeStatus.Generated,
        deletedAt: IsNull(),
      },
    });

    if (!otpCode || new Date() > otpCode.expireAt) {
      throw new BadRequestException(
        this.i18n.translate('common.invalidOtpCode'),
      );
    }

    // invalidate بعد الاستخدام
    otpCode.state=OtpCodeStatus.Used;
    await this.otpRepository.save(otpCode);

    return true;
  }

  // Generate secure random code
  generateSecureCode(): string {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0].toString().slice(0, 6);
  }
}
