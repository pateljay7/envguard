# EnvGuard

[![npm version](https://badge.fury.io/js/envguard.svg)](https://badge.fury.io/js/envguard)
[![npm downloads](https://img.shields.io/npm/dm/envguard.svg)](https://www.npmjs.com/package/envguard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/github/actions/workflow/status/pateljay7/envguard/ci.yml)](https://github.com/pateljay7/envguard/actions)

> **Your environment variable bodyguard** – validate, clean, and sync env files with ease.

A comprehensive CLI + library tool that ensures all `process.env` keys used in your code are present in `.env` files, identifies unused variables, and helps maintain clean environment configuration across your Node.js projects.

## ✨ Features

🔍 **Smart Code Scanning** - Detects env usage in multiple formats: `process.env.KEY`, `process.env["KEY"]`, dynamic access  
� **Schema-Based Validation** - Type-safe env vars with JSON schemas, patterns, and sensitive value protection  
�🌍 **Multi-Environment Support** - Validate across `.env.dev`, `.env.prod`, and custom files  
🧹 **Intelligent Cleanup** - Remove unused variables with confirmation prompts  
📊 **Rich Output Formats** - Beautiful tables, JSON for CI/CD, minimal for scripts  
⚡ **Lightning Fast** - Scans large codebases in seconds with glob patterns  
🔄 **Environment Diff** - Compare and sync variables across different env files  
🛡️ **CI/CD Ready** - Proper exit codes and JSON output for automation  
🔒 **Security Aware** - Automatic masking of sensitive values in all outputs  
📦 **Zero Config** - Works out of the box, customize when needed

## 🚀 Quick Start

```bash
# Install
npm install -D envguard

# Traditional validation (code scanning)
npx envguard check

# Schema-based validation (recommended)
npx envguard init --template comprehensive
npx envguard validate

# Generate .env.example
npx envguard generate

# Compare environments  
npx envguard diff .env .env.production
```

## 📖 Real-World Example

**Next.js Project Setup:**

```bash
# 1. Install EnvGuard
npm install -D envguard

# 2. Check your Next.js app
npx envguard check --env .env.local .env.example

# 3. Generate updated .env.example
npx envguard export --output .env.example

# 4. Clean up unused variables
npx envguard clean --dry-run
```

**GitHub Actions Integration:**

```yaml
name: Env Check
on: [push, pull_request]
jobs:
  env-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npx envguard check --json --env .env.example
```

## 📋 Sample Output

```
🛡️  EnvGuard Report
==================

✅ 12 environment variables found in code
✅ 10 variables defined in .env
❌ 3 issues detected

📋 Missing Variables (used in code):
   API_SECRET_KEY      → src/auth/jwt.ts:12
   REDIS_URL          → src/cache/redis.ts:8

📋 Unused Variables (defined but not used):
   LEGACY_DB_HOST     → .env:15

🔍 Uncertain Usage (dynamic access):
   process.env[PREFIX + 'TOKEN']  → src/api/client.ts:25

💡 Run 'envguard export' to update .env.example
💡 Run 'envguard clean' to remove unused variables
```

## 🛠️ CLI Commands

### 🔍 Check Command

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

### 📤 Export Command

Generate `.env.example` files from your codebase:

```bash
# Generate .env.example
envguard export

# Custom output file
envguard export --output .env.template

# Include optional variables as comments
envguard export --include-optional
```

### 🧹 Clean Command

Remove unused environment variables:

```bash
# Preview what would be removed
envguard clean --dry-run

# Remove unused keys (with confirmation)
envguard clean

# Force removal without confirmation
envguard clean --force
```

### 🔄 Diff Command

Compare environment files:

```bash
# Compare two files
envguard diff .env .env.production

# JSON output
envguard diff .env .env.production --json
```

## 🎯 Schema-Based Validation

EnvGuard supports comprehensive schema-based validation to ensure your environment variables meet specific requirements and types.

### 📋 Schema Definition

Create a `.envschema.json` file to define validation rules:

```json
{
  "NODE_ENV": {
    "type": "enum",
    "description": "Application environment",
    "allowedValues": ["development", "production", "test"],
    "default": "development",
    "required": true
  },
  "PORT": {
    "type": "number",
    "description": "Server port number",
    "min": 1,
    "max": 65535,
    "default": 3000,
    "required": false
  },
  "DATABASE_URL": {
    "type": "url", 
    "description": "Database connection URL",
    "isSensitive": true,
    "required": true
  },
  "API_KEY": {
    "type": "string",
    "description": "External API key", 
    "pattern": "^[a-zA-Z0-9]{32}$",
    "isSensitive": true,
    "required": true
  },
  "DEBUG": {
    "type": "boolean",
    "description": "Enable debug logging",
    "default": false,
    "required": false
  }
}
```

### 🏗️ Schema Field Types

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Data type: `string`, `number`, `boolean`, `url`, `email`, `enum`, `json` |
| `required` | boolean | Whether the variable must exist (default: `true`) |
| `default` | any | Fallback value if not provided (optional) |
| `allowedValues` | array | Restrict value to a set of choices (for enums) |
| `pattern` | regex | Regex pattern constraint (for strings) |
| `min` / `max` | number | Min/max length (string) or value (number) |
| `isSensitive` | boolean | If true, value is masked in reports and cannot have defaults |
| `description` | string | Human-readable explanation |

### 🛠️ Schema Commands

```bash
# Initialize a new schema
envguard init --template comprehensive

# Validate env against schema
envguard validate --env .env

# Generate .env.example from schema  
envguard generate --output .env.example

# Custom schema file
envguard validate --schema custom-schema.json
```

### 📊 Schema Validation Output

```bash
📋 Schema Validation Report

⚠️  Found 3 issues:

Missing required variables:
  ✗ DATABASE_URL
  ✗ API_KEY

Type validation errors:
  ✗ PORT: Invalid number format
    Server port number
  ✗ DEBUG: Invalid boolean format
    Enable debug logging

Enum validation errors:
  ✗ NODE_ENV: Not in allowed values: development, production, test
    Application environment

Summary:
  Variables in schema: 5
  Variables in env: 3  
  Total issues: 3
```

### 🔒 Security Features

- **Sensitive values** are automatically masked in all outputs (`********`)
- **Sensitive fields** cannot have default values (must be explicitly provided)
- **Pattern validation** ensures API keys match expected formats
- **JSON output** maintains masking for CI/CD security

## ⚙️ Configuration

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

## 🥊 Comparison with Alternatives

| Feature | EnvGuard | envalid | dotenv-expand | env-cmd |
|---------|----------|---------|---------------|---------|
| 🔍 Code scanning | ✅ | ❌ | ❌ | ❌ |
| 🧹 Cleanup unused vars | ✅ | ❌ | ❌ | ❌ |
| 🔄 Environment diff | ✅ | ❌ | ❌ | ❌ |
| 📤 Generate .env.example | ✅ | ❌ | ❌ | ❌ |
| 🌍 Multi-env support | ✅ | ✅ | ✅ | ✅ |
| 📊 JSON output for CI | ✅ | ❌ | ❌ | ❌ |
| 🎯 TypeScript support | ✅ | ✅ | ✅ | ✅ |
| ⚡ Zero runtime overhead | ✅ | ❌ | ❌ | ❌ |

## 📚 Library Usage

Use EnvGuard programmatically in your Node.js applications:

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
const checker = new EnvGuard({
  paths: ['src/**/*.ts'],
  envFiles: ['.env', '.env.production'],
  allowOptional: ['DEBUG_MODE']
});

const validationResult = await checker.check();
const report = await checker.generateReport({ format: 'json' });
const envExample = await checker.generateEnvExample();
```

### 🎯 Schema Validation API

```javascript
import { validateEnv, generateExampleEnv, SchemaValidator } from 'envguard';

// Define your schema
const schema = {
  NODE_ENV: {
    type: 'enum',
    allowedValues: ['development', 'production', 'test'],
    default: 'development'
  },
  PORT: {
    type: 'number',
    min: 1,
    max: 65535,
    default: 3000
  },
  API_KEY: {
    type: 'string',
    pattern: '^[a-zA-Z0-9]{32}$',
    isSensitive: true,
    required: true
  }
};

// Validate and get typed environment
const env = validateEnv(process.env, schema);
console.log(env.PORT); // number type, with default applied

// Generate .env.example
const exampleContent = generateExampleEnv(schema);
console.log(exampleContent);

// Advanced validation with detailed results  
const validator = new SchemaValidator(schema);
const result = validator.validate(process.env);

if (result.summary.totalIssues > 0) {
  console.log('Missing:', result.missing);
  console.log('Type errors:', result.invalidType);
  console.log('Format errors:', result.invalidFormat);
  process.exit(1);
}

const typedEnv = validator.getValidatedEnv(process.env);
```

## 📊 Example Output

### 🎨 Table Format (Default)
```
🛡️  EnvGuard Report
==================

✅ 8 environment variables found in code
✅ 6 variables defined in .env  
❌ 3 issues detected

📋 Missing Variables:
   ❌ SECRET_KEY      → src/auth/jwt.ts:12
   ❌ REDIS_URL       → src/cache/redis.ts:8

📋 Unused Variables:
   ⚠️ OLD_CONFIG_VALUE → .env:15

🔍 Dynamic/Uncertain:
   ? process.env[prefix + 'TOKEN'] → src/api/client.ts:25

💡 Run 'envguard export' to update .env.example
💡 Run 'envguard clean' to remove unused variables
```

### 📄 JSON Format (CI/CD)
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
    "totalIssues": 3,
    "hasErrors": true
  }
}
```

## 🔗 Integration Examples

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
      - name: Validate environment variables
        run: npx envguard check --json
```

### Pre-commit Hook (Husky)

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "envguard check --env .env.example"
    }
  }
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "env:check": "envguard check",
    "env:example": "envguard export",
    "env:clean": "envguard clean --dry-run",
    "env:diff": "envguard diff .env.example .env.production"
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

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 📚 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

---

<div align="center">

**Made with ❤️ for developers who care about clean environment configuration**

[⭐ Star on GitHub](https://github.com/pateljay7/envguard) • [📦 View on npm](https://www.npmjs.com/package/envguard) • [🐛 Report Issues](https://github.com/pateljay7/envguard/issues)

</div>
