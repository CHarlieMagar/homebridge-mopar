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

    // Password validation
    if (!config.password) {
      errors.push('Password is required');
    } else if (config.password.length < 8) {
      errors.push('Password seems too short (Mopar typically requires 8+ characters)');
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
