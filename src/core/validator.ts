import { ValidationResult, EnvKey, EnvValue, Config } from '../types.js';

export function validateEnvironment(
  codeKeys: EnvKey[],
  envKeys: Map<string, EnvValue>,
  config: Config
): ValidationResult {
  const missing: string[] = [];
  const unused: string[] = [];
  const empty: string[] = [];
  const duplicates: string[] = [];
  const uncertain: string[] = [];

  // Create sets for efficient lookup
  const codeKeyNames = new Set(codeKeys.map(key => key.name));
  const envKeyNames = new Set(envKeys.keys());

  // Find missing keys (in code but not in env)
  for (const codeKey of codeKeys) {
    if (codeKey.name.startsWith('DYNAMIC_KEY_')) {
      // This is a dynamic key, add to uncertain
      const dynamicUsage = codeKey.usage[0];
      uncertain.push(dynamicUsage.raw);
      continue;
    }

    if (!envKeyNames.has(codeKey.name)) {
      // Skip if it's in allowOptional and marked as optional
      if (config.allowOptional.includes(codeKey.name) && codeKey.isOptional) {
        continue;
      }
      missing.push(codeKey.name);
    }
  }

  // Find unused keys (in env but not in code)
  for (const envKey of envKeyNames) {
    if (!codeKeyNames.has(envKey) && !config.ignoreKeys.includes(envKey)) {
      unused.push(envKey);
    }
  }

  // Find empty values
  for (const [key, value] of envKeys) {
    if (value.isEmpty && !config.ignoreKeys.includes(key)) {
      empty.push(key);
    }
  }

  // Sort arrays for consistent output
  missing.sort();
  unused.sort();
  empty.sort();
  uncertain.sort();

  return {
    missing,
    unused,
    empty,
    duplicates,
    uncertain,
    summary: {
      keysInCode: codeKeyNames.size,
      keysInEnv: envKeyNames.size,
      totalIssues: missing.length + unused.length + empty.length + duplicates.length,
    },
  };
}

export function getMissingKeyDetails(
  codeKeys: EnvKey[],
  missingKeys: string[]
): Map<string, EnvKey> {
  const missingDetails = new Map<string, EnvKey>();
  
  for (const codeKey of codeKeys) {
    if (missingKeys.includes(codeKey.name)) {
      missingDetails.set(codeKey.name, codeKey);
    }
  }
  
  return missingDetails;
}

export function getUnusedKeyDetails(
  envKeys: Map<string, EnvValue>,
  unusedKeys: string[]
): Map<string, EnvValue> {
  const unusedDetails = new Map<string, EnvValue>();
  
  for (const unusedKey of unusedKeys) {
    const envValue = envKeys.get(unusedKey);
    if (envValue) {
      unusedDetails.set(unusedKey, envValue);
    }
  }
  
  return unusedDetails;
}
