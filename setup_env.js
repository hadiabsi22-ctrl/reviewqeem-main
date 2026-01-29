const fs = require('fs');
const path = require('path');

// محتوى ملف .env المحدث
const envContent = `# ============================================
# ReviewQeem - Configuration
# ============================================

# Server Port
PORT=8093
NODE_ENV=development

# ============================================
# Admin Credentials (STRONG PASSWORD)
# ============================================
ADMIN_EMAIL=admin@reviewqeem.com
ADMIN_PASSWORD=lwCiLYIduSXKNrZa8w5qzgTx9Daek7wWL14sDiPSS8Q=989143aa4862a0844afec2642248faa3<.]!@#$%

# ============================================
# JWT Secret Key
# ============================================
JWT_SECRET=85e7f8e915e29ee332fd962a6d8888a791853183d3362d7874e3d96c294ce510

# ============================================
# Encryption Key for Local Storage
# ============================================
ENCRYPTION_KEY=85e7f8e915e29ee332fd962a6d8888a791853183d3362d7874e3d96c294ce510

# ============================================
# Supabase Configuration
# ============================================
SUPABASE_URL=https://pbhkvwcrdztmcfecaaud.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiaGt2d2NyZHp0bWNmZWNhYXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MTk5MDYsImV4cCI6MjA4NTA5NTkwNn0.7K-t_F9698-crZaDM35VltNZFE-RhreONSZwrCWbIH8
SUPABASE_BUCKET=game_reviews

# ============================================
# NOTE: Using Local Encrypted Storage
# Data location: ./data/*.encrypted
# ============================================
`;

// كتابة ملف .env
const envPath = path.join(__dirname, '.env');
fs.writeFileSync(envPath, envContent, 'utf8');

console.log('✅ تم إنشاء/تحديث ملف .env بنجاح!');
console.log('📧 البريد: admin@reviewqeem.com');
console.log('🔑 كلمة المرور: (من الملف)');
console.log('📁 الملف: .env');
