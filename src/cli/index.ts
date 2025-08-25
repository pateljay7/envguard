import { Command } from 'commander';
import { checkCommand } from './commands/check.js';
import { exportCommand } from './commands/export.js';
import { cleanCommand } from './commands/clean.js';
import { diffCommand } from './commands/diff.js';
import { validateCommand } from './commands/validate.js';
import { generateCommand } from './commands/generate.js';
import { initCommand } from './commands/init.js';

const program = new Command();

program
  .name('envguard')
  .description('EnvGuard - Validate and manage environment variables in Node.js projects')
  .version('1.1.0');

// Check command
program
  .command('check')
  .description('Validate .env against code usage')
  .option('--config <path>', 'Path to config file')
  .option('--env <files...>', 'Specify env files to check')
  .option('--json', 'Output in JSON format')
  .option('--verbose', 'Show detailed output')
  .option('--no-colors', 'Disable colored output')
  .action(checkCommand);

// Export command
program
  .command('export')
  .description('Generate .env.example file')
  .option('--config <path>', 'Path to config file')
  .option('--output <path>', 'Output file path', '.env.example')
  .option('--include-optional', 'Include optional keys')
  .action(exportCommand);

// Clean command
program
  .command('clean')
  .description('Remove unused keys from .env files')
  .option('--config <path>', 'Path to config file')
  .option('--env <files...>', 'Specify env files to clean')
  .option('--dry-run', 'Show what would be removed without actually removing')
  .option('--force', 'Skip confirmation prompts')
  .action(cleanCommand);

// Diff command
program
  .command('diff <file1> <file2>')
  .description('Compare keys across env files')
  .option('--json', 'Output in JSON format')
  .option('--no-colors', 'Disable colored output')
  .action(diffCommand);

// Schema validation commands
program
  .command('init')
  .description('Initialize a new environment schema file')
  .option('--output <path>', 'Output schema file path', '.envschema.json')
  .option('--template <type>', 'Template type (basic|comprehensive)', 'basic')
  .option('--force', 'Overwrite existing file')
  .action(initCommand);

program
  .command('validate')
  .description('Validate environment variables against schema')
  .option('--config <path>', 'Path to config file')
  .option('--schema <path>', 'Path to schema file')
  .option('--env <path>', 'Path to env file to validate', '.env')
  .option('--json', 'Output in JSON format')
  .option('--verbose', 'Show detailed output')
  .option('--no-colors', 'Disable colored output')
  .action(validateCommand);

program
  .command('generate')
  .description('Generate .env.example from schema')
  .option('--schema <path>', 'Path to schema file')
  .option('--output <path>', 'Output file path', '.env.example')
  .option('--force', 'Overwrite existing file')
  .action(generateCommand);

// Parse arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(0);
}
