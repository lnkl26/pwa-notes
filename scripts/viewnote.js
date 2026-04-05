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

    const userId = session.user.id;

    // Simple escaping to avoid injecting HTML from note content  
    function escapeHtml(s) {
        return String(s)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }

    async function loadNotes() {
        const { data: notes, error } = await supabaseClient
            .from('user-notes')
            .select('*')
            .order('created_at', { ascending: false })
            .eq('user_id', userId);

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
            noteEl.dataset.id = note.id;
            noteEl.innerHTML = `
                <h2 class="note-title">${escapeHtml(note.title || '[Untitled]')}</h2>
                <p class="note-body">${escapeHtml(note.body || '[Empty Body]')}</p>
            `;
            notesContainer.appendChild(noteEl);

            enableInlineEditing(noteEl, note.id);
        });
    }

    async function enableInlineEditing(noteEl, noteId) {
        const titleEl = noteEl.querySelector('.note-title');

        titleEl.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = titleEl.textContent;
            input.className = 'note-title-input';
            titleEl.replaceWith(input);
            input.focus();

            const save = async () => {
                const newTitle = input.value.trim() || '[Untitled]';
                const { error } = await supabaseClient
                    .from('user-notes')
                    .update({ title: newTitle })
                    .eq('id', noteId);

                if (error) {
                    console.error('Update error:', error);
                    alert('Failed to update title.');
                }

                const newTitleEl = document.createElement('h2');
                newTitleEl.className = 'note-title';
                newTitleEl.textContent = newTitle;
                input.replaceWith(newTitleEl);

                // Re-enable editing
                enableInlineEditing(noteEl, noteId);
            };

            input.addEventListener('blur', save);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') input.blur();
            });
        });
    }

    await loadNotes();
});