import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

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

  // signup form handler
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

  // login form handler
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
      window.location.reload(); 

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

  // update display name handler
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
      // alert('Logged out successfully.');
      window.location.reload(); 
    }
  });

  // friend requesting
  document.getElementById('friend-request-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const friendEmail = document.getElementById('friendEmail').value;
    
    console.log('Friend Email:', friendEmail);

    const { data: potentialFriend } = await supabaseClient
      .from('tbl_user_info')
      .select('id')
      .eq('col_user_email', friendEmail)
      .single();
    
    if (potentialFriend) {
      console.log('Found potential friend:', potentialFriend);
    } else {
      console.log('No friend found with this email:', friendEmail);
    }

    if (potentialFriend.error) {
      console.error('Database query error:', potentialFriend.error);
    }


    
    if(!potentialFriend) {
      alert('no user connected with this email');
      return;
    }

    const { data, error } = await supabaseClient.from('tbl_friend_requests').insert([{ col_sender_id: user.id, col_reciever_id: potentialFriend.id, col_request_status: 'pending' }]);

    if (error) {
      console.error('error sending request', error);
      alert('failed to send request');
    } else {
      alert('friend request sent');
      document.getElementById(friendEmail).value = '';
      loadOutgoingRequest();
    }
  });

  async function loadOutgoingRequests() {
    const { data: outgoingRequests } = await supabaseClient
        .from('tbl_friend_requests')
        .select('col_receiver_id, col_request_status')
        .eq('col_sender_id', user.id)
        .eq('col_request_status', 'pending');

    const outgoingContainer = document.querySelector('.outgoing-pending');
    outgoingContainer.innerHTML = '';

    outgoingRequests.forEach(async (request) => {
        const receiverInfo = await getUserInfo(request.receiver_id); // You will need this function
        outgoingContainer.innerHTML += `<div>${receiverInfo.display_name} (Pending)</div>`;
    });
  }

  async function loadIncomingRequests() {
      const { data: incomingRequests } = await supabaseClient
          .from('tbl_friend_requests')
          .select('col_sender_id, col_request_status')
          .eq('col_receiver_id', user.id)
          .eq('col_request_status', 'pending');

      const incomingContainer = document.querySelector('.incoming-pending');
      incomingContainer.innerHTML = '';

      incomingRequests.forEach(async (request) => {
          const senderInfo = await getUserInfo(request.sender_id); // You will need this function
          incomingContainer.innerHTML += `
              <div>
                  ${senderInfo.display_name} (Pending)
                  <button onclick="acceptFriendRequest('${request.sender_id}')">Accept</button>
                  <button onclick="declineFriendRequest('${request.sender_id}')">Decline</button>
              </div>`;
      });
  }

  // async function acceptFriendRequest(senderId) {
  //   const { error } = await supabaseClient
  //       .from('friend_requests')
  //       .update({ status: 'accepted' })
  //       .eq('sender_id', senderId)
  //       .eq('receiver_id', user.id);

  //   if (error) {
  //       alert('Error accepting request: ' + error.message);
  //   } else {
  //       alert('Friend request accepted!');
  //       loadIncomingRequests(); // Refresh incoming requests
  //       loadOutgoingRequests(); // Refresh outgoing requests
  //   }
  // }

  // async function declineFriendRequest(senderId) {
  //   const { error } = await supabaseClient
  //       .from('friend_requests')
  //       .delete()
  //       .eq('sender_id', senderId)
  //       .eq('receiver_id', user.id);

  //   if (error) {
  //       alert('Error declining request: ' + error.message);
  //   } else {
  //       alert('Friend request declined!');
  //       loadIncomingRequests(); // Refresh incoming requests
  //   }
  // }

  // await loadOutgoingRequests();
  // await loadIncomingRequests();

});
