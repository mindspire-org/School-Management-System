import dotenv from 'dotenv';
import { dirname, resolve, join } from 'path';
import { fileURLToPath } from 'url';

export const loadEnv = () => {
  const env = process.env.NODE_ENV || 'development';
  const overridePath = process.env.SMS_ENV_PATH;
  if (overridePath) {
    dotenv.config({ path: overridePath });
  }
  // Resolve backend root so .env loads correctly regardless of process CWD
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const backendRoot = resolve(__dirname, '..', '..');
  const envPath = join(backendRoot, env === 'test' ? '.env.test' : '.env');
  dotenv.config({ path: envPath });
  dotenv.config();
};
