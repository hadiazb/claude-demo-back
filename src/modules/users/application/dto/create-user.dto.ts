import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

/**
 * Data Transfer Object for creating a new user.
 * Defines the required and optional fields for user registration.
 * Uses class-validator decorators for input validation.
 */
export class CreateUserDto {
  /**
   * Email address for the new user.
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
   * URL to the user's avatar image.
   * Optional string field.
   */
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
