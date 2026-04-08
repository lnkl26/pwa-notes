// Prevent redeclaration
if (!window.supabaseClient) {
  window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
const supabaseClient = window.supabaseClient;

// Helper: ensure user exists in tbl_user_info
async function ensureUserInfo(user, displayName) {
  if (!user || !user.id) return;
  try {
    const { error } = await supabaseClient
      .from('tbl_user_info')
      .upsert({
        id: user.id,
        col_display_name: displayName
      }, { onConflict: 'id' });
      
    if (error) console.error('ensureUserInfo error:', error);
  } catch (err) {
    console.error('ensureUserInfo exception:', err);
  }
}

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(reg => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            window.location.reload();
          }
        });
      });
    })
    .catch(console.error);
}

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is already logged in
  supabaseClient.auth.getSession().then(async ({ data }) => {
    if (data.session) {
      const user = data.session.user;
      const { data: userInfo, error } = await supabaseClient
        .from('tbl_user_info')
        .select()
        .eq('id', user.id)
        .single();

      if (!error && userInfo) {
        document.getElementById('userDisplayName').value = userInfo.col_display_name || 'Ponderer'; // Default display name
      }

      const formsId = document.getElementById('signup-login-forms');
      formsId.style.display = 'none';
      const accountInfo = document.getElementById('account-info');
      accountInfo.style.display = 'block';
    }
  });

  // Signup form handler
  document.getElementById('signup').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('newemail').value;
    const password = document.getElementById('newpassword').value;

    if (!email || !password) {
      alert('Please enter email and password.');
      return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password
    });

    if (error) {
      if (error.message && error.message.includes('already registered')) {
        alert('An account already exists with this email.');
      } else {
        alert(error.message || 'Sign up error');
      }
    } else {
      alert('Account created! You are now logged in.');
      console.log(data.user);
      await ensureUserInfo(data.user, 'Ponderer'); // Set default display name
      document.getElementById('userDisplayName').value = 'Ponderer';
    }
  });

  // Login form handler
  document.getElementById('login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('existemail').value;
    const password = document.getElementById('existpassword').value;

    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      alert(error.message || 'Login error');
    } else {
      alert('Logged in successfully!');
      console.log('Logged in user:', data.user);

      const { data: userInfo, error: userInfoError } = await supabaseClient
        .from('tbl_user_info')
        .select()
        .eq('id', data.user.id)
        .single();

      if (!userInfoError && userInfo) {
        document.getElementById('userDisplayName').value = userInfo.col_display_name || 'Ponderer'; // Set display name in the input
      }
    }
  });

  // Update Display Name handler
  document.getElementById('updateDisplayNameBtn').addEventListener('click', async () => {
    const newDisplayName = document.getElementById('userDisplayName').value;

    if (!newDisplayName) {
      alert('Please enter a display name.');
      return;
    }

    const { data: userSession, error: sessionError } = await supabaseClient.auth.getSession();
    if (sessionError || !userSession) {
      alert('You must be logged in to update your display name.');
      return;
    }

    supabaseClient.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        const user = data.session.user;
        const { data: userInfo, error } = await supabaseClient
          .from('tbl_user_info')
          .update({col_display_name: newDisplayName})
          .eq('id', user.id);
      }
    });
    alert('Display name updated successfully!');
  });

  // logging out handler
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      alert('Error logging out:' + error.message);
    } else {
      alert('Logged out successfully.');
      window.location.reload(); 
    }
  });
});
