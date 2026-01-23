import { BaseEntity } from '@shared/domain';
import { Email } from '@users/domain/value-objects';
import { Password } from '@users/domain/value-objects';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface UserProps {
  id: string;
  email: Email;
  password: Password;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  avatarUrl: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends BaseEntity {
  readonly email: Email;
  readonly password: Password;
  readonly firstName: string;
  readonly lastName: string;
  readonly role: UserRole;
  readonly isActive: boolean;
  readonly avatarUrl: string | null;

  constructor(props: UserProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.email = props.email;
    this.password = props.password;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.role = props.role;
    this.isActive = props.isActive;
    this.avatarUrl = props.avatarUrl;
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  async validatePassword(plainPassword: string): Promise<boolean> {
    return this.password.compare(plainPassword);
  }
}
