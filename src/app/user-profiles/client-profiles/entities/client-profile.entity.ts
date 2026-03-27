import { BaseEntity } from 'src/shared/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('client_profiles')
export class ClientProfile extends BaseEntity {
  @OneToOne(() => User, (user) => user.clientProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  image: string;

  get imageUrl(): string | null {
    if (!this.image) {
      return null;
    }
    const baseUrl = process.env.S3_BASE_URL || "";
    return `${baseUrl}photos/client_profile_images/${this.image}`;
  }

  @Column({ default: 0 })
  bookingCount: number;

}