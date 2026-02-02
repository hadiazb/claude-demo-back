import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsNumber,
  Max,
  Matches,
} from 'class-validator';

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
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  /**
   * Password for the new user account.
   * Must meet the following requirements:
   * - Minimum 8 characters
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one number
   * - At least one special character
   */
  @ApiProperty({
    example: 'SecurePass123!',
    description:
      'Password (min 8 chars, uppercase, lowercase, number, special char)',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/[a-z]/, {
    message: 'Password must contain at least one lowercase letter',
  })
  @Matches(/\d/, { message: 'Password must contain at least one number' })
  @Matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, {
    message: 'Password must contain at least one special character',
  })
  password: string;

  /**
   * First name of the new user.
   * Must be a string with minimum length of 2 characters.
   */
  @ApiProperty({
    example: 'John',
    description: 'User first name (min 2 characters)',
  })
  @IsString()
  @MinLength(2)
  firstName: string;

  /**
   * Last name of the new user.
   * Must be a string with minimum length of 2 characters.
   */
  @ApiProperty({
    example: 'Doe',
    description: 'User last name (min 2 characters)',
  })
  @IsString()
  @MinLength(2)
  lastName: string;

  /**
   * Age in years of the new user.
   * Optional numeric field with maximum value of 130.
   */
  @ApiPropertyOptional({ example: 25, description: 'User age (max 130)' })
  @IsOptional()
  @IsNumber()
  @Max(130)
  age?: number;

  /**
   * URL to the user's avatar image.
   * Optional string field.
   */
  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
