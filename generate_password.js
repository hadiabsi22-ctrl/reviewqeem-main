const crypto = require('crypto');

// Generate ultra-strong password
const randomBytes1 = crypto.randomBytes(32).toString('base64');
const randomBytes2 = crypto.randomBytes(16).toString('hex');
const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const randomSpecial = specialChars.split('').sort(() => 0.5 - Math.random()).slice(0, 8).join('');

const strongPassword = randomBytes1 + randomBytes2 + randomSpecial;

console.log('='.repeat(60));
console.log('🔐 كلمة المرور القوية جداً:');
console.log('='.repeat(60));
console.log(strongPassword);
console.log('='.repeat(60));
console.log('📏 الطول:', strongPassword.length, 'حرف');
console.log('💾 احفظ هذه الكلمة في مكان آمن!');
console.log('='.repeat(60));

// Also generate encryption key
const encryptionKey = crypto.randomBytes(32).toString('hex');
console.log('\n🔑 مفتاح التشفير:');
console.log(encryptionKey);
console.log('='.repeat(60));
