// ==================== Supabase Client ====================

import { createClient } from '@supabase/supabase-js';

// دعم أسماء متغيرات متعددة للتوافق
// الأفضلية لـ SERVICE_ROLE_KEY لأنه يسمح بالرفع بدون قيود
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isServiceRoleKey = !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY);
const isAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !isServiceRoleKey;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials not found. Image uploads will use local storage.');
  console.warn('⚠️ Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_KEY)');
} else {
  console.log('✅ Supabase configured successfully');
  console.log('🌐 Supabase URL:', supabaseUrl.substring(0, 30) + '...');
  console.log('🔑 Using key type:', isServiceRoleKey ? 'SERVICE_ROLE_KEY (Recommended)' : isAnonKey ? 'ANON_KEY (Limited)' : 'Unknown');
  if (!isServiceRoleKey) {
    console.warn('⚠️ Using ANON_KEY may cause permission issues. Use SERVICE_ROLE_KEY for uploads.');
  }
}

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;
