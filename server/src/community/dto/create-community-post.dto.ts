import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export const COMMUNITY_CONTENT_BLOCK_TYPES = [
  'TEXT',
  'IMAGE',
  'CODE',
] as const;

export class CreateCommunityPostImageDto {
  @IsString()
  @Length(1, 255)
  objectKey!: string;

  @IsString()
  @Length(1, 2000)
  url!: string;
}

export class CreateCommunityPostContentBlockDto {
  @IsIn(COMMUNITY_CONTENT_BLOCK_TYPES)
  type!: (typeof COMMUNITY_CONTENT_BLOCK_TYPES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(20000)
  text?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20000)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  language?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  objectKey?: string;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  url?: string;
}

export class CreateCommunityPostDto {
  @IsString()
  @Length(1, 80)
  categoryKey!: string;

  @IsString()
  @Length(1, 80)
  title!: string;

  @IsOptional()
  @IsString()
  @Length(1, 20000)
  content?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCommunityPostContentBlockDto)
  contentBlocks?: CreateCommunityPostContentBlockDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCommunityPostImageDto)
  images?: CreateCommunityPostImageDto[];
}
