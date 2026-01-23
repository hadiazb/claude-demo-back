import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../../../application/services/user.service';
import { UpdateUserDto } from '../../../application/dto/update-user.dto';
import { UserResponseDto } from '../../../application/dto/user-response.dto';
import { JwtAuthGuard } from '../../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../../shared/infrastructure/decorators/current-user.decorator';

/**
 * REST controller for user management.
 *
 * All endpoints require JWT authentication.
 *
 * @class UserController
 * @route /users
 */
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
  async findById(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return UserResponseDto.fromDomain(user);
  }

  /**
   * Retrieves all users in the system.
   *
   * @route GET /users
   * @returns An array of all user profiles
   */
  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userService.findAll();
    return users.map((user) => UserResponseDto.fromDomain(user));
  }
}
