import fs from 'fs';
import { EnvFile, EnvValue, ParseError } from '../types.js';

export function parseEnvFile(filePath: string): EnvFile {
  const result: EnvFile = {
    path: filePath,
    keys: new Map(),
    parseErrors: [],
  };

  if (!fs.existsSync(filePath)) {
    result.parseErrors.push({
      line: 0,
      message: `File not found: ${filePath}`,
    });
    return result;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Skip empty lines and comments
      if (!line.trim() || line.trim().startsWith('#')) {
        continue;
      }

      const equalIndex = line.indexOf('=');
      if (equalIndex === -1) {
        result.parseErrors.push({
          line: lineNumber,
          message: `Invalid format: missing '=' on line ${lineNumber}`,
        });
        continue;
      }

      const key = line.substring(0, equalIndex).trim();
      const value = line.substring(equalIndex + 1).trim();

      if (!key) {
        result.parseErrors.push({
          line: lineNumber,
          message: `Invalid format: empty key on line ${lineNumber}`,
        });
        continue;
      }

      // Check for duplicate keys
      if (result.keys.has(key)) {
        result.parseErrors.push({
          line: lineNumber,
          message: `Duplicate key '${key}' found on line ${lineNumber}`,
        });
      }

      // Handle quoted values
      const cleanValue = cleanQuotedValue(value);

      const envValue: EnvValue = {
        key,
        value: cleanValue,
        isEmpty: cleanValue === '',
        line: lineNumber,
      };

      result.keys.set(key, envValue);
    }
  } catch (error) {
    result.parseErrors.push({
      line: 0,
      message: `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }

  return result;
}

function cleanQuotedValue(value: string): string {
  const trimmed = value.trim();
  
  // Handle single quotes
  if (trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length >= 2) {
    return trimmed.slice(1, -1);
  }
  
  // Handle double quotes
  if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) {
    return trimmed.slice(1, -1);
  }
  
  return trimmed;
}

export function parseMultipleEnvFiles(filePaths: string[]): Map<string, EnvValue> {
  const combined = new Map<string, EnvValue>();
  
  for (const filePath of filePaths) {
    const envFile = parseEnvFile(filePath);
    
    // Merge keys, later files override earlier ones
    for (const [key, value] of envFile.keys) {
      combined.set(key, value);
    }
  }
  
  return combined;
}
