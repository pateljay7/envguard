export * from './types.js';
export * from './config.js';
export * from './core/parser.js';
export * from './core/scanner.js';
export * from './core/validator.js';
export * from './core/reporter.js';

import { loadConfig } from './config.js';
import { parseMultipleEnvFiles } from './core/parser.js';
import { scanCodeForEnvUsage } from './core/scanner.js';
import { validateEnvironment, getMissingKeyDetails, getUnusedKeyDetails } from './core/validator.js';
import { generateReport, generateEnvExample, generateDetailedReport } from './core/reporter.js';
import { Config, ValidationResult, ReportOptions } from './types.js';

export class EnvGuard {
  private config: Config;

  constructor(config?: Partial<Config>) {
    this.config = config ? { ...loadConfig(), ...config } : loadConfig();
  }

  async check(): Promise<ValidationResult> {
    // Scan code for environment variable usage
    const codeKeys = await scanCodeForEnvUsage(this.config.paths);

    // Parse environment files
    const envKeys = parseMultipleEnvFiles(this.config.envFiles);

    // Validate environment
    const result = validateEnvironment(codeKeys, envKeys, this.config);

    return result;
  }

  async generateReport(options?: Partial<ReportOptions>): Promise<string> {
    const result = await this.check();
    const reportOptions: ReportOptions = {
      format: this.config.reportFormat,
      colors: true,
      verbose: false,
      ...options,
    };

    return generateReport(result, reportOptions);
  }

  async generateDetailedReport(options?: Partial<ReportOptions>): Promise<string> {
    const result = await this.check();
    const codeKeys = await scanCodeForEnvUsage(this.config.paths);
    const envKeys = parseMultipleEnvFiles(this.config.envFiles);

    const missingDetails = getMissingKeyDetails(codeKeys, result.missing);
    const unusedDetails = getUnusedKeyDetails(envKeys, result.unused);

    const reportOptions: ReportOptions = {
      format: this.config.reportFormat,
      colors: true,
      verbose: false,
      ...options,
    };

    return generateDetailedReport(result, missingDetails, unusedDetails, reportOptions.colors);
  }

  async generateEnvExample(): Promise<string> {
    const codeKeys = await scanCodeForEnvUsage(this.config.paths);
    return generateEnvExample(codeKeys);
  }

  getConfig(): Config {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<Config>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Convenience functions for direct usage
export async function checkEnvironment(config?: Partial<Config>): Promise<ValidationResult> {
  const checker = new EnvGuard(config);
  return checker.check();
}

export async function generateEnvReport(
  config?: Partial<Config>,
  options?: Partial<ReportOptions>
): Promise<string> {
  const checker = new EnvGuard(config);
  return checker.generateReport(options);
}
