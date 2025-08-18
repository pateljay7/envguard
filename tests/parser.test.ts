import { parseEnvFile, parseMultipleEnvFiles } from '../src/core/parser';
import fs from 'fs';
import path from 'path';

// Create temp directory for tests
const testDir = path.join(__dirname, 'temp');
const testEnvFile = path.join(testDir, '.env.test');

beforeAll(() => {
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
});

afterAll(() => {
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true });
  }
});

describe('EnvParser', () => {
  beforeEach(() => {
    // Clean up test file before each test
    if (fs.existsSync(testEnvFile)) {
      fs.unlinkSync(testEnvFile);
    }
  });

  test('should parse valid env file', () => {
    const envContent = `
# Comment
API_KEY=test-key
DATABASE_URL="postgresql://localhost:5432/db"
DEBUG_MODE=true
EMPTY_VAR=
`;
    fs.writeFileSync(testEnvFile, envContent);

    const result = parseEnvFile(testEnvFile);

    expect(result.parseErrors).toHaveLength(0);
    expect(result.keys.size).toBe(4);
    expect(result.keys.get('API_KEY')?.value).toBe('test-key');
    expect(result.keys.get('DATABASE_URL')?.value).toBe('postgresql://localhost:5432/db');
    expect(result.keys.get('DEBUG_MODE')?.value).toBe('true');
    expect(result.keys.get('EMPTY_VAR')?.isEmpty).toBe(true);
  });

  test('should handle missing file', () => {
    const result = parseEnvFile('nonexistent.env');

    expect(result.parseErrors).toHaveLength(1);
    expect(result.parseErrors[0].message).toContain('File not found');
    expect(result.keys.size).toBe(0);
  });

  test('should detect duplicate keys', () => {
    const envContent = `
API_KEY=first-value
API_KEY=second-value
`;
    fs.writeFileSync(testEnvFile, envContent);

    const result = parseEnvFile(testEnvFile);

    expect(result.parseErrors).toHaveLength(1);
    expect(result.parseErrors[0].message).toContain('Duplicate key');
    expect(result.keys.get('API_KEY')?.value).toBe('second-value'); // Last one wins
  });

  test('should handle malformed lines', () => {
    const envContent = `
API_KEY=valid
INVALID_LINE_WITHOUT_EQUALS
ANOTHER_KEY=valid
=INVALID_EMPTY_KEY
`;
    fs.writeFileSync(testEnvFile, envContent);

    const result = parseEnvFile(testEnvFile);

    expect(result.parseErrors).toHaveLength(2);
    expect(result.keys.size).toBe(2);
    expect(result.keys.has('API_KEY')).toBe(true);
    expect(result.keys.has('ANOTHER_KEY')).toBe(true);
  });

  test('should parse multiple env files', () => {
    const env1Content = 'KEY1=value1\nSHARED=from-file1';
    const env2Content = 'KEY2=value2\nSHARED=from-file2';
    
    const env1Path = path.join(testDir, '.env1');
    const env2Path = path.join(testDir, '.env2');
    
    fs.writeFileSync(env1Path, env1Content);
    fs.writeFileSync(env2Path, env2Content);

    const result = parseMultipleEnvFiles([env1Path, env2Path]);

    expect(result.size).toBe(3);
    expect(result.get('KEY1')?.value).toBe('value1');
    expect(result.get('KEY2')?.value).toBe('value2');
    expect(result.get('SHARED')?.value).toBe('from-file2'); // Later file wins

    // Cleanup
    fs.unlinkSync(env1Path);
    fs.unlinkSync(env2Path);
  });
});
