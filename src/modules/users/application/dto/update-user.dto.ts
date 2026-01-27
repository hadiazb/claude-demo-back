import { IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

/**
 * Data Transfer Object for updating user information.
 * All fields are optional, allowing partial updates.
 * Uses class-validator decorators for input validation.
 */
export class UpdateUserDto {
  /**
   * Updated first name for the user.
   * Optional field with minimum length of 2 characters.
   */
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string;

  /**
   * Updated last name for the user.
   * Optional field with minimum length of 2 characters.
   */
  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string;

  /**
   * Updated URL to the user's avatar image.
   * Optional string field.
   */
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  /**
   * Updated active status for the user account.
   * Optional boolean field to enable or disable the account.
   */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
