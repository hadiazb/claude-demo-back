import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

export class Password {
  private readonly hashedValue: string;
  private static readonly SALT_ROUNDS = 10;
  private static readonly MIN_LENGTH = 8;

  private constructor(hashedValue: string) {
    this.hashedValue = hashedValue;
  }

  static async create(plainPassword: string): Promise<Password> {
    if (!plainPassword || plainPassword.length < Password.MIN_LENGTH) {
      throw new BadRequestException(
        `Password must be at least ${Password.MIN_LENGTH} characters long`,
      );
    }

    const hashedValue = await bcrypt.hash(plainPassword, Password.SALT_ROUNDS);
    return new Password(hashedValue);
  }

  static fromHash(hashedValue: string): Password {
    return new Password(hashedValue);
  }

  async compare(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.hashedValue);
  }

  getValue(): string {
    return this.hashedValue;
  }
}
