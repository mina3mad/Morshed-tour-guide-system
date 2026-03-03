import { Exclude, Expose } from "class-transformer";
import { UserGender } from "../enum/user-gender.enum";
import { UserRole } from "../enum/user-role.enum";

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  gender: UserGender;

  @Expose()
  role: UserRole;

  @Expose()
  country: string;

  @Expose()
  isActive: boolean;

  @Expose()
  isVerified: boolean;

  @Expose()
  createdAt: Date;

  @Exclude()
  password: string;

  @Exclude()
  deletedAt: Date;

  @Exclude()
  deviceToken: string;
}