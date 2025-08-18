# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
