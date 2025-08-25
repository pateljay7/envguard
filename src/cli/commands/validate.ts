import chalk from 'chalk';
import { loadConfig } from '../../config.js';
import { parseEnvFile } from '../../core/parser.js';
import { SchemaValidator, loadSchema } from '../../core/schema-validator.js';
import { EnvSchema } from '../../types.js';

interface ValidateOptions {
  config?: string;
  schema?: string;
  env?: string;
  json?: boolean;
  verbose?: boolean;
  colors?: boolean;
}

export async function validateCommand(options: ValidateOptions): Promise<void> {
  try {
    const config = options.config ? await import(options.config).then(m => m.default) : loadConfig();
    
    // Load schema
    const schema: EnvSchema = loadSchema(options.schema);
    if (Object.keys(schema).length === 0) {
      console.error(chalk.red('❌ No schema found. Create a .envschema.json file or specify --schema path'));
      process.exit(1);
    }

    // Load environment file
    const envFile = options.env || '.env';
    const envParsed = parseEnvFile(envFile);
    
    // Convert to Record format for validation
    const envVars: Record<string, string | undefined> = {};
    envParsed.keys.forEach((envValue, key) => {
      envVars[key] = envValue.value;
    });

    // Validate
    const validator = new SchemaValidator(schema);
    const result = validator.validate(envVars);

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    // Display results
    const useColors = options.colors !== false;
    
    console.log(chalk.bold('\n📋 Schema Validation Report\n'));

    if (result.summary.totalIssues === 0) {
      console.log(chalk.green('✅ All environment variables are valid!'));
    } else {
      console.log(chalk.yellow(`⚠️  Found ${result.summary.totalIssues} issues:\n`));

      // Missing variables
      if (result.missing.length > 0) {
        console.log(chalk.red('Missing required variables:'));
        result.missing.forEach(key => {
          console.log(`  ${chalk.red('✗')} ${key}`);
        });
        console.log();
      }

      // Type errors
      if (result.invalidType.length > 0) {
        console.log(chalk.red('Type validation errors:'));
        result.invalidType.forEach(error => {
          console.log(`  ${chalk.red('✗')} ${error.key}: ${error.issue}`);
          if (options.verbose && error.description) {
            console.log(`    ${chalk.gray(error.description)}`);
          }
        });
        console.log();
      }

      // Format errors
      if (result.invalidFormat.length > 0) {
        console.log(chalk.red('Format validation errors:'));
        result.invalidFormat.forEach(error => {
          console.log(`  ${chalk.red('✗')} ${error.key}: ${error.issue}`);
          if (options.verbose && error.description) {
            console.log(`    ${chalk.gray(error.description)}`);
          }
        });
        console.log();
      }

      // Enum errors
      if (result.invalidEnum.length > 0) {
        console.log(chalk.red('Enum validation errors:'));
        result.invalidEnum.forEach(error => {
          console.log(`  ${chalk.red('✗')} ${error.key}: ${error.issue}`);
          if (options.verbose && error.description) {
            console.log(`    ${chalk.gray(error.description)}`);
          }
        });
        console.log();
      }

      // Sensitive defaults
      if (result.sensitiveDefaults.length > 0) {
        console.log(chalk.yellow('Security warnings:'));
        result.sensitiveDefaults.forEach(error => {
          console.log(`  ${chalk.yellow('⚠')} ${error.key}: ${error.issue}`);
        });
        console.log();
      }

      // Unused variables
      if (result.unused.length > 0) {
        console.log(chalk.yellow('Unused variables (not in schema):'));
        result.unused.forEach(key => {
          console.log(`  ${chalk.yellow('?')} ${key}`);
        });
        console.log();
      }
    }

    // Summary
    console.log(chalk.bold('Summary:'));
    console.log(`  Variables in schema: ${result.summary.keysInCode}`);
    console.log(`  Variables in env: ${result.summary.keysInEnv}`);
    console.log(`  Total issues: ${result.summary.totalIssues}`);

    if (result.summary.totalIssues > 0) {
      process.exit(1);
    }

  } catch (error) {
    console.error(chalk.red('❌ Validation failed:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
