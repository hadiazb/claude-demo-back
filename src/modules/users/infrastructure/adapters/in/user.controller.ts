import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CurrentUser, Roles } from '@shared';
import { JwtAuthGuard, RolesGuard } from '@auth/infrastructure/guards';
import { UserService } from '@users/application/services';
import { UpdateUserDto, UserResponseDto } from '@users/application/dto';
import { UserRole } from '@users/domain/entities';

/**
 * REST controller for user management.
 *
 * All endpoints require JWT authentication.
 *
 * @class UserController
 * @route /users
 */
@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  /**
   * Creates an instance of UserController.
   *
   * @param userService - User service for business operations
   */
  constructor(private readonly userService: UserService) {}

  /**
   * Retrieves the profile of the currently authenticated user.
   *
   * @route GET /users/me
   * @param userId - The ID of the authenticated user (extracted from JWT token)
   * @returns The user's profile data
   * @throws {NotFoundException} When the user is not found in the database
   */
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getProfile(
    @CurrentUser('userId') userId: string,
  ): Promise<UserResponseDto> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return UserResponseDto.fromDomain(user);
  }

  /**
   * Updates the profile of the currently authenticated user.
   *
   * @route PATCH /users/me
   * @param userId - The ID of the authenticated user (extracted from JWT token)
   * @param updateUserDto - DTO containing the fields to update
   * @returns The updated user profile data
   */
  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User updated',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @CurrentUser('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userService.updateUser(userId, updateUserDto);
    return UserResponseDto.fromDomain(user);
  }

  /**
   * Retrieves a user by their unique identifier.
   *
   * @route GET /users/:id
   * @param id - The unique identifier of the user to retrieve
   * @returns The user profile data
   * @throws {NotFoundException} When no user exists with the given ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findById(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return UserResponseDto.fromDomain(user);
  }

  /**
   * Retrieves all users in the system.
   * Only accessible by users with ADMIN role.
   *
   * @route GET /users
   * @returns An array of all user profiles
   * @throws {ForbiddenException} When user does not have ADMIN role
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    type: [UserResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userService.findAll();
    return users.map((user) => UserResponseDto.fromDomain(user));
  }
}
