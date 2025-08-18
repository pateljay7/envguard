# Environment Guardian

[![npm version](http# Install globally
npm install -g env-guardian

# Install as dev dependency
npm install --save-dev env-guardian

# Use without installing
npx env-guardian checke.fury.io/js/env-guardian.svg)](https://badge.fury.io/js/env-guardian)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive CLI + library tool to validate and manage environment variables in Node.js projects. Ensures that all `process.env` keys used in code are present in `.env` files, identifies unused variables, and helps maintain clean environment configuration.

## Features

✅ **Comprehensive Scanning**: Detects environment variable usage in multiple forms:
- `process.env.KEY_NAME`
- `process.env["KEY_NAME"]` 
- `process.env['KEY_NAME']`
- Dynamic usage detection (flagged as uncertain)

✅ **Multi-Environment Support**: Validate against multiple env files
- `.env.development`
- `.env.production` 
- `.env.test`
- Custom env files

✅ **Smart Validation**:
- Missing keys (used in code but not in env)
- Unused keys (in env but not used in code)
- Empty values (defined but empty)
- Duplicate keys detection
- Optional key handling

✅ **Multiple Output Formats**:
- Colorful table output (default)
- JSON format for CI/CD integration
- Minimal format for scripts

✅ **Powerful CLI Commands**:
- `check` - Validate environment variables
- `export` - Generate `.env.example` files
- `clean` - Remove unused keys from env files
- `diff` - Compare keys across env files

✅ **CI/CD Ready**: Proper exit codes and JSON output for automation

## Installation

```bash
# Install globally
npm install -g env-guardian

# Install as dev dependency
npm install --save-dev env-guardian

# Run without installing
npx env-guardian check
```

## Quick Start

1. **Check your environment variables:**
```bash
npx env-guardian check
```

2. **Generate a .env.example file:**
```bash
npx env-guardian export
```

3. **Compare environment files:**
```bash
npx env-guardian diff .env .env.production
```

## CLI Usage

### Check Command

Validate your environment variables against your codebase:

```bash
# Basic check
env-guardian check

# Check with specific env files
env-guardian check --env .env.development .env.production

# JSON output for CI/CD
env-guardian check --json

# Verbose output with file locations
env-guardian check --verbose

# Use custom config
env-guardian check --config my-config.json
```

**Exit Codes:**
- `0` - No issues found
- `1` - Missing environment variables detected  
- `2` - Other issues (parsing errors, etc.)

### Export Command

Generate `.env.example` files from your codebase:

```bash
# Generate .env.example
env-guardian export

# Custom output file
env-guardian export --output .env.template

# Include optional variables as comments
env-guardian export --include-optional
```

### Clean Command

Remove unused environment variables:

```bash
# Preview what would be removed
env-guardian clean --dry-run

# Remove unused keys (with confirmation)
env-guardian clean

# Force removal without confirmation
env-guardian clean --force
```

### Diff Command

Compare environment files:

```bash
# Compare two files
env-guardian diff .env .env.production

# JSON output
env-guardian diff .env .env.production --json
```

## Configuration

Create a `.envguardianrc.json` file in your project root:

```json
{
  "paths": ["src/**/*.{js,ts}", "lib/**/*.js"],
  "envFiles": [".env", ".env.development"],
  "allowOptional": ["DEBUG_MODE", "LOG_LEVEL"],
  "ignoreKeys": ["NODE_ENV", "NODE_OPTIONS"],
  "reportFormat": "table"
}
```

Or add to your `package.json`:

```json
{
  "env-guardian": {
    "paths": ["src/**/*.ts"],
    "envFiles": [".env"],
    "reportFormat": "json"
  }
}
```

### Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `paths` | Glob patterns for files to scan | `["src/**/*.{js,ts,mjs,cjs}"]` |
| `envFiles` | Environment files to validate against | `[".env"]` |
| `allowOptional` | Keys that are optional (won't error if missing) | `[]` |
| `ignoreKeys` | Keys to ignore completely | `["NODE_ENV"]` |
| `reportFormat` | Output format: `table`, `json`, `minimal` | `"table"` |
| `exitOnError` | Exit with error code on issues | `true` |

## Library Usage

Use as a Node.js library in your projects:

```javascript
import { EnvGuardian, checkEnvironment } from 'env-guardian';

// Quick check
const result = await checkEnvironment({
  paths: ['src/**/*.js'],
  envFiles: ['.env']
});

console.log(result.missing); // Array of missing keys
console.log(result.unused);  // Array of unused keys

// Advanced usage
const checker = new EnvGuardian({
  paths: ['src/**/*.ts'],
  envFiles: ['.env', '.env.production'],
  allowOptional: ['DEBUG_MODE']
});

const validationResult = await checker.check();
const report = await checker.generateReport({ format: 'json' });
const envExample = await checker.generateEnvExample();
```

## Example Output

### Table Format (Default)
```
Environment Variable Report
==========================

✓ 8 keys found in code
✓ 6 keys found in .env
❌ 3 total issues found

Missing Keys:
  ❌ SECRET_KEY
  ❌ REDIS_URL

Unused Keys:
  ⚠️ OLD_CONFIG_VALUE

Dynamic/Uncertain Keys:
  ? process.env[prefix + 'TOKEN']
```

### JSON Format
```json
{
  "missing": ["SECRET_KEY", "REDIS_URL"],
  "unused": ["OLD_CONFIG_VALUE"], 
  "empty": [],
  "duplicates": [],
  "uncertain": ["process.env[prefix + 'TOKEN']"],
  "summary": {
    "keysInCode": 8,
    "keysInEnv": 6,
    "totalIssues": 3
  }
}
```

## Integration Examples

### GitHub Actions

```yaml
name: Environment Check
on: [push, pull_request]

jobs:
  env-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx env-guardian check --json
```

### Pre-commit Hook

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "env-guardian check"
    }
  }
}
```

### Package.json Script

```json
{
  "scripts": {
    "env:check": "env-guardian check",
    "env:generate": "env-guardian export",
    "env:clean": "env-guardian clean --dry-run"
  }
}
```

## Advanced Features

### Optional Variables

Mark variables as optional in your config:

```json
{
  "allowOptional": ["DEBUG_MODE", "LOG_LEVEL"]
}
```

Or use fallback patterns in code (automatically detected):

```javascript
const debugMode = process.env.DEBUG_MODE || 'false';
const logLevel = process.env.LOG_LEVEL ?? 'info';
```

### Dynamic Variable Detection

The tool detects dynamic environment variable access:

```javascript
// This will be flagged as uncertain
const prefix = 'API_';
const token = process.env[prefix + 'TOKEN'];
```

### Multiple Environment Support

```bash
# Check against multiple environments
env-guardian check --env .env .env.development .env.production

# Compare environments
env-guardian diff .env.development .env.production
```

## Best Practices

1. **Run in CI/CD**: Add environment validation to your build pipeline
2. **Use .env.example**: Generate and maintain example files for new developers
3. **Regular cleanup**: Periodically run `clean` command to remove unused variables
4. **Document optional vars**: Use `allowOptional` config for truly optional variables
5. **Environment parity**: Use `diff` command to ensure consistency across environments

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

Made with ❤️ for Node.js developers who care about clean environment configuration.
