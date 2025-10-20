---
name: Bug Report
about: Report a bug or issue with the plugin
title: '[BUG] '
labels: bug
assignees: ''
---

## Describe the Bug

A clear and concise description of what the bug is.

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. Run command '...'
4. See error

## Expected Behavior

A clear and concise description of what you expected to happen.

## Actual Behavior

What actually happened instead.

## Environment

**Plugin Version:** (e.g., 0.9.6)
```bash
npm list -g homebridge-mopar
```

**Homebridge Version:** (e.g., 1.7.0)
```bash
homebridge --version
```

**Node.js Version:** (e.g., 20.0.0)
```bash
node --version
```

**Operating System:** (e.g., Ubuntu 22.04, macOS 14, Raspberry Pi OS)

**Vehicle:**
- Make: (e.g., Jeep)
- Model: (e.g., Wrangler)
- Year: (e.g., 2023)

## Configuration

```json
{
  "platform": "Mopar",
  "email": "***@***.com",
  "password": "******",
  "pin": "****",
  "debug": false
}
```

## Logs

Please include relevant logs from Homebridge. Enable debug mode for more details:

```json
{
  "debug": true
}
```

<details>
<summary>Click to expand logs</summary>

```
[Paste your logs here]
```

</details>

## Screenshots

If applicable, add screenshots to help explain your problem.

## Additional Context

Add any other context about the problem here (e.g., works fine on cellular but fails on WiFi, only happens at certain times, etc.).

## Checklist

- [ ] I have checked the [troubleshooting guide](../README.md#troubleshooting)
- [ ] I have searched for similar issues
- [ ] I am using the latest version of the plugin
- [ ] I have restarted Homebridge after configuration changes
- [ ] I have enabled debug mode and included logs
