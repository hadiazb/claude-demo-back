import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserRole } from '@users/domain';

/**
 * Data Transfer Object for updating a user's role.
 * Only accessible by administrators.
 */
export class UpdateRoleDto {
  /**
   * New role to assign to the user.
   * Must be a valid UserRole enum value (USER or ADMIN).
   */
  @ApiProperty({
    enum: UserRole,
    example: UserRole.ADMIN,
    description: 'New role for the user',
  })
  @IsEnum(UserRole)
  role: UserRole;
}
