import { User, UserRole } from '@users/domain';

/**
 * Data Transfer Object for user API responses.
 * Transforms domain User entities into a format suitable for API consumers.
 * Excludes sensitive data like passwords from the response.
 */
export class UserResponseDto {
  /** Unique identifier for the user */
  id: string;
  /** User's email address */
  email: string;
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** User's role in the system (ADMIN or USER) */
  role: UserRole;
  /** Indicates whether the user account is active */
  isActive: boolean;
  /** URL to the user's avatar image, or null if not set */
  avatarUrl: string | null;
  /** Timestamp when the user was created */
  createdAt: Date;
  /** Timestamp when the user was last updated */
  updatedAt: Date;

  /**
   * Factory method that creates a UserResponseDto from a domain User entity.
   * Maps domain properties to DTO properties, extracting the email value from its Value Object.
   * @param user - The domain User entity to transform
   * @returns A new UserResponseDto instance populated with the user's data
   */
  static fromDomain(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email.getValue();
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.role = user.role;
    dto.isActive = user.isActive;
    dto.avatarUrl = user.avatarUrl;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}
