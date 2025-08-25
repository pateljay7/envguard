import chalk from 'chalk';
import * as fs from 'fs';
import { EnvSchema } from '../../types.js';

interface InitOptions {
  output?: string;
  force?: boolean;
  template?: 'basic' | 'comprehensive';
}

export async function initCommand(options: InitOptions): Promise<void> {
  try {
    const outputPath = options.output || '.envschema.json';
    
    // Check if file exists and we're not forcing
    if (fs.existsSync(outputPath) && !options.force) {
      console.error(chalk.yellow(`⚠️  File ${outputPath} already exists. Use --force to overwrite.`));
      process.exit(1);
    }

    const template = options.template || 'basic';
    
    let schema: EnvSchema;
    
    if (template === 'comprehensive') {
      schema = {
        NODE_ENV: {
          type: 'enum',
          description: 'Application environment',
          allowedValues: ['development', 'production', 'test'],
          default: 'development',
          required: true
        },
        PORT: {
          type: 'number',
          description: 'Server port number',
          min: 1,
          max: 65535,
          default: 3000,
          required: false
        },
        DATABASE_URL: {
          type: 'url',
          description: 'Database connection URL',
          isSensitive: true,
          required: true
        },
        JWT_SECRET: {
          type: 'string',
          description: 'Secret key for JWT token signing',
          min: 32,
          isSensitive: true,
          required: true
        },
        API_KEY: {
          type: 'string',
          description: 'External API key',
          pattern: '^[a-zA-Z0-9]{32}$',
          isSensitive: true,
          required: true
        },
        DEBUG: {
          type: 'boolean',
          description: 'Enable debug mode',
          default: false,
          required: false
        },
        REDIS_CONFIG: {
          type: 'json',
          description: 'Redis configuration object',
          required: false
        },
        ADMIN_EMAIL: {
          type: 'email',
          description: 'Administrator email address',
          required: true
        },
        MAX_CONNECTIONS: {
          type: 'number',
          description: 'Maximum number of database connections',
          min: 1,
          max: 100,
          default: 10,
          required: false
        },
        LOG_LEVEL: {
          type: 'enum',
          description: 'Logging level',
          allowedValues: ['error', 'warn', 'info', 'debug'],
          default: 'info',
          required: false
        }
      };
    } else {
      schema = {
        NODE_ENV: {
          type: 'enum',
          description: 'Application environment',
          allowedValues: ['development', 'production', 'test'],
          default: 'development',
          required: true
        },
        PORT: {
          type: 'number',
          description: 'Server port number',
          default: 3000,
          required: false
        },
        DATABASE_URL: {
          type: 'string',
          description: 'Database connection URL',
          isSensitive: true,
          required: true
        }
      };
    }

    // Write schema file
    const content = JSON.stringify(schema, null, 2);
    fs.writeFileSync(outputPath, content);
    
    console.log(chalk.green(`✅ Created ${outputPath} with ${template} template`));
    console.log(chalk.gray(`   ${Object.keys(schema).length} environment variables defined`));
    console.log();
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.gray('  1. Edit the schema to match your project needs'));
    console.log(chalk.gray('  2. Run'), chalk.white('envguard generate'), chalk.gray('to create .env.example'));
    console.log(chalk.gray('  3. Run'), chalk.white('envguard validate'), chalk.gray('to validate your .env file'));

  } catch (error) {
    console.error(chalk.red('❌ Initialization failed:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
