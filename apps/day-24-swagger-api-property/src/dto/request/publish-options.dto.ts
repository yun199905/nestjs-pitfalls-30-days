import { ApiProperty } from '@nestjs/swagger';

export class PublishOptionsDto {
  @ApiProperty({ description: '發布時是否通知追蹤者' })
  notifyFollowers: boolean;
}
