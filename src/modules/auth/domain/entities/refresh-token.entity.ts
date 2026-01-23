import { BaseEntity } from '../../../../shared/domain/base.entity';

export interface RefreshTokenProps {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class RefreshToken extends BaseEntity {
  readonly token: string;
  readonly userId: string;
  readonly expiresAt: Date;
  readonly isRevoked: boolean;

  constructor(props: RefreshTokenProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.token = props.token;
    this.userId = props.userId;
    this.expiresAt = props.expiresAt;
    this.isRevoked = props.isRevoked;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isValid(): boolean {
    return !this.isRevoked && !this.isExpired();
  }
}
