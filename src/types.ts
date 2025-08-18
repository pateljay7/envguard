export interface EnvKey {
  name: string;
  usage: EnvUsage[];
  isOptional: boolean;
}

export interface EnvUsage {
  file: string;
  line: number;
  column: number;
  type: 'direct' | 'bracket' | 'dynamic';
  raw: string;
}

export interface EnvFile {
  path: string;
  keys: Map<string, EnvValue>;
  parseErrors: ParseError[];
}

export interface EnvValue {
  key: string;
  value: string;
  isEmpty: boolean;
  line: number;
}

export interface ParseError {
  line: number;
  message: string;
}

export interface ValidationResult {
  missing: string[];
  unused: string[];
  empty: string[];
  duplicates: string[];
  uncertain: string[];
  summary: {
    keysInCode: number;
    keysInEnv: number;
    totalIssues: number;
  };
}

export interface Config {
  paths: string[];
  envFiles: string[];
  allowOptional: string[];
  ignoreKeys: string[];
  reportFormat: 'table' | 'json' | 'minimal';
  exitOnError: boolean;
  includeOptional: boolean;
}

export interface ReportOptions {
  format: 'table' | 'json' | 'minimal';
  colors: boolean;
  verbose: boolean;
}

export type ExitCode = 0 | 1 | 2;
