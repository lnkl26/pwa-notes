if (!window.supabaseClient) {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
const supabaseClient = window.supabaseClient;

document.addEventListener('DOMContentLoaded', async () => {
    const notesContainer = document.getElementById('all-notes-container-id');

    // Get signed-in user
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
    if (sessionError || !session) {
        alert('You must be signed in to view notes.');
        return;
    }

    const userId = session.user.id; // UUID string

    async function loadNotes() {
        const { data: notes, error } = await supabaseClient
            .from('user-notes')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Fetch error:', error);
            notesContainer.innerHTML = `<p>Failed to load notes.</p>`;
            return;
        }

        if (!notes || notes.length === 0) {
            notesContainer.innerHTML = `<p>No notes yet.</p>`;
            return;
        }

        notesContainer.innerHTML = '';
        notes.forEach(note => {
            const noteEl = document.createElement('div');
            noteEl.className = 'note';
            noteEl.innerHTML = `
                <h2>${note.title || ''}</h2>
                <p>${note.body || ''}</p>
            `;
            notesContainer.appendChild(noteEl);
        });
    }

    await loadNotes();
});