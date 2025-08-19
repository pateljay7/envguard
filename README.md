# EnvGuard

[![npm version](https://badge.f```bash
# Install glob1. **Check your environment varia```bash
# Basic check
envguard check

# Check specific env files
envguard check --env .env.development .env.production

# JSON output for CI/CD
envguard check --json

# Verbose output with detailed information
envguard check --verbose

# Use custom config file
envguard check --config my-config.json
```npx envguard check
```

2. **Generate a .env.example file:**
```bash
npx envguard export
```

3. **Compare different env files:**
```bash
npx envguard diff .env .env.production
```ll -g envguard

# Install as dev dependency
npm install --save-dev envguard

# Use without installing
npx envguard check
```envguard.svg)](https://badge.fury.io/js/envguard)
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
npm install -g envguard

# Install as dev dependency
npm install --save-dev envguard

# Run without installing
npx envguard check
```

## Quick Start

1. **Check your environment variables:**
```bash
npx envguard check
```

2. **Generate a .env.example file:**
```bash
npx envguard export
```

3. **Compare environment files:**
```bash
npx envguard diff .env .env.production
```

## CLI Usage

### Check Command

Validate your environment variables against your codebase:

```bash
# Basic check
envguard check

# Check with specific env files
envguard check --env .env.development .env.production

# JSON output for CI/CD
envguard check --json

# Verbose output with file locations
envguard check --verbose

# Use custom config
envguard check --config my-config.json
```

**Exit Codes:**
- `0` - No issues found
- `1` - Missing environment variables detected  
- `2` - Other issues (parsing errors, etc.)

### Export Command

Generate `.env.example` files from your codebase:

```bash
# Generate .env.example
envguard export

# Custom output file
envguard export --output .env.template

# Include optional variables as comments
envguard export --include-optional
```

### Clean Command

Remove unused environment variables:

```bash
# Preview what would be removed
envguard clean --dry-run

# Remove unused keys (with confirmation)
envguard clean

# Force removal without confirmation
envguard clean --force
```

### Diff Command

Compare environment files:

```bash
# Compare two files
envguard diff .env .env.production

# JSON output
envguard diff .env .env.production --json
```

## Configuration

Create a `.envguardrc.json` file in your project root:

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
  "envguard": {
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
import { EnvGuard, checkEnvironment } from 'envguard';

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
      - run: npx envguard check --json
```

### Pre-commit Hook

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "envguard check"
    }
  }
}
```

### Package.json Script

```json
{
  "scripts": {
    "env:check": "envguard check",
    "env:generate": "envguard export",
    "env:clean": "envguard clean --dry-run"
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
envguard check --env .env .env.development .env.production

# Compare environments
envguard diff .env.development .env.production
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
