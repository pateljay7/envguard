import { Config } from './types.js';
import fs from 'fs';
import path from 'path';

const DEFAULT_CONFIG: Config = {
  paths: ['src/**/*.{js,ts,mjs,cjs}', 'lib/**/*.{js,ts,mjs,cjs}'],
  envFiles: ['.env'],
  allowOptional: [],
  ignoreKeys: ['NODE_ENV'],
  reportFormat: 'table',
  exitOnError: true,
  includeOptional: false,
};

export function loadConfig(configPath?: string): Config {
  let config = { ...DEFAULT_CONFIG };

  // Try to load from .envguardrc.json
  const rcPath = configPath || '.envguardrc.json';
  if (fs.existsSync(rcPath)) {
    try {
      const fileConfig = JSON.parse(fs.readFileSync(rcPath, 'utf-8'));
      config = mergeConfig(config, fileConfig);
    } catch (error) {
      console.warn(`Warning: Failed to parse config file ${rcPath}`);
    }
  }

  // Try to load from package.json
  const packageJsonPath = 'package.json';
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      if (packageJson['envguard']) {
        config = mergeConfig(config, packageJson['envguard']);
      }
    } catch (error) {
      console.warn(`Warning: Failed to parse package.json`);
    }
  }

  return config;
}

function mergeConfig(base: Config, override: Partial<Config>): Config {
  return {
    ...base,
    ...override,
    paths: override.paths || base.paths,
    envFiles: override.envFiles || base.envFiles,
    allowOptional: [...base.allowOptional, ...(override.allowOptional || [])],
    ignoreKeys: [...base.ignoreKeys, ...(override.ignoreKeys || [])],
  };
}

export function validateConfig(config: Config): string[] {
  const errors: string[] = [];

  if (!config.paths || config.paths.length === 0) {
    errors.push('Config must specify at least one path to scan');
  }

  if (!config.envFiles || config.envFiles.length === 0) {
    errors.push('Config must specify at least one env file');
  }

  if (!['table', 'json', 'minimal'].includes(config.reportFormat)) {
    errors.push('reportFormat must be one of: table, json, minimal');
  }

  return errors;
}
