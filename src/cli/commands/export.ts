import fs from 'fs';
import { EnvGuardian } from '../../index.js';
import { loadConfig } from '../../config.js';

interface ExportOptions {
  config?: string;
  output?: string;
  includeOptional?: boolean;
}

export async function exportCommand(options: ExportOptions): Promise<void> {
  try {
    // Load configuration
    const config = loadConfig(options.config);
    
    // Override with CLI options
    if (options.includeOptional) {
      config.includeOptional = true;
    }

    // Create checker instance
    const checker = new EnvGuardian(config);

    // Generate .env.example content
    const exampleContent = await checker.generateEnvExample();

    // Write to output file
    const outputPath = options.output || '.env.example';
    fs.writeFileSync(outputPath, exampleContent, 'utf-8');

    console.log(`✅ Generated ${outputPath}`);
    console.log(`📝 Copy this file to .env and fill in the values`);

  } catch (error) {
    console.error('Error generating .env.example:', error);
    process.exit(2);
  }
}
