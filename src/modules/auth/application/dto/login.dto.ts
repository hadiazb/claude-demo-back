import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * Data Transfer Object for user login requests.
 * Contains the credentials required for authentication.
 * Uses class-validator decorators for input validation.
 */
export class LoginDto {
  /**
   * Email address of the user attempting to log in.
   * Must be a valid email format.
   */
  @IsEmail()
  email: string;

  /**
   * Password for authentication.
   * Must be a string with minimum length of 8 characters.
   */
  @IsString()
  @MinLength(8)
  password: string;
}
