import { SchemaValidator, loadSchema, validateEnv, generateExampleEnv } from '../src/core/schema-validator';
import { EnvSchema, SchemaValidationResult } from '../src/types';
import * as fs from 'fs';
import * as path from 'path';

describe('SchemaValidator', () => {
  const testSchema: EnvSchema = {
    NODE_ENV: {
      type: 'enum',
      description: 'Application environment',
      allowedValues: ['development', 'production', 'test'],
      default: 'development',
      required: true
    },
    PORT: {
      type: 'number',
      description: 'Server port',
      min: 1,
      max: 65535,
      default: 3000,
      required: false
    },
    DATABASE_URL: {
      type: 'url',
      description: 'Database connection URL',
      isSensitive: true,
      required: true
    },
    DEBUG: {
      type: 'boolean',
      description: 'Debug mode',
      default: false,
      required: false
    },
    API_KEY: {
      type: 'string',
      description: 'API key',
      pattern: '^[a-zA-Z0-9]{32}$',
      isSensitive: true,
      required: true
    },
    ADMIN_EMAIL: {
      type: 'email',
      description: 'Admin email',
      required: true
    },
    CONFIG_JSON: {
      type: 'json',
      description: 'JSON configuration',
      required: false
    }
  };

  let validator: SchemaValidator;

  beforeEach(() => {
    validator = new SchemaValidator(testSchema);
  });

  describe('validate', () => {
    it('should pass validation with all valid values', () => {
      const env = {
        NODE_ENV: 'production',
        PORT: '8080',
        DATABASE_URL: 'https://example.com/db',
        DEBUG: 'true',
        API_KEY: 'abcdefghijklmnopqrstuvwxyz123456',
        ADMIN_EMAIL: 'admin@example.com',
        CONFIG_JSON: '{"key": "value"}'
      };

      const result = validator.validate(env);

      expect(result.missing).toHaveLength(0);
      expect(result.invalidType).toHaveLength(0);
      expect(result.invalidFormat).toHaveLength(0);
      expect(result.invalidEnum).toHaveLength(0);
      expect(result.summary.totalIssues).toBe(0);
    });

    it('should detect missing required variables', () => {
      const env = {
        NODE_ENV: 'development'
        // Missing DATABASE_URL, API_KEY, ADMIN_EMAIL
      };

      const result = validator.validate(env);

      expect(result.missing).toContain('DATABASE_URL');
      expect(result.missing).toContain('API_KEY');
      expect(result.missing).toContain('ADMIN_EMAIL');
      expect(result.missing).toHaveLength(3);
    });

    it('should detect invalid enum values', () => {
      const env = {
        NODE_ENV: 'invalid',
        DATABASE_URL: 'https://example.com/db',
        API_KEY: 'abcdefghijklmnopqrstuvwxyz123456',
        ADMIN_EMAIL: 'admin@example.com'
      };

      const result = validator.validate(env);

      expect(result.invalidEnum).toHaveLength(1);
      expect(result.invalidEnum[0].key).toBe('NODE_ENV');
      expect(result.invalidEnum[0].issue).toContain('Not in allowed values');
    });

    it('should detect invalid number types', () => {
      const env = {
        NODE_ENV: 'development',
        PORT: 'not-a-number',
        DATABASE_URL: 'https://example.com/db',
        API_KEY: 'abcdefghijklmnopqrstuvwxyz123456',
        ADMIN_EMAIL: 'admin@example.com'
      };

      const result = validator.validate(env);

      expect(result.invalidType).toHaveLength(1);
      expect(result.invalidType[0].key).toBe('PORT');
      expect(result.invalidType[0].issue).toContain('Invalid number format');
    });

    it('should detect invalid URL format', () => {
      const env = {
        NODE_ENV: 'development',
        DATABASE_URL: 'not-a-url',
        API_KEY: 'abcdefghijklmnopqrstuvwxyz123456',
        ADMIN_EMAIL: 'admin@example.com'
      };

      const result = validator.validate(env);

      expect(result.invalidType).toHaveLength(1);
      expect(result.invalidType[0].key).toBe('DATABASE_URL');
      expect(result.invalidType[0].issue).toContain('Invalid url format');
    });

    it('should detect invalid email format', () => {
      const env = {
        NODE_ENV: 'development',
        DATABASE_URL: 'https://example.com/db',
        API_KEY: 'abcdefghijklmnopqrstuvwxyz123456',
        ADMIN_EMAIL: 'not-an-email'
      };

      const result = validator.validate(env);

      expect(result.invalidType).toHaveLength(1);
      expect(result.invalidType[0].key).toBe('ADMIN_EMAIL');
      expect(result.invalidType[0].issue).toContain('Invalid email format');
    });

    it('should detect invalid pattern format', () => {
      const env = {
        NODE_ENV: 'development',
        DATABASE_URL: 'https://example.com/db',
        API_KEY: 'invalid-key',
        ADMIN_EMAIL: 'admin@example.com'
      };

      const result = validator.validate(env);

      expect(result.invalidFormat).toHaveLength(1);
      expect(result.invalidFormat[0].key).toBe('API_KEY');
      expect(result.invalidFormat[0].issue).toContain('Does not match pattern');
    });

    it('should detect invalid JSON format', () => {
      const env = {
        NODE_ENV: 'development',
        DATABASE_URL: 'https://example.com/db',
        API_KEY: 'abcdefghijklmnopqrstuvwxyz123456',
        ADMIN_EMAIL: 'admin@example.com',
        CONFIG_JSON: 'invalid-json'
      };

      const result = validator.validate(env);

      expect(result.invalidType).toHaveLength(1);
      expect(result.invalidType[0].key).toBe('CONFIG_JSON');
      expect(result.invalidType[0].issue).toContain('Invalid json format');
    });

    it('should detect number range violations', () => {
      const env = {
        NODE_ENV: 'development',
        PORT: '70000', // exceeds max
        DATABASE_URL: 'https://example.com/db',
        API_KEY: 'abcdefghijklmnopqrstuvwxyz123456',
        ADMIN_EMAIL: 'admin@example.com'
      };

      const result = validator.validate(env);

      expect(result.invalidType).toHaveLength(1);
      expect(result.invalidType[0].key).toBe('PORT');
      expect(result.invalidType[0].issue).toContain('Number too large');
    });

    it('should detect unused variables', () => {
      const env = {
        NODE_ENV: 'development',
        DATABASE_URL: 'https://example.com/db',
        API_KEY: 'abcdefghijklmnopqrstuvwxyz123456',
        ADMIN_EMAIL: 'admin@example.com',
        UNUSED_VAR: 'some-value'
      };

      const result = validator.validate(env);

      expect(result.unused).toContain('UNUSED_VAR');
      expect(result.unused).toHaveLength(1);
    });

    it('should mask sensitive values in errors', () => {
      const env = {
        NODE_ENV: 'development',
        DATABASE_URL: 'not-a-url',
        API_KEY: 'invalid-key',
        ADMIN_EMAIL: 'admin@example.com'
      };

      const result = validator.validate(env);

      const dbError = result.invalidType.find(e => e.key === 'DATABASE_URL');
      const apiError = result.invalidFormat.find(e => e.key === 'API_KEY');

      expect(dbError?.value).toBe('********'); // masked because sensitive
      expect(apiError?.value).toBe('********'); // masked because sensitive
    });
  });

  describe('getValidatedEnv', () => {
    it('should return typed environment object with defaults', () => {
      const env = {
        DATABASE_URL: 'https://example.com/db',
        API_KEY: 'abcdefghijklmnopqrstuvwxyz123456',
        ADMIN_EMAIL: 'admin@example.com'
      };

      const validated = validator.getValidatedEnv(env);

      expect(validated.NODE_ENV).toBe('development'); // default value
      expect(validated.PORT).toBe(3000); // default value
      expect(validated.DATABASE_URL).toBe('https://example.com/db');
      expect(validated.DEBUG).toBe(false); // default value
    });

    it('should convert types correctly', () => {
      const env = {
        NODE_ENV: 'production',
        PORT: '8080',
        DATABASE_URL: 'https://example.com/db',
        DEBUG: 'true',
        API_KEY: 'abcdefghijklmnopqrstuvwxyz123456',
        ADMIN_EMAIL: 'admin@example.com',
        CONFIG_JSON: '{"test": true}'
      };

      const validated = validator.getValidatedEnv(env);

      expect(typeof validated.PORT).toBe('number');
      expect(validated.PORT).toBe(8080);
      expect(typeof validated.DEBUG).toBe('boolean');
      expect(validated.DEBUG).toBe(true);
      expect(typeof validated.CONFIG_JSON).toBe('object');
      expect(validated.CONFIG_JSON).toEqual({ test: true });
    });

    it('should throw error for missing required variables', () => {
      const env = {
        NODE_ENV: 'development'
        // Missing required variables
      };

      expect(() => validator.getValidatedEnv(env)).toThrow('Missing required environment variable');
    });
  });

  describe('generateEnvExample', () => {
    it('should generate proper .env.example content', () => {
      const content = validator.generateEnvExample();

      expect(content).toContain('# Generated from schema by envguard');
      expect(content).toContain('NODE_ENV=development'); // has default
      expect(content).toContain('PORT=3000'); // has default
      expect(content).toContain('DATABASE_URL='); // sensitive, no default
      expect(content).toContain('API_KEY='); // sensitive, no default
      expect(content).toContain('# Application environment');
      expect(content).toContain('# (type: enum, choices: development | production | test)');
      expect(content).toContain('sensitive'); // check that sensitive constraint is mentioned
    });
  });
});

describe('loadSchema', () => {
  const testSchemaPath = path.join(__dirname, 'test-schema.json');
  const testSchema = { TEST_VAR: { type: 'string', required: true } };

  beforeEach(() => {
    if (fs.existsSync(testSchemaPath)) {
      fs.unlinkSync(testSchemaPath);
    }
  });

  afterEach(() => {
    if (fs.existsSync(testSchemaPath)) {
      fs.unlinkSync(testSchemaPath);
    }
  });

  it('should load schema from file', () => {
    fs.writeFileSync(testSchemaPath, JSON.stringify(testSchema));
    
    const schema = loadSchema(testSchemaPath);
    expect(schema).toEqual(testSchema);
  });

  it('should return inline schema when provided', () => {
    const schema = loadSchema(undefined, testSchema);
    expect(schema).toEqual(testSchema);
  });

  it('should return empty schema when no schema found', () => {
    const schema = loadSchema();
    expect(schema).toEqual({});
  });

  it('should throw error for invalid schema file', () => {
    fs.writeFileSync(testSchemaPath, 'invalid json');
    
    expect(() => loadSchema(testSchemaPath)).toThrow('Failed to load schema');
  });
});

describe('convenience functions', () => {
  const testSchema: EnvSchema = {
    TEST_VAR: {
      type: 'string',
      required: true
    }
  };

  describe('validateEnv', () => {
    it('should validate environment against schema', () => {
      const env = { TEST_VAR: 'test-value' };
      const validated = validateEnv(env, testSchema);
      
      expect(validated.TEST_VAR).toBe('test-value');
    });
  });

  describe('generateExampleEnv', () => {
    it('should generate example env content', () => {
      const content = generateExampleEnv(testSchema);
      
      expect(content).toContain('TEST_VAR=');
      expect(content).toContain('# Generated from schema by envguard');
    });

    it('should write to file when path provided', () => {
      const outputPath = path.join(__dirname, 'test-output.env');
      
      try {
        const content = generateExampleEnv(testSchema, outputPath);
        
        expect(fs.existsSync(outputPath)).toBe(true);
        expect(fs.readFileSync(outputPath, 'utf-8')).toBe(content);
      } finally {
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
      }
    });
  });
});
