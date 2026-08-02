import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';

export class CreateCommunityPostImageDto {
  @IsString()
  @Length(1, 255)
  objectKey!: string;

  @IsString()
  @Length(1, 2000)
  url!: string;
}

export class CreateCommunityPostDto {
  @IsString()
  @Length(1, 80)
  categoryKey!: string;

  @IsString()
  @Length(1, 80)
  title!: string;

  @IsString()
  @Length(1, 4000)
  content!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => CreateCommunityPostImageDto)
  images?: CreateCommunityPostImageDto[];
}
