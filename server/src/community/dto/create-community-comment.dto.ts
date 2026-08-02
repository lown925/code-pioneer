import { IsString, Length } from 'class-validator';

export class CreateCommunityCommentDto {
  @IsString()
  @Length(1, 1000, {
    message: 'COMMUNITY_COMMENT_CONTENT_INVALID',
  })
  content!: string;
}
