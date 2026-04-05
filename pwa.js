const SUPABASE_URL = 'https://nyjhoaorgpjphivcufrz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_MpypxsvXKiNT_-YPKcNS8g_TlX4jrLf';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').catch(console.error);
}

document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.querySelector('form#signup') || document.getElementById('signup') ;
  const loginForm  = document.querySelector('form#login')  || document.getElementById('login');

  // Signup handler (send magic link)
  document.getElementById('newemail').closest('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('newemail').value;
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message); else alert('Check your email for a sign-in link.');
  });

  // Login handler (same magic link flow)
  document.getElementById('existemail').closest('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('existemail').value;
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message); else alert('Check your email for a sign-in link.');
  });
});

