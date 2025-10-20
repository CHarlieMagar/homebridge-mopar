# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.9.10] - 2025-10-20

### Fixed
- **Session refresh reliability improvements**
  - Fixed 403 "Unauthorized Access" errors during scheduled session refresh
  - Added 2-second delay after setting cookies to allow Mopar backend session to propagate
  - Fixed silent failure in `getProfile()` - now properly detects and throws errors on failed responses
  - Profile endpoint now correctly validates error responses (status: "failed", errorCode: "403")
  - Improved error handling in `initialize()` - errors are now properly logged and re-thrown

### Technical Details
- Session refresh was setting cookies and immediately calling APIs before backend was ready
- CSRF token endpoint was succeeding but profile endpoint was rejecting with 403
- Added same 2-second propagation delay that initial Puppeteer login uses
- Now both 50-minute session refresh and 20-hour cookie refresh wait for backend

## [0.9.9] - 2025-10-20

### Improved
- **Proactive session refresh** every 50 minutes
  - Prevents HTTP 500 errors from expired session cookies
  - Sessions expire after ~1 hour, so refresh at 50 minutes
  - Commands now **always succeed immediately** (never wait for re-auth)
  - Background Puppeteer login runs automatically
  - Two refresh timers: 50 minutes (session) + 20 hours (cookies)

## [0.9.8] - 2025-10-20

### Fixed
- **CRITICAL:** Commands failing with HTTP 500 after ~1 hour
  - Session cookies (JSESSIONID, etc.) expire after 1 hour
  - CSRF token refresh was not enough - need full re-authentication
  - Plugin now does fresh login on 500 errors (like 403/401 handling)
  - Commands automatically succeed on retry with fresh session
  - User experience: commands "just work" even with expired sessions

## [0.9.7] - 2025-10-20

### Improved
- Enhanced error logging for API failures (500, 400, 403 errors)
  - Now logs HTTP status code, URL, and response body
  - Helps diagnose Mopar API issues (500 errors, rate limiting, etc.)
  - Request body logged in debug mode for troubleshooting 400 errors

## [0.9.4] - 2025-10-17

### Fixed
- Missing success/failure logging for engine start/stop, horn, and climate commands
- Users can now see if commands actually worked
- Matches lock/unlock behavior which already had proper logging

## [0.9.3] - 2025-10-17

### Fixed
- **CRITICAL:** Commands failing after 16+ hours with 403/401/400 errors
  - Sessions can expire before 20-hour cookie refresh
  - Commands now automatically re-authenticate on session expiry
  - Retry once with fresh session
  - Users never notice - commands just work

## [0.9.2] - 2025-10-16

### Fixed
- Removed ConfiguredName warnings from Homebridge logs (7 warnings eliminated)
- Services still display with correct names, just cleaner logs

## [0.9.1] - 2025-10-16

### Added
- ESLint + Prettier for code quality
- Jest test suite (13 tests)
- Enhanced config UI with organized fieldsets
- Header and footer in config schema

### Changed
- Better npm keywords for discoverability

### Added
- Configurable debug logging (off by default for clean logs)
- Debug checkbox in plugin settings UI
- Verbose logging only when troubleshooting

### Fixed
- **CRITICAL:** Door sensors were not being configured (code existed but never called)
- **CRITICAL:** Background refresh used stale cookies and ran indefinitely (4+ hours!)
  - Now performs fresh Puppeteer login each attempt
  - Added 1-hour retry limit (12 attempts max)
  - Stops gracefully instead of running forever
- Cold start empty vehicle list issue by adding missing profile initialization call
- Background refresh now properly initializes backend session
- Vehicles now load successfully on first attempt (no more retries needed)

### Changed
- Branding from "Chrysler Uconnect" to "Mopar" in user-facing text
- Default platform name now "Mopar" (reflects multi-brand support)
- Log messages use "Mopar" prefix for consistency
- Platform alias remains "ChryslerUconnect" for technical compatibility

### Optimized
- Login flow ~35-50 seconds faster (60% improvement!)
  - Browser cleanup now async (saves 20-40 seconds!)
  - Reduced form submit wait: 1.5s → 500ms
  - Reduced POST navigation timeout: 15s → 3s  
  - Skipped failed regular click attempt
- Much cleaner logs by moving verbose details to debug mode
- Only essential information shown unless debug enabled
- **Total login time: ~30-45 seconds (was ~60-90 seconds)**

### Security
- Added HAR files to .gitignore and .npmignore
- Excluded test configs with potential personal data from npm package
- Excluded development files (.claude, BETA_RELEASE_SUMMARY, etc) from npm
- Final package clean and minimal (21.6 kB, 8 files)

## [0.9.0] - 2025-10-16

### ⚠️ Beta Release
- Tested on 2022 Chrysler Pacifica
- Expected to work with other Mopar vehicles, but needs community testing
- Feedback and testing reports welcome!

### Background
- Created to replace [homebridge-uconnect](https://github.com/gyahalom/homebridge-uconnect) which stopped working in 2024
- Original plugin's authentication method no longer compatible with Mopar's updated systems
- Last updated August 2022, no longer maintained

### Added
- Initial beta release of homebridge-mopar
- Lock/Unlock door controls
- Remote engine start/stop
- Horn & lights activation
- Climate control (72°F default)
- Battery status monitoring
- Door contact sensors (front left/right, rear left/right, trunk)
- Automated authentication with Puppeteer
- Auto-refresh of session cookies every 20 hours
- Fast startup with intelligent vehicle caching (~5 seconds)
- Background API refresh for cold start reliability
- Automatic cache updates when API becomes available
- Comprehensive error handling and logging
- Voice control through Siri
- Support for all Mopar brands (Chrysler, Dodge, Jeep, Ram, Fiat, Alfa Romeo)

### Technical
- Puppeteer-based automated login
- Cookie-based session management
- Axios with cookie jar support
- Configurable via Homebridge UI
- Config schema for easy setup
- Command debouncing (10 seconds) to prevent duplicates
- Status polling for command completion
- Vehicle data persistence across restarts

## [1.0.0] - TBD

### Requirements for 1.0.0
- Community testing reports from multiple vehicle models
- Confirmation of compatibility across different Mopar brands
- Bug fixes based on real-world usage

### Planned
- Configurable climate temperature
- Fuel level monitoring (if supported by API)
- Tire pressure monitoring (if supported by API)
- Location tracking (optional)
- Configurable refresh intervals

