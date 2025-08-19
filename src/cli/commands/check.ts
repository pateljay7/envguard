import { EnvGuard } from '../../index.js';
import { loadConfig } from '../../config.js';
import { ExitCode } from '../../types.js';

interface CheckOptions {
  config?: string;
  env?: string[];
  json?: boolean;
  verbose?: boolean;
  colors?: boolean;
}

export async function checkCommand(options: CheckOptions): Promise<void> {
  try {
    // Load configuration
    const config = loadConfig(options.config);
    
    // Override with CLI options
    if (options.env) {
      config.envFiles = options.env;
    }

    // Create checker instance
    const checker = new EnvGuard(config);

    // Perform validation
    const result = await checker.check();

    // Generate report
    const reportOptions = {
      format: options.json ? 'json' as const : config.reportFormat,
      colors: options.colors !== false,
      verbose: options.verbose || false,
    };

    if (options.verbose) {
      const detailedReport = await checker.generateDetailedReport(reportOptions);
      console.log(detailedReport);
    } else {
      const report = await checker.generateReport(reportOptions);
      console.log(report);
    }

    // Exit with appropriate code
    const exitCode: ExitCode = result.summary.totalIssues > 0 ? 
      (result.missing.length > 0 ? 1 : 2) : 0;

    if (config.exitOnError && exitCode !== 0) {
      process.exit(exitCode);
    }

  } catch (error) {
    console.error('Error during environment check:', error);
    process.exit(2);
  }
}
