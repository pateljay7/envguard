import { scanCodeForEnvUsage } from '../src/core/scanner';
import fs from 'fs';
import path from 'path';

// Create temp directory for tests
const testDir = path.join(__dirname, 'temp');

beforeAll(() => {
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
});

afterAll(() => {
  if (fs.existsSync(testDir)) {
    try {
      fs.rmSync(testDir, { recursive: true, force: true });
    } catch (error) {
      // Try to clean up individual files if directory removal fails
      try {
        const files = fs.readdirSync(testDir);
        for (const file of files) {
          fs.unlinkSync(path.join(testDir, file));
        }
        fs.rmdirSync(testDir);
      } catch (cleanupError) {
        console.warn('Could not clean up test directory:', cleanupError);
      }
    }
  }
});

describe('CodeScanner', () => {
  test('should detect direct env access', async () => {
    const testFile = path.join(testDir, 'test1.js');
    const content = `
const port = process.env.PORT;
const apiKey = process.env.API_KEY;
console.log(process.env.NODE_ENV);
`;
    fs.writeFileSync(testFile, content);

    const result = await scanCodeForEnvUsage([testFile]);

    expect(result).toHaveLength(3);
    const keyNames = result.map(key => key.name).sort();
    expect(keyNames).toEqual(['API_KEY', 'NODE_ENV', 'PORT']);

    // Cleanup
    fs.unlinkSync(testFile);
  });

  test('should detect bracket notation access', async () => {
    const testFile = path.join(testDir, 'test2.js');
    const content = `
const apiKey = process.env["API_KEY"];
const dbUrl = process.env['DATABASE_URL'];
`;
    fs.writeFileSync(testFile, content);

    const result = await scanCodeForEnvUsage([testFile]);

    expect(result).toHaveLength(2);
    const keyNames = result.map(key => key.name).sort();
    expect(keyNames).toEqual(['API_KEY', 'DATABASE_URL']);

    // Cleanup
    fs.unlinkSync(testFile);
  });

  test('should detect optional variables', async () => {
    const testFile = path.join(testDir, 'test3.js');
    const content = `
const port = process.env.PORT || 3000;
const debug = process.env.DEBUG_MODE ?? false;
`;
    fs.writeFileSync(testFile, content);

    const result = await scanCodeForEnvUsage([testFile]);

    expect(result).toHaveLength(2);
    const portKey = result.find(key => key.name === 'PORT');
    const debugKey = result.find(key => key.name === 'DEBUG_MODE');
    
    expect(portKey?.isOptional).toBe(true);
    expect(debugKey?.isOptional).toBe(true);

    // Cleanup
    fs.unlinkSync(testFile);
  });

  test('should detect dynamic access as uncertain', async () => {
    const testFile = path.join(testDir, 'test4.js');
    const content = `
const prefix = 'API_';
const token = process.env[prefix + 'TOKEN'];
const dynamicKey = process.env[someVariable];
`;
    fs.writeFileSync(testFile, content);

    const result = await scanCodeForEnvUsage([testFile]);

    const dynamicKeys = result.filter(key => key.name.startsWith('DYNAMIC_KEY_'));
    expect(dynamicKeys.length).toBeGreaterThan(0);

    // Cleanup
    fs.unlinkSync(testFile);
  });

  test('should handle TypeScript files', async () => {
    const testFile = path.join(testDir, 'test5.ts');
    const content = `
interface Config {
  port: number;
  apiKey: string;
}

const config: Config = {
  port: parseInt(process.env.PORT || '3000'),
  apiKey: process.env.API_KEY!
};
`;
    fs.writeFileSync(testFile, content);

    const result = await scanCodeForEnvUsage([testFile]);

    expect(result).toHaveLength(2);
    const keyNames = result.map(key => key.name).sort();
    expect(keyNames).toEqual(['API_KEY', 'PORT']);

    // Cleanup
    fs.unlinkSync(testFile);
  });

  test('should track usage locations', async () => {
    const testFile = path.join(testDir, 'test6.js');
    const content = `
const port = process.env.PORT;
if (process.env.PORT) {
  console.log('Port is set');
}
`;
    fs.writeFileSync(testFile, content);

    const result = await scanCodeForEnvUsage([testFile]);

    expect(result).toHaveLength(1);
    const portKey = result[0];
    expect(portKey.name).toBe('PORT');
    expect(portKey.usage).toHaveLength(2);
    expect(portKey.usage[0].line).toBe(2);
    expect(portKey.usage[1].line).toBe(3);

    // Cleanup
    fs.unlinkSync(testFile);
  });
});
