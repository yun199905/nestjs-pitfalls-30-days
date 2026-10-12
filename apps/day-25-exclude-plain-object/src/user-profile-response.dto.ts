import { Exclude } from 'class-transformer';

export class UserProfileResponseDto {
  id: number;
  email: string;
  postCount: number;

  @Exclude({ toPlainOnly: true })
  passwordHash: string;
}
