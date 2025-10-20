/**
 * Tests for ConfigValidator
 */

const ConfigValidator = require('./config-validator');

describe('ConfigValidator', () => {
  describe('validate', () => {
    test('should pass with valid configuration', () => {
      const config = {
        email: 'test@example.com',
        password: 'password123',
        pin: '1234',
        debug: false,
      };

      const result = ConfigValidator.validate(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should pass with minimal valid configuration', () => {
      const config = {
        email: 'user@domain.com',
        password: 'validpass',
      };

      const result = ConfigValidator.validate(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should fail when email is missing', () => {
      const config = {
        password: 'password123',
      };

      const result = ConfigValidator.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Email is required');
    });

    test('should fail when password is missing', () => {
      const config = {
        email: 'test@example.com',
      };

      const result = ConfigValidator.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });

    test('should fail when both email and password are missing', () => {
      const config = {};

      const result = ConfigValidator.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Email is required');
      expect(result.errors).toContain('Password is required');
      expect(result.errors.length).toBe(2);
    });

    test('should fail when email format is invalid', () => {
      const config = {
        email: 'not-an-email',
        password: 'password123',
      };

      const result = ConfigValidator.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Email format is invalid (must be a valid email address)');
    });

    test('should fail when email is missing @ symbol', () => {
      const config = {
        email: 'testexample.com',
        password: 'password123',
      };

      const result = ConfigValidator.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Email format is invalid (must be a valid email address)');
    });

    test('should fail when password is too short', () => {
      const config = {
        email: 'test@example.com',
        password: 'short',
      };

      const result = ConfigValidator.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password seems too short (Mopar typically requires 8+ characters)');
    });

    test('should pass with 8-character password', () => {
      const config = {
        email: 'test@example.com',
        password: '12345678',
      };

      const result = ConfigValidator.validate(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should fail when PIN is not 4 digits', () => {
      const config = {
        email: 'test@example.com',
        password: 'password123',
        pin: '123',
      };

      const result = ConfigValidator.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('PIN must be exactly 4 digits (e.g. "1234")');
    });

    test('should fail when PIN is too long', () => {
      const config = {
        email: 'test@example.com',
        password: 'password123',
        pin: '12345',
      };

      const result = ConfigValidator.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('PIN must be exactly 4 digits (e.g. "1234")');
    });

    test('should fail when PIN contains non-digits', () => {
      const config = {
        email: 'test@example.com',
        password: 'password123',
        pin: '12ab',
      };

      const result = ConfigValidator.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('PIN must be exactly 4 digits (e.g. "1234")');
    });

    test('should pass when PIN is omitted', () => {
      const config = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = ConfigValidator.validate(config);

      expect(result.valid).toBe(true);
    });

    test('should pass with valid 4-digit PIN', () => {
      const config = {
        email: 'test@example.com',
        password: 'password123',
        pin: '9876',
      };

      const result = ConfigValidator.validate(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should fail when debug is not boolean', () => {
      const config = {
        email: 'test@example.com',
        password: 'password123',
        debug: 'true',
      };

      const result = ConfigValidator.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Debug mode must be true or false');
    });

    test('should pass when debug is boolean', () => {
      const config = {
        email: 'test@example.com',
        password: 'password123',
        debug: true,
      };

      const result = ConfigValidator.validate(config);

      expect(result.valid).toBe(true);
    });

    test('should fail with multiple validation errors', () => {
      const config = {
        email: 'invalid-email',
        password: 'short',
        pin: '123',
        debug: 'not-boolean',
      };

      const result = ConfigValidator.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(4);
      expect(result.errors).toContain('Email format is invalid (must be a valid email address)');
      expect(result.errors).toContain('Password seems too short (Mopar typically requires 8+ characters)');
      expect(result.errors).toContain('PIN must be exactly 4 digits (e.g. "1234")');
      expect(result.errors).toContain('Debug mode must be true or false');
    });
  });

  describe('isValidEmail', () => {
    test('should return true for valid email', () => {
      expect(ConfigValidator.isValidEmail('test@example.com')).toBe(true);
      expect(ConfigValidator.isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(ConfigValidator.isValidEmail('user+tag@example.com')).toBe(true);
    });

    test('should return false for invalid email', () => {
      expect(ConfigValidator.isValidEmail('not-an-email')).toBe(false);
      expect(ConfigValidator.isValidEmail('missing-at-sign.com')).toBe(false);
      expect(ConfigValidator.isValidEmail('@no-user.com')).toBe(false);
      expect(ConfigValidator.isValidEmail('no-domain@')).toBe(false);
      expect(ConfigValidator.isValidEmail('spaces in@email.com')).toBe(false);
    });
  });

  describe('logErrors', () => {
    test('should log errors in formatted output', () => {
      const mockLog = {
        error: jest.fn(),
      };

      const errors = ['Email is required', 'Password is too short'];

      ConfigValidator.logErrors(errors, mockLog);

      expect(mockLog.error).toHaveBeenCalledWith('========================================');
      expect(mockLog.error).toHaveBeenCalledWith('CONFIGURATION ERRORS');
      expect(mockLog.error).toHaveBeenCalledWith('1. Email is required');
      expect(mockLog.error).toHaveBeenCalledWith('2. Password is too short');
      expect(mockLog.error).toHaveBeenCalledWith('Please fix these errors in your config.json or Homebridge UI');
      expect(mockLog.error).toHaveBeenCalledWith('Then restart Homebridge');
    });

    test('should number errors correctly', () => {
      const mockLog = {
        error: jest.fn(),
      };

      const errors = ['Error 1', 'Error 2', 'Error 3'];

      ConfigValidator.logErrors(errors, mockLog);

      expect(mockLog.error).toHaveBeenCalledWith('1. Error 1');
      expect(mockLog.error).toHaveBeenCalledWith('2. Error 2');
      expect(mockLog.error).toHaveBeenCalledWith('3. Error 3');
    });
  });
});
