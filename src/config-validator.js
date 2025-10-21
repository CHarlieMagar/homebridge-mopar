/**
 * Configuration Validator
 * Validates plugin configuration with helpful error messages
 */

class ConfigValidator {
  /**
   * Validate the configuration
   * @param {object} config - Plugin configuration
   * @returns {object} { valid: boolean, errors: string[] }
   */
  static validate(config) {
    const errors = [];

    // Email validation
    if (!config.email) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(config.email)) {
      errors.push('Email format is invalid (must be a valid email address)');
    }

    // Password validation (based on Mopar.com requirements)
    if (!config.password) {
      errors.push('Password is required');
    } else {
      const password = config.password;

      // Length: 8-16 characters
      if (password.length < 8 || password.length > 16) {
        errors.push('Password must be 8-16 characters (Mopar requirement)');
      }

      // Must have uppercase
      if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least 1 uppercase letter (A-Z)');
      }

      // Must have lowercase
      if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least 1 lowercase letter (a-z)');
      }

      // Must have number
      if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least 1 number (0-9)');
      }

      // Must have special character from allowed set
      if (!/[@$!%*?&_-]/.test(password)) {
        errors.push('Password must contain at least 1 special character (@$!%*?&_-)');
      }

      // No character repeated more than twice
      if (/(.)\1{2,}/.test(password)) {
        errors.push('Password cannot have any character repeated more than twice (e.g. aaa, 111)');
      }

      // No more than two sequential characters
      if (this.hasSequentialCharacters(password)) {
        errors.push('Password cannot have more than two sequential characters (e.g. ABC, xyz, 123)');
      }
    }

    // PIN validation (optional field)
    if (config.pin && !/^\d{4}$/.test(config.pin)) {
      errors.push('PIN must be exactly 4 digits (e.g. "1234")');
    }

    // Debug mode validation (optional field)
    if (config.debug !== undefined && typeof config.debug !== 'boolean') {
      errors.push('Debug mode must be true or false');
    }

    // Platform name validation (optional field)
    if (config.name && typeof config.name !== 'string') {
      errors.push('Platform name must be a string');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Check if email format is valid
   * @param {string} email - Email address to validate
   * @returns {boolean} True if email format is valid
   */
  static isValidEmail(email) {
    // Basic email validation regex - checks for user@domain.tld format
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Check if password has more than two sequential characters
   * Sequential means: ABC, xyz, 123, etc. (or reverse: CBA, zyx, 321)
   * @param {string} password - Password to check
   * @returns {boolean} True if has sequential characters
   */
  static hasSequentialCharacters(password) {
    for (let i = 0; i < password.length - 2; i++) {
      const char1 = password.charCodeAt(i);
      const char2 = password.charCodeAt(i + 1);
      const char3 = password.charCodeAt(i + 2);

      // Check if three consecutive characters are sequential
      // e.g., ABC (65,66,67), xyz (120,121,122), 123 (49,50,51)
      if (char2 === char1 + 1 && char3 === char2 + 1) {
        return true; // Found sequential ascending (ABC, xyz, 123)
      }
      if (char2 === char1 - 1 && char3 === char2 - 1) {
        return true; // Found sequential descending (CBA, zyx, 321)
      }
    }
    return false;
  }

  /**
   * Log validation errors in a user-friendly format
   * @param {string[]} errors - Array of error messages
   * @param {object} log - Homebridge logger object
   */
  static logErrors(errors, log) {
    log.error('========================================');
    log.error('CONFIGURATION ERRORS');
    log.error('========================================');
    errors.forEach((error, index) => {
      log.error(`${index + 1}. ${error}`);
    });
    log.error('========================================');
    log.error('Please fix these errors in your config.json or Homebridge UI');
    log.error('Then restart Homebridge');
  }
}

module.exports = ConfigValidator;
