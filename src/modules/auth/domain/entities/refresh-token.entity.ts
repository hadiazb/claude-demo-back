import { BaseEntity } from '../../../../shared/domain/base.entity';

/**
 * Interface defining the properties required to construct a RefreshToken entity.
 * Used as a parameter object for the RefreshToken constructor.
 */
export interface RefreshTokenProps {
  /** Unique identifier for the refresh token */
  id: string;
  /** The JWT refresh token string */
  token: string;
  /** Unique identifier of the user who owns this token */
  userId: string;
  /** Date and time when the token expires */
  expiresAt: Date;
  /** Indicates if the token has been revoked */
  isRevoked: boolean;
  /** Optional creation timestamp */
  createdAt?: Date;
  /** Optional last update timestamp */
  updatedAt?: Date;
}

/**
 * Domain entity representing a refresh token in the authentication system.
 * Extends BaseEntity to inherit common properties (id, createdAt, updatedAt).
 * Used for managing user session persistence and token rotation.
 */
export class RefreshToken extends BaseEntity {
  /** The JWT refresh token string */
  readonly token: string;
  /** Unique identifier of the user who owns this token */
  readonly userId: string;
  /** Date and time when the token expires */
  readonly expiresAt: Date;
  /** Indicates if the token has been manually revoked */
  readonly isRevoked: boolean;

  /**
   * Creates a new RefreshToken entity instance.
   * @param props - Object containing all required refresh token properties
   */
  constructor(props: RefreshTokenProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.token = props.token;
    this.userId = props.userId;
    this.expiresAt = props.expiresAt;
    this.isRevoked = props.isRevoked;
  }

  /**
   * Checks if the token has expired based on the current date.
   * @returns True if the current date is past the expiration date, false otherwise
   */
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Checks if the token is valid for use.
   * A token is valid if it has not been revoked and has not expired.
   * @returns True if the token is valid, false otherwise
   */
  isValid(): boolean {
    return !this.isRevoked && !this.isExpired();
  }
}
