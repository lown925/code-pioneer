import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import {
  COMMUNITY_POST_LIMIT_DEFAULT,
  COMMUNITY_POST_LIMIT_MAX,
} from '../community.constants';

export const COMMUNITY_POST_SORT_VALUES = [
  'recommended',
  'latest',
  'mostLiked',
  'mostFavorited',
  'mostCommented',
] as const;

export class CommunityPostsQueryDto {
  @IsOptional()
  @IsString()
  categoryKey?: string;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(COMMUNITY_POST_LIMIT_MAX)
  limit?: number;

  @IsOptional()
  @IsIn(COMMUNITY_POST_SORT_VALUES)
  sort?: (typeof COMMUNITY_POST_SORT_VALUES)[number];
}

export class CommunityUserPostsQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(COMMUNITY_POST_LIMIT_MAX)
  limit?: number;
}

export class CommunityCursorQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(COMMUNITY_POST_LIMIT_MAX)
  limit?: number;
}

export const COMMUNITY_POST_DEFAULT_LIMIT = COMMUNITY_POST_LIMIT_DEFAULT;
