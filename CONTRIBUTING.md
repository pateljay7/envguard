# Contributing to Universal Environment Checker

Thank you for your interest in contributing to Universal Environment Checker! This document provides guidelines and information for contributors.

## Development Setup

1. **Clone the repository:**
```bash
git clone https://github.com/pateljay7/env-guardian.git
cd env-guardian
```

2. **Install dependencies:**
```bash
npm install
```

3. **Build the project:**
```bash
npm run build
```

4. **Run tests:**
```bash
npm test
```

5. **Test the CLI locally:**
```bash
npx env-guardian check
```

## Project Structure

```
env-guardian/
├── src/
│   ├── cli/
│   │   ├── index.ts          # CLI entry point
│   │   └── commands/         # CLI command implementations
│   ├── core/
│   │   ├── parser.ts         # .env file parsing
│   │   ├── scanner.ts        # Code scanning for env vars
│   │   ├── validator.ts      # Validation logic
│   │   └── reporter.ts       # Report generation
│   ├── types.ts              # TypeScript definitions
│   ├── config.ts             # Configuration handling
│   └── index.ts              # Library entry point
├── tests/                    # Test files
├── dist/                     # Built output
└── docs/                     # Documentation
```

## Development Workflow

1. **Create a feature branch:**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**
3. **Add tests for new functionality**
4. **Run the test suite:**
```bash
npm test
npm run lint
```

5. **Build and test the CLI:**
```bash
npm run build
npx env-guardian check
```

6. **Commit your changes:**
```bash
git commit -m "feat: add new feature"
```

7. **Push and create a Pull Request**

## Coding Standards

- **TypeScript**: All code should be written in TypeScript with proper types
- **ESLint**: Follow the configured ESLint rules
- **Prettier**: Code formatting is handled by Prettier
- **Naming**: Use descriptive names for functions, variables, and files
- **Comments**: Add JSDoc comments for public APIs

## Testing

- Write unit tests for all new functionality
- Use Jest as the testing framework
- Aim for high test coverage
- Test both success and error cases
- Include integration tests for CLI commands

Example test structure:
```typescript
describe('EnvScanner', () => {
  it('should detect direct env access', () => {
    // Test implementation
  });
  
  it('should handle parsing errors gracefully', () => {
    // Test implementation
  });
});
```

## Adding New Features

### CLI Commands

1. Create a new command file in `src/cli/commands/`
2. Implement the command function
3. Add the command to `src/cli/index.ts`
4. Update the README with usage examples
5. Add tests for the new command

### Core Functionality

1. Add new logic to appropriate core modules
2. Update TypeScript interfaces if needed
3. Write comprehensive tests
4. Update documentation

### Configuration Options

1. Update the `Config` interface in `src/types.ts`
2. Add default values in `src/config.ts`
3. Update configuration loading logic
4. Document the new option in README

## Pull Request Guidelines

### Before Submitting

- [ ] Tests pass locally
- [ ] Linting passes
- [ ] Build succeeds
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated (for notable changes)

### PR Description

Please include:
- **What**: Description of the changes
- **Why**: Reason for the changes
- **How**: Implementation approach
- **Testing**: How you tested the changes
- **Breaking Changes**: Any breaking changes (if applicable)

### Example PR Template

```markdown
## What
Brief description of what this PR does.

## Why
Explanation of why this change is needed.

## How
Description of the implementation approach.

## Testing
- [ ] Added unit tests
- [ ] Tested CLI commands manually
- [ ] Tested edge cases

## Breaking Changes
None / Description of breaking changes
```

## Issue Reporting

When reporting issues, please include:
- **Environment**: Node.js version, OS, package version
- **Steps to reproduce**: Clear steps to reproduce the issue
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Sample code**: Minimal code that reproduces the issue
- **Error messages**: Full error messages and stack traces

## Feature Requests

For feature requests, please:
- Check if the feature already exists
- Describe the use case clearly
- Explain why it would be beneficial
- Suggest possible implementation approaches

## Code of Conduct

### Our Pledge

We are committed to making participation in this project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project maintainers. All complaints will be reviewed and investigated promptly and fairly.

## Getting Help

- **Documentation**: Check the README and this contributing guide
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Email**: Contact maintainers directly for sensitive issues

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create a new git tag
4. Build and publish to npm
5. Create GitHub release with release notes

## Recognition

Contributors will be recognized in:
- README.md contributors section
- GitHub contributors page
- Release notes for significant contributions

Thank you for contributing to Universal Environment Checker! 🎉
