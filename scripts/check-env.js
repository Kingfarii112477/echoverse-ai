#!/usr/bin/env node
/**
 * EchoVerse AI — Environment Variable Validator
 * Runs on `npm install` and during CI to catch missing config early.
 */

const REQUIRED_BUILD = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

const REQUIRED_RUNTIME = [
  'SUPABASE_SERVICE_ROLE_KEY',
];

const OPTIONAL_SERVICES = [
  'ELEVENLABS_API_KEY',
  'OPENAI_API_KEY',
  'DEEPGRAM_API_KEY',
  'GOOGLE_API_KEY',
  'ANTHROPIC_API_KEY',
];

const REQUIRED_ANDROID = [
  'ANDROID_KEYSTORE_BASE64',
  'ANDROID_KEY_ALIAS',
  'ANDROID_KEY_PASSWORD',
  'ANDROID_STORE_PASSWORD',
];

function checkVars(vars, label, required = true) {
  const missing = vars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    const symbol = required ? '✗' : '○';
    missing.forEach(v => console.log(`  ${symbol} Missing: ${v}`));
    return missing.length;
  }
  console.log(`  ✓ ${label} — all present`);
  return 0;
}

console.log('\n🔍 EchoVerse AI — Environment Check\n');

const isCI = process.env.CI === 'true';
const isAndroidBuild = process.env.ANDROID_BUILD === 'true';

console.log('Build-time (public):');
const buildMissing = checkVars(REQUIRED_BUILD, 'Build vars');

console.log('\nRuntime (server-side):');
const runtimeMissing = checkVars(REQUIRED_RUNTIME, 'Runtime vars');

console.log('\nAI Services (at least one required):');
const serviceMissing = checkVars(OPTIONAL_SERVICES, 'AI Services', false);
if (serviceMissing === OPTIONAL_SERVICES.length) {
  console.log('  ⚠  No AI service keys detected — AI features will not work');
}

if (isAndroidBuild) {
  console.log('\nAndroid Signing:');
  checkVars(REQUIRED_ANDROID, 'Android signing');
}

const criticalMissing = buildMissing + (isCI ? runtimeMissing : 0);
if (criticalMissing > 0) {
  console.log(`\n❌ ${criticalMissing} required variable(s) missing. Check .env.local\n`);
  if (isCI) process.exit(1);
} else {
  console.log('\n✅ Environment looks good!\n');
}
