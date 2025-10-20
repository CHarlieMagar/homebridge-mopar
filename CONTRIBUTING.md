# Contributing to homebridge-mopar

Thank you for your interest in contributing to homebridge-mopar! This document provides guidelines for contributing to the project.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue using the Bug Report template and include:

- Your vehicle year, make, and model
- Plugin version
- Homebridge version
- Node.js version
- Detailed steps to reproduce
- Relevant log output (enable debug logging if needed)
- Expected vs. actual behavior

### Reporting Vehicle Compatibility

Use the Vehicle Compatibility Report template to share your testing results:

- Whether the plugin works with your vehicle
- Which features work/don't work
- Any error messages or quirks
- Your vehicle details

This helps build confidence for other users and move toward v1.0.0!

### Suggesting Features

Use the Feature Request template to propose enhancements:

- Describe the feature and use case
- Explain why it would be valuable
- Provide examples if possible

### Contributing Code

1. **Fork the repository**
2. **Create a feature branch** from `latest`
   ```bash
   git checkout -b feature/my-new-feature
   ```
3. **Make your changes**
   - Follow existing code style
   - Add comments for complex logic
   - Use `this.log`, `this.debug`, etc. (not `console.log`)
4. **Test thoroughly**
   - Test on real hardware if possible
   - Ensure no errors in logs
   - Verify all existing features still work
5. **Commit with clear message**
   ```bash
   git commit -m "Add feature: description"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/my-new-feature
   ```
7. **Open a Pull Request**
   - Use the PR template
   - Describe what changed and why
   - Reference any related issues

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/homebridge-mopar.git
cd homebridge-mopar

# Install dependencies
npm install

# Link for development
npm link

# Link in Homebridge
cd /var/lib/homebridge/node_modules  
npm link homebridge-mopar

# Restart Homebridge
sudo hb-service restart

# Watch logs
sudo hb-service logs
```

## Code Style Guidelines

- Use modern JavaScript (async/await, not callbacks)
- Proper error handling (try/catch blocks)
- Use `this.log()`, `this.debug()`, `this.log.error()`, `this.log.warn()`
- Never use `console.log()`
- Add comments for non-obvious logic
- Keep functions focused and readable
- Follow existing patterns in the codebase

## Testing

### Automated Tests

Run the test suite before submitting:

```bash
npm test
```

This runs Jest unit tests for:
- Authentication logic
- API communication
- Platform/accessory setup
- Command execution
- Error handling

### Manual Testing

For changes affecting vehicle communication:

1. Test on real hardware with your vehicle
2. Test all affected features
3. Check for errors in Homebridge logs
4. Verify accessories appear correctly in HomeKit
5. Test voice control commands
6. Document your testing in the PR

## Areas Where Help is Needed

- **Vehicle Testing:** Test on different Mopar brands and models
- **Feature Enhancements:** Configurable climate temp, real-time door status
- **Bug Fixes:** Edge cases, error handling improvements
- **Documentation:** Improve README, add more examples
- **Performance:** Further optimization opportunities

## Questions?

- Open a GitHub Discussion
- Ask in the Homebridge Discord
- Comment on relevant issues

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for helping make homebridge-mopar better for everyone!** 🚗🏠

