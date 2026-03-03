import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class ClientProfileResponseDto {
  @Expose()
  id: string;

  // @Expose()
  // userId: string;

  @Expose()
  @Type(() => UserResponseDto) // مهم لتحويل nested object
  user: UserResponseDto;

  @Expose()
  name: string;

  // @Expose()
  // image: string;

  @Expose()
  imageUrl: string | null;

  @Expose()
  bookingCount: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
