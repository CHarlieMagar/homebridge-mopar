# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.9.x   | :white_check_mark: |
| < 0.9   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in homebridge-mopar, please report it responsibly:

### How to Report

1. **DO NOT** open a public GitHub issue for security vulnerabilities
2. **DO** contact the maintainer privately:
   - Open a [Security Advisory](https://github.com/frankea/homebridge-mopar/security/advisories/new) on GitHub
   - Or email: Create an issue requesting private contact

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)
- Your contact information (if you want credit)

### What to Expect

- **Acknowledgment:** Within 48 hours
- **Assessment:** Within 1 week
- **Fix:** Critical issues within 1 week, others ASAP
- **Disclosure:** After fix is released
- **Credit:** You'll be credited in CHANGELOG (if desired)

## Security Considerations

### Credentials

- Credentials are stored in Homebridge's config.json
- Handled by Homebridge's security mechanisms
- Never logged or transmitted except to Mopar.com
- No third-party services involved

### Authentication

- Uses Puppeteer to automate login to Mopar.com
- Cookies stored in memory only
- All communication over HTTPS
- No credential caching to disk

### Dependencies

This plugin uses well-maintained dependencies:
- `axios` - HTTP client
- `puppeteer` - Browser automation
- `tough-cookie` - Cookie handling
- `axios-cookiejar-support` - Cookie integration

We monitor dependencies for known vulnerabilities and update promptly.

### Best Practices

When using this plugin:

1. **Keep Homebridge updated** - Security patches
2. **Use strong passwords** - For your Mopar.com account
3. **Secure your Homebridge instance** - Follow Homebridge security guide
4. **Keep the plugin updated** - Install updates promptly
5. **Enable debug mode only when needed** - May log sensitive URLs

### Known Limitations

- Requires Chromium/Chrome (installed by Puppeteer)
- Runs headless browser for authentication
- Stores session cookies in memory

## Responsible Disclosure

We follow responsible disclosure practices:

1. Security issues are fixed privately
2. Fixes are tested and released
3. Public disclosure after fix is available
4. Credit given to reporters (if desired)

## Questions?

For security-related questions (not vulnerabilities), you can:
- Open a regular GitHub issue
- Ask in Homebridge Discord
- Check existing documentation

---

**Thank you for helping keep homebridge-mopar secure!** 🔒

