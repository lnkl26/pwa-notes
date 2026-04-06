if (!window.supabaseClient) {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
const supabaseClient = window.supabaseClient;

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.querySelector('.new-note-class form');
    const titleInput = document.getElementById('new-note-title');
    const bodyInput = document.getElementById('new-note-input');

    // Get signed-in user
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
    if (sessionError || !session) {
        alert('You must be signed in to create notes.');
        return;
    }

    const userId = session.user.id; // UUID string
    // console.log(userId);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = titleInput.value.trim();
        const body = bodyInput.value.trim();

        if (!title && !body) {
            alert('Please enter a title or body for your note.');
            return;
        }

        // Insert note
        const { data, error } = await supabaseClient
            .from('tbl_user_notes')
            .insert([{
                user_id: userId,
                title,
                body,
                created_at: new Date()
            }]);

        if (error) {
            console.error('Insert error:', error);
            alert('Failed to create note.');
        } else {
            alert('Note created successfully!');
            titleInput.value = '';
            bodyInput.value = '';
        }
    });
});