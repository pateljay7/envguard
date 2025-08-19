import fs from 'fs';
import { EnvGuard } from '../../index.js';
import { loadConfig } from '../../config.js';
import { parseEnvFile } from '../../core/parser.js';

interface CleanOptions {
  config?: string;
  env?: string[];
  dryRun?: boolean;
  force?: boolean;
}

export async function cleanCommand(options: CleanOptions): Promise<void> {
  try {
    // Load configuration
    const config = loadConfig(options.config);
    
    // Override with CLI options
    if (options.env) {
      config.envFiles = options.env;
    }

    // Create checker instance
    const checker = new EnvGuard(config);

    // Perform validation to find unused keys
    const result = await checker.check();

    if (result.unused.length === 0) {
      console.log('✅ No unused keys found in environment files.');
      return;
    }

    console.log(`Found ${result.unused.length} unused keys:`);
    for (const key of result.unused) {
      console.log(`  - ${key}`);
    }

    if (options.dryRun) {
      console.log('\n🔍 Dry run mode - no files will be modified.');
      return;
    }

    // Confirm removal unless forced
    if (!options.force) {
      // In a real CLI, you'd use readline or inquirer for user input
      // For now, we'll just log the action
      console.log('\n⚠️  Use --force to actually remove these keys.');
      console.log('💡 Use --dry-run to preview changes without modifying files.');
      return;
    }

    // Remove unused keys from each env file
    for (const envFile of config.envFiles) {
      if (!fs.existsSync(envFile)) {
        console.log(`⚠️  Skipping ${envFile} (file not found)`);
        continue;
      }

      const envData = parseEnvFile(envFile);
      let modified = false;
      let content = fs.readFileSync(envFile, 'utf-8');
      const lines = content.split('\n');

      for (const unusedKey of result.unused) {
        if (envData.keys.has(unusedKey)) {
          const envValue = envData.keys.get(unusedKey)!;
          // Remove the line containing this key
          const lineIndex = envValue.line - 1;
          if (lineIndex >= 0 && lineIndex < lines.length) {
            lines[lineIndex] = ''; // Empty the line
            modified = true;
          }
        }
      }

      if (modified) {
        // Remove empty lines and write back
        const cleanedContent = lines
          .filter(line => line.trim() !== '')
          .join('\n') + '\n';
        
        fs.writeFileSync(envFile, cleanedContent, 'utf-8');
        console.log(`✅ Cleaned ${envFile}`);
      }
    }

    console.log('\n🎉 Cleanup completed!');

  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(2);
  }
}
