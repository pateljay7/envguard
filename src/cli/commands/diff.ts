import { parseEnvFile } from '../../core/parser.js';
import chalk from 'chalk';

interface DiffOptions {
  json?: boolean;
  colors?: boolean;
}

interface DiffResult {
  onlyInFirst: string[];
  onlyInSecond: string[];
  different: Array<{ key: string; value1: string; value2: string }>;
  common: string[];
}

export async function diffCommand(file1: string, file2: string, options: DiffOptions): Promise<void> {
  try {
    // Parse both files
    const env1 = parseEnvFile(file1);
    const env2 = parseEnvFile(file2);

    // Check for parsing errors
    if (env1.parseErrors.length > 0) {
      console.error(`Errors in ${file1}:`);
      for (const error of env1.parseErrors) {
        console.error(`  Line ${error.line}: ${error.message}`);
      }
    }

    if (env2.parseErrors.length > 0) {
      console.error(`Errors in ${file2}:`);
      for (const error of env2.parseErrors) {
        console.error(`  Line ${error.line}: ${error.message}`);
      }
    }

    // Perform diff
    const result = performDiff(env1.keys, env2.keys);

    // Output results
    if (options.json) {
      console.log(JSON.stringify({
        file1,
        file2,
        ...result,
      }, null, 2));
    } else {
      outputDiffTable(file1, file2, result, options.colors !== false);
    }

  } catch (error) {
    console.error('Error comparing files:', error);
    process.exit(2);
  }
}

function performDiff(
  keys1: Map<string, any>,
  keys2: Map<string, any>
): DiffResult {
  const result: DiffResult = {
    onlyInFirst: [],
    onlyInSecond: [],
    different: [],
    common: [],
  };

  const allKeys = new Set([...keys1.keys(), ...keys2.keys()]);

  for (const key of allKeys) {
    const has1 = keys1.has(key);
    const has2 = keys2.has(key);

    if (has1 && !has2) {
      result.onlyInFirst.push(key);
    } else if (!has1 && has2) {
      result.onlyInSecond.push(key);
    } else if (has1 && has2) {
      const value1 = keys1.get(key).value;
      const value2 = keys2.get(key).value;
      
      if (value1 !== value2) {
        result.different.push({ key, value1, value2 });
      } else {
        result.common.push(key);
      }
    }
  }

  // Sort arrays for consistent output
  result.onlyInFirst.sort();
  result.onlyInSecond.sort();
  result.different.sort((a, b) => a.key.localeCompare(b.key));
  result.common.sort();

  return result;
}

function outputDiffTable(file1: string, file2: string, result: DiffResult, useColors: boolean): void {
  console.log(`Comparing ${file1} and ${file2}`);
  console.log('='.repeat(50));
  console.log('');

  const red = useColors ? chalk.red : (s: string) => s;
  const green = useColors ? chalk.green : (s: string) => s;
  const yellow = useColors ? chalk.yellow : (s: string) => s;
  const blue = useColors ? chalk.blue : (s: string) => s;

  // Keys only in first file
  if (result.onlyInFirst.length > 0) {
    console.log(red('Keys only in ' + file1 + ':'));
    for (const key of result.onlyInFirst) {
      console.log(red(`  - ${key}`));
    }
    console.log('');
  }

  // Keys only in second file
  if (result.onlyInSecond.length > 0) {
    console.log(green('Keys only in ' + file2 + ':'));
    for (const key of result.onlyInSecond) {
      console.log(green(`  + ${key}`));
    }
    console.log('');
  }

  // Keys with different values
  if (result.different.length > 0) {
    console.log(yellow('Keys with different values:'));
    for (const diff of result.different) {
      console.log(yellow(`  ~ ${diff.key}`));
      console.log(`    ${file1}: "${diff.value1}"`);
      console.log(`    ${file2}: "${diff.value2}"`);
    }
    console.log('');
  }

  // Common keys
  if (result.common.length > 0) {
    console.log(blue(`Common keys (${result.common.length}):`));
    if (result.common.length <= 10) {
      for (const key of result.common) {
        console.log(blue(`  ✓ ${key}`));
      }
    } else {
      console.log(blue(`  ✓ ${result.common.slice(0, 5).join(', ')}, ... and ${result.common.length - 5} more`));
    }
    console.log('');
  }

  // Summary
  const totalIssues = result.onlyInFirst.length + result.onlyInSecond.length + result.different.length;
  if (totalIssues === 0) {
    console.log(green('✅ Files are identical'));
  } else {
    console.log(yellow(`⚠️  Found ${totalIssues} differences`));
  }
}
