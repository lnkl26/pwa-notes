// Prevent redeclaration
if (!window.supabaseClient) {
  window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
const supabaseClient = window.supabaseClient;

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
  supabaseClient.auth.getSession().then(({ data }) => {
    if (data.session) {
      // console.log("Logged in:", data.session.user.email);
      const formsId = document.getElementById('signup-login-forms');
      formsId.style.display = 'none';
    }
  });

  // Signup form handler
  document.getElementById('signup').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('newemail').value;
    const password = document.getElementById('newpassword').value; // new input for password

    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password
    });

    if (error) {
      if (error.message.includes('already registered')) {
        alert('An account already exists with this email.');
      } else {
        alert(error.message);
      }
    } else {
      alert('Account created! You are now logged in.');
      console.log(data.user);
    }
  });

  // Login form handler
  document.getElementById('login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('existemail').value;
    const password = document.getElementById('existpassword').value; // new input for password

    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      alert(error.message);
    } else {
      alert('Logged in successfully!');
      console.log('Logged in user:', data.user);
    }
  });

});