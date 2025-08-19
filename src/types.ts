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

// Schema-based validation types
export interface EnvSchema {
  [key: string]: EnvSchemaField;
}

export interface EnvSchemaField {
  type: 'string' | 'number' | 'boolean' | 'url' | 'email' | 'enum' | 'json';
  required?: boolean; // default: true
  default?: any;
  allowedValues?: string[];
  pattern?: string; // regex pattern for strings
  min?: number; // min length for string, min value for number
  max?: number; // max length for string, max value for number
  isSensitive?: boolean; // sensitive values (passwords, tokens)
  description?: string; // human-readable explanation
}

export interface SchemaValidationResult extends ValidationResult {
  invalidType: SchemaValidationError[];
  invalidFormat: SchemaValidationError[];
  invalidEnum: SchemaValidationError[];
  sensitiveDefaults: SchemaValidationError[];
  schemaErrors: SchemaValidationError[];
}

export interface SchemaValidationError {
  key: string;
  value: string | undefined;
  expectedType: string;
  actualType: string;
  issue: string;
  description?: string;
  isSensitive: boolean;
}

export interface EnvSchemaConfig extends Config {
  schema?: string; // path to schema file
  envSchema?: EnvSchema; // inline schema
  generateTypes?: boolean; // generate TypeScript types
  maskSensitive?: boolean; // mask sensitive values in output
}

export interface SchemaReportOptions extends ReportOptions {
  maskSensitive: boolean;
  showDescriptions: boolean;
}

// Validated environment interface
export interface ValidatedEnv {
  [key: string]: string | number | boolean | object;
}

// Schema generation options
export interface GenerateSchemaOptions {
  includeDefaults: boolean;
  includeDescriptions: boolean;
  includeComments: boolean;
}
