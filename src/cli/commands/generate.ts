import chalk from 'chalk';
import { SchemaValidator, loadSchema } from '../../core/schema-validator.js';
import { EnvSchema } from '../../types.js';
import * as fs from 'fs';

interface GenerateOptions {
  schema?: string;
  output?: string;
  force?: boolean;
}

export async function generateCommand(options: GenerateOptions): Promise<void> {
  try {
    // Load schema
    const schema: EnvSchema = loadSchema(options.schema);
    if (Object.keys(schema).length === 0) {
      console.error(chalk.red('❌ No schema found. Create a .envschema.json file or specify --schema path'));
      process.exit(1);
    }

    // Generate .env.example content
    const validator = new SchemaValidator(schema);
    const content = validator.generateEnvExample();

    const outputPath = options.output || '.env.example';

    // Check if file exists and we're not forcing
    if (fs.existsSync(outputPath) && !options.force) {
      console.error(chalk.yellow(`⚠️  File ${outputPath} already exists. Use --force to overwrite.`));
      process.exit(1);
    }

    // Write file
    fs.writeFileSync(outputPath, content);
    
    console.log(chalk.green(`✅ Generated ${outputPath} from schema`));
    console.log(chalk.gray(`   ${Object.keys(schema).length} environment variables defined`));

  } catch (error) {
    console.error(chalk.red('❌ Generation failed:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
