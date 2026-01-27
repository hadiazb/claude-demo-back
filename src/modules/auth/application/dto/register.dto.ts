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

/**
 * Data Transfer Object for user registration requests.
 * Contains all required and optional fields for creating a new user account.
 * Uses class-validator decorators for input validation.
 */
export class RegisterDto {
  /**
   * Email address for the new user account.
   * Must be a valid email format.
   */
  @IsEmail()
  email: string;

  /**
   * Password for the new user account.
   * Must be a string with minimum length of 8 characters.
   */
  @IsString()
  @MinLength(8)
  password: string;

  /**
   * First name of the new user.
   * Must be a string with minimum length of 2 characters.
   */
  @IsString()
  @MinLength(2)
  firstName: string;

  /**
   * Last name of the new user.
   * Must be a string with minimum length of 2 characters.
   */
  @IsString()
  @MinLength(2)
  lastName: string;

  /**
   * Age in years of the new user.
   * Optional numeric field with maximum value of 130.
   */
  @IsOptional()
  @IsNumber()
  @Max(130)
  age: number;

  /**
   * Role assigned to the new user.
   * Optional field that defaults to USER if not specified.
   * Must be a valid UserRole enum value (USER or ADMIN).
   */
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  /**
   * URL to the user's avatar image.
   * Optional string field.
   */
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
