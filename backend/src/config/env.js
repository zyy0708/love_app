import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [];

const optionalEnvVars = [
  'JWT_SECRET',
  'PORT',
  'NODE_ENV'
];

export function validateConfig() {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\nPlease set these variables in your .env file.');
    process.exit(1);
  }

  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      console.error('❌ JWT_SECRET must be at least 32 characters in production');
      process.exit(1);
    }
  }

  console.log('✓ Environment configuration validated');
}

export function getEnv(key, defaultValue = null) {
  return process.env[key] || defaultValue;
}

export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

export function isDevelopment() {
  return process.env.NODE_ENV !== 'production';
}
