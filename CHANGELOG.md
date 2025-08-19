# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-08-19

### Added
- **🎯 Schema-Based Validation System** - Complete type-safe environment variable validation
- **New CLI Commands**:
  - `envguard init` - Initialize environment schema with templates (basic/comprehensive)
  - `envguard validate` - Validate environment variables against JSON schema
  - `envguard generate` - Generate .env.example from schema with descriptions
- **Rich Schema Definition Support**:
  - Data types: `string`, `number`, `boolean`, `url`, `email`, `enum`, `json`
  - Validation constraints: `required`, `default`, `allowedValues`, `pattern`, `min/max`
  - Security features: `isSensitive` fields with automatic value masking
  - Self-documenting: `description` field for human-readable explanations
- **Advanced Validation Features**:
  - Type validation with automatic conversion (string → number, boolean, etc.)
  - Format validation (URL, email, regex patterns)
  - Enum validation with allowed values
  - Range validation (min/max for strings and numbers)
  - Missing required variable detection
  - Unused variable identification
- **Security-Aware Design**:
  - Automatic masking of sensitive values in all outputs (`********`)
  - Sensitive fields cannot have default values (security violation detection)
  - Pattern validation for API keys and secrets
  - Secure JSON output for CI/CD pipelines
- **Schema-Driven .env.example Generation**:
  - Generates with inline comments and descriptions
  - Shows validation constraints and allowed values
  - Handles sensitive fields appropriately (empty values)
  - Self-documenting with type and constraint information
- **Enhanced Programmatic API**:
  - `validateEnv(env, schema)` - Get typed and validated environment object
  - `generateExampleEnv(schema)` - Generate .env.example content from schema
  - `SchemaValidator` class for advanced validation workflows
  - `loadSchema()` utility for loading schemas from files
- **Multiple Schema Sources**:
  - `.envschema.json` file support
  - Custom schema file paths
  - Inline schema objects for programmatic usage
  - Package.json integration ready

### Enhanced
- **Improved CLI Experience**:
  - Rich colored output with detailed error descriptions
  - Verbose mode shows validation context and descriptions
  - JSON output format for automation and CI/CD
  - Progress indicators and helpful next-step suggestions
- **Better Error Reporting**:
  - Categorized validation errors (missing, type, format, enum)
  - Detailed issue descriptions with field context
  - Security warnings for sensitive field violations
  - Exit code 1 on validation failures for CI/CD integration
- **Updated Documentation**:
  - Comprehensive schema validation guide in README
  - API documentation with TypeScript examples
  - Security best practices section
  - Schema field reference table
  - Integration examples for different project types

### Features
- ✅ Production-ready schema validation system
- ✅ Type-safe environment variable handling
- ✅ Security-conscious sensitive value handling
- ✅ Comprehensive test coverage (39 tests)
- ✅ Full TypeScript support with type definitions
- ✅ CI/CD integration with JSON output and exit codes
- ✅ Self-documenting schema system
- ✅ Backward compatibility with existing features

## [1.0.0] - 2024-08-18

### Added
- Initial release of Universal Environment Checker
- CLI tool with `check`, `export`, `clean`, and `diff` commands
- Support for multiple environment variable detection patterns:
  - Direct access: `process.env.KEY_NAME`
  - Bracket notation: `process.env["KEY_NAME"]` and `process.env['KEY_NAME']`
  - Dynamic access detection (flagged as uncertain)
- Multi-environment file support (.env, .env.development, .env.production, etc.)
- Configuration file support (.envguardianrc.json and package.json)
- Multiple output formats: table, JSON, minimal
- Comprehensive validation features:
  - Missing keys detection
  - Unused keys detection
  - Empty values detection
  - Duplicate keys detection
  - Optional keys handling
- Library API for programmatic usage
- CI/CD integration with proper exit codes
- Verbose output with file locations and usage details
- .env.example generation
- Environment file comparison
- Unused key cleanup with dry-run mode

### Features
- ✅ Fast and reliable environment variable scanning
- ✅ TypeScript support with full type definitions
- ✅ Zero configuration setup with sensible defaults
- ✅ Configurable ignore lists and optional keys
- ✅ Cross-platform compatibility (Windows, macOS, Linux)
- ✅ Comprehensive test coverage
- ✅ Well-documented API and CLI

### Documentation
- Complete README with usage examples
- API documentation for library usage
- Configuration guide
- Integration examples for CI/CD
- Best practices guide
