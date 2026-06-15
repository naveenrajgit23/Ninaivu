import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dntjyksarzjjhomekwgy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8eQBcfzd_f8Poli9LE3o6A_G9-6jqOh';

async function testSupabase() {
  console.log("Testing Supabase connection...");
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Test a dummy sign up to see the exact error
    console.log("Attempting test sign up...");
    const { data, error } = await supabase.auth.signUp({
      email: 'test_fake_email_123@example.com',
      password: 'testPassword123!',
    });
    
    if (error) {
      console.error("Auth Error:", error.message);
    } else {
      console.log("Auth Success:", data);
    }
  } catch (err) {
    console.error("Client Initialization Error:", err);
  }
}

testSupabase();
