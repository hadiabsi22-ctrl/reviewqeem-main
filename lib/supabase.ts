// ==================== Supabase Client ====================

import { createClient } from '@supabase/supabase-js';

// دعم أسماء متغيرات متعددة للتوافق
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials not found. Image uploads will use local storage.');
  console.warn('⚠️ Required: SUPABASE_URL and SUPABASE_KEY (or NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)');
} else {
  console.log('✅ Supabase configured successfully');
  console.log('🌐 Supabase URL:', supabaseUrl.substring(0, 30) + '...');
}

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;
