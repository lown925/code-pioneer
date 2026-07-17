import { IsOptional, IsString, MinLength } from 'class-validator';

export class WechatLoginDto {
  @IsString()
  @MinLength(1)
  code!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  mockOpenId?: string;
}
