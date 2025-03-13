#!/usr/bin/env node

// Load environment variables from .env file
require('dotenv').config();

console.log('=== Environment Variables ===');
console.log('NODE_ENV:', process.env.NODE_ENV);

// Database
console.log('\n=== Database ===');
console.log('DATABASE_URL:', process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log('  Parsed DATABASE_URL:');
    console.log('  - Host:', url.hostname);
    console.log('  - Port:', url.port || '5432');
    console.log('  - Username:', url.username);
    console.log('  - Password:', url.password ? '********' : 'not set');
    console.log('  - Database:', url.pathname.substring(1));
  } catch (error) {
    console.error('  Failed to parse DATABASE_URL:', error.message);
  }
}
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USERNAME:', process.env.DB_USERNAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '********' : 'not set');
console.log('DB_DATABASE:', process.env.DB_DATABASE);

// CloudFlare
console.log('\n=== CloudFlare ===');
console.log('CLOUDFLARE_API_KEY:', process.env.CLOUDFLARE_API_KEY ? '********' : 'not set');
console.log('CLOUDFLARE_EMAIL:', process.env.CLOUDFLARE_EMAIL);
console.log('CLOUDFLARE_ZONE_ID:', process.env.CLOUDFLARE_ZONE_ID);

// Authentication
console.log('\n=== Authentication ===');
console.log('BASIC_AUTH_USER:', process.env.BASIC_AUTH_USER);
console.log('BASIC_AUTH_PASS:', process.env.BASIC_AUTH_PASS ? '********' : 'not set');

// Application
console.log('\n=== Application ===');
console.log('PORT:', process.env.PORT);
console.log('MINECRAFT_POLLING_INTERVAL:', process.env.MINECRAFT_POLLING_INTERVAL);

// Frontend
console.log('\n=== Frontend ===');
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

console.log('\n=== All Environment Variables ===');
Object.keys(process.env)
  .filter(key => !key.match(/^(PATH|APPDATA|TEMP|TMP|USERPROFILE|HOMEPATH|HOMEDRIVE|COMPUTERNAME|PROCESSOR|NUMBER_OF|OS|PATHEXT|PROMPT|PSModulePath|PUBLIC|SystemDrive|SystemRoot|windir|ALLUSERSPROFILE|LOCALAPPDATA|ProgramData|ProgramFiles|CommonProgramFiles|CommonProgramW6432|SESSIONNAME|LOGONSERVER|USERDOMAIN|USERNAME)$/i))
  .sort()
  .forEach(key => {
    const value = process.env[key];
    const maskedValue = key.match(/key|token|secret|password|pass|auth/i) && value ? '********' : value;
    console.log(`${key}=${maskedValue}`);
  });
