import { BadRequestException } from '@nestjs/common';
import { Password } from '@users/domain/value-objects/password.vo';

describe('Password Value Object', () => {
  const validPassword = 'ValidPass123!';

  describe('create', () => {
    it('should create a valid password', async () => {
      const password = await Password.create(validPassword);

      expect(password).toBeInstanceOf(Password);
      expect(password.getValue()).toBeDefined();
      expect(password.getValue()).not.toBe(validPassword); // Should be hashed
    });

    it('should hash the password with bcrypt', async () => {
      const password = await Password.create(validPassword);
      const hashedValue = password.getValue();

      // Bcrypt hashes start with $2b$ or $2a$
      expect(hashedValue).toMatch(/^\$2[ab]\$/);
    });

    it('should create different hashes for same password', async () => {
      const password1 = await Password.create(validPassword);
      const password2 = await Password.create(validPassword);

      expect(password1.getValue()).not.toBe(password2.getValue());
    });

    describe('validation errors', () => {
      it('should throw when password is empty', async () => {
        await expect(Password.create('')).rejects.toThrow(BadRequestException);
      });

      it('should throw when password is too short', async () => {
        await expect(Password.create('Short1!')).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should throw when password has no uppercase letter', async () => {
        await expect(Password.create('lowercase123!')).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should throw when password has no lowercase letter', async () => {
        await expect(Password.create('UPPERCASE123!')).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should throw when password has no number', async () => {
        await expect(Password.create('NoNumbers!!')).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should throw when password has no special character', async () => {
        await expect(Password.create('NoSpecial123')).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should include all validation errors in exception', async () => {
        try {
          await Password.create('short');
          fail('Should have thrown an exception');
        } catch (error) {
          expect(error).toBeInstanceOf(BadRequestException);
          const response = (error as BadRequestException).getResponse();
          expect(response).toHaveProperty('message');
          const messages = (response as { message: string[] }).message;
          expect(messages).toContain(
            'Password must be at least 8 characters long',
          );
          expect(messages).toContain(
            'Password must contain at least one uppercase letter',
          );
          expect(messages).toContain(
            'Password must contain at least one number',
          );
          expect(messages).toContain(
            'Password must contain at least one special character (!@#$%^&*()_+-=[]{};\\\':"|,.<>/?)',
          );
        }
      });
    });

    describe('valid password variations', () => {
      const validPasswords = [
        'ValidPass123!',
        'Another$ecure1',
        'Test@Password99',
        'C0mplex!Pass',
        'MyP@ssw0rd!!',
        '12345678Aa!',
        'Abcdefg1!',
      ];

      it.each(validPasswords)(
        'should accept valid password: %s',
        async (pwd) => {
          const password = await Password.create(pwd);
          expect(password).toBeInstanceOf(Password);
        },
      );
    });
  });

  describe('fromHash', () => {
    it('should create a Password instance from hashed value', () => {
      const hashedValue =
        '$2b$10$abcdefghijklmnopqrstuuxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
      const password = Password.fromHash(hashedValue);

      expect(password).toBeInstanceOf(Password);
      expect(password.getValue()).toBe(hashedValue);
    });

    it('should not validate when creating from hash', () => {
      const invalidHash = 'not-a-valid-hash';
      const password = Password.fromHash(invalidHash);

      expect(password.getValue()).toBe(invalidHash);
    });
  });

  describe('compare', () => {
    it('should return true for matching password', async () => {
      const password = await Password.create(validPassword);

      const result = await password.compare(validPassword);

      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = await Password.create(validPassword);

      const result = await password.compare('WrongPassword123!');

      expect(result).toBe(false);
    });

    it('should return false for similar but different password', async () => {
      const password = await Password.create(validPassword);

      const result = await password.compare('ValidPass123?'); // Different special char

      expect(result).toBe(false);
    });

    it('should return false for password with different case', async () => {
      const password = await Password.create(validPassword);

      const result = await password.compare('validpass123!'); // All lowercase

      expect(result).toBe(false);
    });
  });

  describe('getValue', () => {
    it('should return the hashed password value', async () => {
      const password = await Password.create(validPassword);

      const value = password.getValue();

      expect(value).toBeDefined();
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    });
  });
});
