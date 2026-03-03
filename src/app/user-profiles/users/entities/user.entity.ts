import { BaseEntity } from 'src/shared/base.entity';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { UserGender } from '../enum/user-gender.enum';
import { UserRole } from '../enum/user-role.enum';
import { OtpCode } from 'src/app/auth/otp-codes/entities/otp-code.entity';
import { RefreshToken } from 'src/app/auth/tokens/entities/token.entity';
import { ClientProfile } from '../../client-profiles/entities/client-profile.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true, unique: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: UserGender,
    nullable: true,
  })
  gender: UserGender;

  @Column({nullable:true})
  country?:string;

  // @Column({select:false})
  @Column({ nullable: true })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.Client,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'text', nullable: true })
  deviceToken: string;

  @Column({ nullable: true, unique: true })
  googleId: string;

  @Column({ nullable: true })
  avatar: string;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => OtpCode, (otpCode) => otpCode.user)
  otpCodes: OtpCode[];

  @OneToOne(() => ClientProfile, (clientProfile) => clientProfile.user)
  clientProfile: ClientProfile;

  //   @OneToOne(() => GuideProfile, guideProfile => guideProfile.user)
  //   guideProfile: GuideProfile;
}
