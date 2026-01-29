import { BadRequestException } from '@nestjs/common';
import { Email } from '@users/domain/value-objects/email.vo';

describe('Email Value Object', () => {
  describe('constructor', () => {
    it('should create a valid email', () => {
      const email = new Email('test@example.com');

      expect(email).toBeInstanceOf(Email);
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should normalize email to lowercase', () => {
      const email = new Email('TEST@EXAMPLE.COM');

      expect(email.getValue()).toBe('test@example.com');
    });

    it('should reject email with leading whitespace', () => {
      expect(() => new Email('  test@example.com')).toThrow(
        BadRequestException,
      );
    });

    it('should reject email with trailing whitespace', () => {
      expect(() => new Email('test@example.com  ')).toThrow(
        BadRequestException,
      );
    });

    describe('invalid emails', () => {
      const invalidEmails = [
        { value: '', description: 'empty string' },
        { value: 'invalid', description: 'no @ symbol' },
        { value: 'invalid@', description: 'no domain' },
        { value: '@example.com', description: 'no local part' },
        { value: 'invalid@.com', description: 'no domain name' },
        { value: 'invalid@com', description: 'no domain extension' },
        { value: 'invalid @example.com', description: 'space in local part' },
        { value: 'invalid@ example.com', description: 'space in domain' },
        {
          value: 'invalid@example .com',
          description: 'space before extension',
        },
      ];

      it.each(invalidEmails)(
        'should throw BadRequestException for $description: "$value"',
        ({ value }) => {
          expect(() => new Email(value)).toThrow(BadRequestException);
          expect(() => new Email(value)).toThrow('Invalid email format');
        },
      );
    });
  });

  describe('getValue', () => {
    it('should return the normalized email value', () => {
      const email = new Email('User@Example.COM');

      expect(email.getValue()).toBe('user@example.com');
    });
  });

  describe('equals', () => {
    it('should return true for emails with same value', () => {
      const email1 = new Email('test@example.com');
      const email2 = new Email('test@example.com');

      expect(email1.equals(email2)).toBe(true);
    });

    it('should return true for emails with different case (normalized)', () => {
      const email1 = new Email('test@example.com');
      const email2 = new Email('TEST@EXAMPLE.COM');

      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      const email1 = new Email('test1@example.com');
      const email2 = new Email('test2@example.com');

      expect(email1.equals(email2)).toBe(false);
    });
  });
});
