import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsNumber,
  Max,
} from 'class-validator';
import { UserRole } from '@users/domain';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsOptional()
  @IsNumber()
  @Max(130)
  age: number;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
