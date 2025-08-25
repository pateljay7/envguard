import { 
  EnvSchema, 
  EnvSchemaField, 
  SchemaValidationResult, 
  SchemaValidationError,
  ValidatedEnv 
} from '../types.js';

export class SchemaValidator {
  private schema: EnvSchema;

  constructor(schema: EnvSchema) {
    this.schema = schema;
  }

  /**
   * Validate environment variables against schema
   */
  validate(env: Record<string, string | undefined>): SchemaValidationResult {
    const result: SchemaValidationResult = {
      missing: [],
      unused: [],
      empty: [],
      duplicates: [],
      uncertain: [],
      invalidType: [],
      invalidFormat: [],
      invalidEnum: [],
      sensitiveDefaults: [],
      schemaErrors: [],
      summary: {
        keysInCode: 0,
        keysInEnv: Object.keys(env).length,
        totalIssues: 0
      }
    };

    // Validate each schema field
    for (const [key, field] of Object.entries(this.schema)) {
      const value = env[key];
      
      // Check if required field is missing
      if (this.isRequired(field) && (value === undefined || value === '')) {
        result.missing.push(key);
        continue;
      }

      // Skip validation if value is undefined and not required
      if (value === undefined && !this.isRequired(field)) {
        continue;
      }

      // Validate sensitive fields don't have defaults
      if (field.isSensitive && field.default !== undefined) {
        result.sensitiveDefaults.push({
          key,
          value: this.maskValue(value, field),
          expectedType: field.type,
          actualType: typeof value,
          issue: 'Sensitive field cannot have default value',
          description: field.description,
          isSensitive: true
        });
      }

      // Validate enum values (for enum type or allowedValues constraint)
      const enumValidation = this.validateEnum(key, value!, field);
      if (enumValidation) {
        result.invalidEnum.push(enumValidation);
        continue;
      }

      // Validate type (skip if enum was already validated)
      if (field.type !== 'enum') {
        const typeValidation = this.validateType(key, value!, field);
        if (typeValidation) {
          result.invalidType.push(typeValidation);
          continue;
        }
      }

      // Validate format (regex pattern)
      const formatValidation = this.validateFormat(key, value!, field);
      if (formatValidation) {
        result.invalidFormat.push(formatValidation);
        continue;
      }
    }

    // Find unused environment variables (not in schema)
    for (const key of Object.keys(env)) {
      if (!this.schema[key] && env[key] !== undefined) {
        result.unused.push(key);
      }
    }

    // Calculate total issues
    result.summary.totalIssues = 
      result.missing.length +
      result.unused.length +
      result.empty.length +
      result.invalidType.length +
      result.invalidFormat.length +
      result.invalidEnum.length +
      result.sensitiveDefaults.length +
      result.schemaErrors.length;

    result.summary.keysInCode = Object.keys(this.schema).length;

    return result;
  }

  /**
   * Get validated and typed environment object
   */
  getValidatedEnv(env: Record<string, string | undefined>): ValidatedEnv {
    const validated: ValidatedEnv = {};

    for (const [key, field] of Object.entries(this.schema)) {
      const value = env[key];
      
      if (value === undefined || value === '') {
        // Use default if available and not sensitive
        if (field.default !== undefined && !field.isSensitive) {
          validated[key] = field.default;
        } else if (this.isRequired(field)) {
          throw new Error(`Missing required environment variable: ${key}`);
        }
        continue;
      }

      // Convert to appropriate type
      validated[key] = this.convertValue(value, field);
    }

    return validated;
  }

  private isRequired(field: EnvSchemaField): boolean {
    return field.required !== false; // default is true
  }

  private validateType(key: string, value: string, field: EnvSchemaField): SchemaValidationError | null {
    const convertedValue = this.convertValue(value, field);
    
    if (convertedValue === null) {
      return {
        key,
        value: this.maskValue(value, field),
        expectedType: field.type,
        actualType: typeof value,
        issue: `Invalid ${field.type} format`,
        description: field.description,
        isSensitive: field.isSensitive || false
      };
    }

    // Check min/max constraints
    if (field.type === 'string' && typeof convertedValue === 'string') {
      if (field.min && convertedValue.length < field.min) {
        return {
          key,
          value: this.maskValue(value, field),
          expectedType: field.type,
          actualType: typeof value,
          issue: `String too short (min: ${field.min})`,
          description: field.description,
          isSensitive: field.isSensitive || false
        };
      }
      if (field.max && convertedValue.length > field.max) {
        return {
          key,
          value: this.maskValue(value, field),
          expectedType: field.type,
          actualType: typeof value,
          issue: `String too long (max: ${field.max})`,
          description: field.description,
          isSensitive: field.isSensitive || false
        };
      }
    }

    if (field.type === 'number' && typeof convertedValue === 'number') {
      if (field.min && convertedValue < field.min) {
        return {
          key,
          value: this.maskValue(value, field),
          expectedType: field.type,
          actualType: typeof value,
          issue: `Number too small (min: ${field.min})`,
          description: field.description,
          isSensitive: field.isSensitive || false
        };
      }
      if (field.max && convertedValue > field.max) {
        return {
          key,
          value: this.maskValue(value, field),
          expectedType: field.type,
          actualType: typeof value,
          issue: `Number too large (max: ${field.max})`,
          description: field.description,
          isSensitive: field.isSensitive || false
        };
      }
    }

    return null;
  }

  private validateFormat(key: string, value: string, field: EnvSchemaField): SchemaValidationError | null {
    if (field.pattern && field.type === 'string') {
      const regex = new RegExp(field.pattern);
      if (!regex.test(value)) {
        return {
          key,
          value: this.maskValue(value, field),
          expectedType: field.type,
          actualType: typeof value,
          issue: `Does not match pattern: ${field.pattern}`,
          description: field.description,
          isSensitive: field.isSensitive || false
        };
      }
    }
    return null;
  }

  private validateEnum(key: string, value: string, field: EnvSchemaField): SchemaValidationError | null {
    // Check for enum type or allowedValues constraint
    if (field.type === 'enum' || field.allowedValues) {
      const allowedValues = field.allowedValues;
      if (allowedValues && !allowedValues.includes(value)) {
        return {
          key,
          value: this.maskValue(value, field),
          expectedType: field.type,
          actualType: typeof value,
          issue: `Not in allowed values: ${allowedValues.join(', ')}`,
          description: field.description,
          isSensitive: field.isSensitive || false
        };
      }
    }
    return null;
  }

  private convertValue(value: string, field: EnvSchemaField): any {
    try {
      switch (field.type) {
        case 'string':
          return value;
        
        case 'number':
          const num = Number(value);
          return isNaN(num) ? null : num;
        
        case 'boolean':
          const lower = value.toLowerCase();
          if (['true', '1', 'yes', 'on'].includes(lower)) return true;
          if (['false', '0', 'no', 'off'].includes(lower)) return false;
          return null;
        
        case 'url':
          try {
            new URL(value);
            return value;
          } catch {
            return null;
          }
        
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value) ? value : null;
        
        case 'json':
          try {
            return JSON.parse(value);
          } catch {
            return null;
          }
        
        case 'enum':
          return field.allowedValues?.includes(value) ? value : null;
        
        default:
          return value;
      }
    } catch {
      return null;
    }
  }

  private maskValue(value: string | undefined, field: EnvSchemaField): string {
    if (!value) return '';
    if (field.isSensitive) {
      return '*'.repeat(8); // Always 8 asterisks for consistency
    }
    return value;
  }

  /**
   * Generate .env.example from schema
   */
  generateEnvExample(): string {
    const lines: string[] = [];
    lines.push('# Generated from schema by envguard');
    lines.push('# Copy this file to .env and fill in the values');
    lines.push('');

    for (const [key, field] of Object.entries(this.schema)) {
      // Add description as comment
      if (field.description) {
        lines.push(`# ${field.description}`);
      }

      // Add type and constraints info
      const constraints: string[] = [];
      if (field.type !== 'string') constraints.push(`type: ${field.type}`);
      if (field.allowedValues) constraints.push(`choices: ${field.allowedValues.join(' | ')}`);
      if (field.min !== undefined) constraints.push(`min: ${field.min}`);
      if (field.max !== undefined) constraints.push(`max: ${field.max}`);
      if (field.pattern) constraints.push(`pattern: ${field.pattern}`);
      if (field.isSensitive) constraints.push('sensitive');
      if (!this.isRequired(field)) constraints.push('optional');

      if (constraints.length > 0) {
        lines.push(`# (${constraints.join(', ')})`);
      }

      // Add the variable
      if (field.isSensitive || field.default === undefined) {
        lines.push(`${key}=`);
      } else {
        lines.push(`${key}=${field.default}`);
      }

      lines.push('');
    }

    return lines.join('\n');
  }
}

/**
 * Load schema from file or object
 */
export function loadSchema(schemaPath?: string, inlineSchema?: any): EnvSchema {
  if (inlineSchema) {
    return inlineSchema;
  }

  if (schemaPath) {
    try {
      const fs = require('fs');
      const content = fs.readFileSync(schemaPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load schema from ${schemaPath}: ${error}`);
    }
  }

  // Try to load from default locations
  const fs = require('fs');
  const defaultPaths = ['.envschema.json', 'envschema.json'];
  
  for (const path of defaultPaths) {
    if (fs.existsSync(path)) {
      try {
        const content = fs.readFileSync(path, 'utf-8');
        return JSON.parse(content);
      } catch (error) {
        console.warn(`Warning: Failed to parse schema from ${path}`);
      }
    }
  }

  return {};
}

/**
 * Validate environment variables against schema
 */
export function validateEnv(env: Record<string, string | undefined>, schema: EnvSchema): ValidatedEnv {
  const validator = new SchemaValidator(schema);
  return validator.getValidatedEnv(env);
}

/**
 * Generate .env.example from schema
 */
export function generateExampleEnv(schema: EnvSchema, outputPath?: string): string {
  const validator = new SchemaValidator(schema);
  const content = validator.generateEnvExample();
  
  if (outputPath) {
    const fs = require('fs');
    fs.writeFileSync(outputPath, content);
  }
  
  return content;
}
