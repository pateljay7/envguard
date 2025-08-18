import { validateEnvironment } from '../src/core/validator';
import { EnvKey, EnvValue, Config } from '../src/types';

describe('Validator', () => {
  const mockConfig: Config = {
    paths: [],
    envFiles: [],
    allowOptional: ['OPTIONAL_KEY'],
    ignoreKeys: ['NODE_ENV'],
    reportFormat: 'table',
    exitOnError: true,
    includeOptional: false,
  };

  test('should detect missing keys', () => {
    const codeKeys: EnvKey[] = [
      {
        name: 'API_KEY',
        usage: [{
          file: 'test.js',
          line: 1,
          column: 1,
          type: 'direct',
          raw: 'process.env.API_KEY'
        }],
        isOptional: false
      },
      {
        name: 'DATABASE_URL',
        usage: [{
          file: 'test.js',
          line: 2,
          column: 1,
          type: 'direct',
          raw: 'process.env.DATABASE_URL'
        }],
        isOptional: false
      }
    ];

    const envKeys = new Map<string, EnvValue>([
      ['API_KEY', {
        key: 'API_KEY',
        value: 'test-key',
        isEmpty: false,
        line: 1
      }]
    ]);

    const result = validateEnvironment(codeKeys, envKeys, mockConfig);

    expect(result.missing).toEqual(['DATABASE_URL']);
    expect(result.unused).toEqual([]);
    expect(result.summary.keysInCode).toBe(2);
    expect(result.summary.keysInEnv).toBe(1);
    expect(result.summary.totalIssues).toBe(1);
  });

  test('should detect unused keys', () => {
    const codeKeys: EnvKey[] = [
      {
        name: 'API_KEY',
        usage: [{
          file: 'test.js',
          line: 1,
          column: 1,
          type: 'direct',
          raw: 'process.env.API_KEY'
        }],
        isOptional: false
      }
    ];

    const envKeys = new Map<string, EnvValue>([
      ['API_KEY', {
        key: 'API_KEY',
        value: 'test-key',
        isEmpty: false,
        line: 1
      }],
      ['UNUSED_KEY', {
        key: 'UNUSED_KEY',
        value: 'unused-value',
        isEmpty: false,
        line: 2
      }]
    ]);

    const result = validateEnvironment(codeKeys, envKeys, mockConfig);

    expect(result.missing).toEqual([]);
    expect(result.unused).toEqual(['UNUSED_KEY']);
    expect(result.summary.totalIssues).toBe(1);
  });

  test('should detect empty values', () => {
    const codeKeys: EnvKey[] = [
      {
        name: 'API_KEY',
        usage: [{
          file: 'test.js',
          line: 1,
          column: 1,
          type: 'direct',
          raw: 'process.env.API_KEY'
        }],
        isOptional: false
      }
    ];

    const envKeys = new Map<string, EnvValue>([
      ['API_KEY', {
        key: 'API_KEY',
        value: '',
        isEmpty: true,
        line: 1
      }]
    ]);

    const result = validateEnvironment(codeKeys, envKeys, mockConfig);

    expect(result.missing).toEqual([]);
    expect(result.unused).toEqual([]);
    expect(result.empty).toEqual(['API_KEY']);
    expect(result.summary.totalIssues).toBe(1);
  });

  test('should handle optional keys', () => {
    const codeKeys: EnvKey[] = [
      {
        name: 'OPTIONAL_KEY',
        usage: [{
          file: 'test.js',
          line: 1,
          column: 1,
          type: 'direct',
          raw: 'process.env.OPTIONAL_KEY'
        }],
        isOptional: true
      }
    ];

    const envKeys = new Map<string, EnvValue>();

    const result = validateEnvironment(codeKeys, envKeys, mockConfig);

    expect(result.missing).toEqual([]); // Should not be missing because it's optional
    expect(result.summary.totalIssues).toBe(0);
  });

  test('should ignore specified keys', () => {
    const testConfig: Config = {
      ...mockConfig,
      ignoreKeys: ['NODE_ENV', 'IGNORED_UNUSED']
    };

    const codeKeys: EnvKey[] = [
      {
        name: 'NODE_ENV',
        usage: [{
          file: 'test.js',
          line: 1,
          column: 1,
          type: 'direct',
          raw: 'process.env.NODE_ENV'
        }],
        isOptional: false
      }
    ];

    const envKeys = new Map<string, EnvValue>([
      ['NODE_ENV', {
        key: 'NODE_ENV',
        value: 'development',
        isEmpty: false,
        line: 1
      }],
      ['IGNORED_UNUSED', {
        key: 'IGNORED_UNUSED', // This should be ignored in unused check
        value: 'value',
        isEmpty: false,
        line: 2
      }]
    ]);

    const result = validateEnvironment(codeKeys, envKeys, testConfig);

    expect(result.missing).toEqual([]);
    expect(result.unused).toEqual([]); // Both keys should be ignored
  });

  test('should handle dynamic keys as uncertain', () => {
    const codeKeys: EnvKey[] = [
      {
        name: 'DYNAMIC_KEY_1',
        usage: [{
          file: 'test.js',
          line: 1,
          column: 1,
          type: 'dynamic',
          raw: 'process.env[prefix + "TOKEN"]'
        }],
        isOptional: false
      }
    ];

    const envKeys = new Map<string, EnvValue>();

    const result = validateEnvironment(codeKeys, envKeys, mockConfig);

    expect(result.missing).toEqual([]);
    expect(result.uncertain).toEqual(['process.env[prefix + "TOKEN"]']);
  });
});
