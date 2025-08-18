import fs from 'fs';
import { glob } from 'fast-glob';
import { EnvKey, EnvUsage } from '../types.js';

export async function scanCodeForEnvUsage(patterns: string[]): Promise<EnvKey[]> {
  const files = await glob(patterns, { absolute: true });
  const envKeys = new Map<string, EnvKey>();

  for (const file of files) {
    const usages = await scanFileForEnvUsage(file);
    
    for (const usage of usages) {
      const existing = envKeys.get(usage.name);
      if (existing) {
        existing.usage.push(...usage.usage);
      } else {
        envKeys.set(usage.name, usage);
      }
    }
  }

  return Array.from(envKeys.values());
}

export async function scanFileForEnvUsage(filePath: string): Promise<EnvKey[]> {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return extractEnvUsages(content, filePath);
  } catch (error) {
    console.warn(`Warning: Failed to read file ${filePath}:`, error);
    return [];
  }
}

function extractEnvUsages(content: string, filePath: string): EnvKey[] {
  const envKeys = new Map<string, EnvKey>();
  const lines = content.split('\n');

  // Regex patterns for different env usage forms
  const patterns = [
    // process.env.KEY_NAME
    /process\.env\.([A-Z_][A-Z0-9_]*)/g,
    // process.env["KEY_NAME"] or process.env['KEY_NAME']
    /process\.env\[['"]([A-Z_][A-Z0-9_]*)['"]\]/g,
  ];

  // Dynamic pattern detection
  const dynamicPattern = /process\.env\[/g;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const lineNumber = lineIndex + 1;

    // Check for dynamic usage first
    let dynamicMatch;
    while ((dynamicMatch = dynamicPattern.exec(line)) !== null) {
      const column = dynamicMatch.index + 1;
      const endBracket = line.indexOf(']', dynamicMatch.index);
      if (endBracket !== -1) {
        const fullExpression = line.substring(dynamicMatch.index, endBracket + 1);
        
        // Skip if it's a simple quoted string (already caught by other patterns)
        if (!/process\.env\[['"][A-Z_][A-Z0-9_]*['"]\]/.test(fullExpression)) {
          // This is a dynamic key
          const uncertainKey = 'DYNAMIC_KEY_' + lineNumber;
          addEnvUsage(envKeys, uncertainKey, {
            file: filePath,
            line: lineNumber,
            column,
            type: 'dynamic',
            raw: fullExpression,
          }, false);
        }
      }
    }

    // Check static patterns
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const keyName = match[1];
        const column = match.index + 1;
        const isOptional = checkIfOptional(line, match.index);

        addEnvUsage(envKeys, keyName, {
          file: filePath,
          line: lineNumber,
          column,
          type: pattern.source.includes('[') ? 'bracket' : 'direct',
          raw: match[0],
        }, isOptional);
      }
    }
  }

  return Array.from(envKeys.values());
}

function addEnvUsage(
  envKeys: Map<string, EnvKey>,
  keyName: string,
  usage: EnvUsage,
  isOptional: boolean
): void {
  const existing = envKeys.get(keyName);
  if (existing) {
    existing.usage.push(usage);
    // If any usage is optional, mark the key as optional
    existing.isOptional = existing.isOptional || isOptional;
  } else {
    envKeys.set(keyName, {
      name: keyName,
      usage: [usage],
      isOptional,
    });
  }
}

function checkIfOptional(line: string, envIndex: number): boolean {
  // Look for patterns like: process.env.KEY || 'default'
  // or process.env.KEY ?? 'default'
  const afterEnv = line.substring(envIndex);
  
  // More flexible patterns that match the test cases
  const orPattern = /process\.env\.[A-Z_][A-Z0-9_]*\s*(\|\||\?\?)/;
  const bracketOrPattern = /process\.env\[['"][A-Z_][A-Z0-9_]*['"]\]\s*(\|\||\?\?)/;
  
  return orPattern.test(afterEnv) || bracketOrPattern.test(afterEnv);
}
