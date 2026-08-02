import { IsUUID } from 'class-validator';

export class CommunityPostIdDto {
  @IsUUID()
  postId!: string;
}
