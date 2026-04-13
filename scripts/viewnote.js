if (!window.supabaseClient) {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
const supabaseClient = window.supabaseClient;

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
    if (sessionError || !session) {
        alert('You must be signed in to view your notes.');
        return;
    }

    const userId = session.user.id;
    const notesContainer = document.getElementById('all-notes-container-id');

    try {
        const { data: notes, error: fetchError } = await supabaseClient
            .from('tbl_user_notes')
            .select('*')
            .eq('user_id', userId);

        if (fetchError) throw fetchError;

        notesContainer.innerHTML = '';

        if (notes.length > 0) {
            notes.forEach(note => {
                const noteElement = document.createElement('div');
                noteElement.className = 'note';
                noteElement.innerHTML = `
                    <h3 class="note-title">${note.title}</h3>
                    <p class="note-body">${note.body}</p>
                    <small>Created at: ${new Date(note.created_at).toLocaleString()}</small>
                    <button class="delete-btn" data-id="${note.id}">Delete</button>
                    <button class="archive-btn" data-id="${note.id}">Archive</button>
                `;
                notesContainer.appendChild(noteElement);

                // Add delete event listener
                noteElement.querySelector('.delete-btn').addEventListener('click', async () => {
                    const confirmDelete = confirm('Are you sure you want to delete this note?');
                    if (confirmDelete) {
                        await deleteNote(note.id);
                    }
                });

                // Enable inline editing
                enableInlineEditing(noteElement, note.id);
            });
        } else {
            notesContainer.innerHTML = '<p>No notes available.</p>';
        }

    } catch (error) {
        console.error('Error fetching notes:', error);
        alert('Failed to retrieve notes.');
    }
});

// Function to delete a note
async function deleteNote(noteId) {
    try {
        const { error } = await supabaseClient
            .from('tbl_user_notes')
            .delete()
            .eq('id', noteId); // Use the note ID to find the correct note

        if (error) {
            console.error('Delete error:', error);
            alert('Failed to delete note.');
        } else {
            alert('Note deleted successfully!');
            // Refresh notes after deletion
            location.reload(); // Reloads the page to show updated notes
        }
    } catch (error) {
        console.error('Error deleting note:', error);
        alert('Failed to delete note.');
    }
}

// Inline editing function
async function enableInlineEditing(noteEl, noteId) {
    const titleEl = noteEl.querySelector('.note-title');
    const bodyEl = noteEl.querySelector('.note-body');

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
                .from('tbl_user_notes')
                .update({ title: newTitle })
                .eq('id', noteId);

            if (error) {
                console.error('Update error:', error);
                alert('Failed to update title.');
            }

            const newTitleEl = document.createElement('h3');
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

    bodyEl.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = bodyEl.textContent;
        input.className = 'note-body-input';
        bodyEl.replaceWith(input);
        input.focus();

        const save = async () => {
            const newBody = input.value.trim() || '[Empty Body]';
            const { error } = await supabaseClient
                .from('tbl_user_notes')
                .update({ body: newBody })
                .eq('id', noteId);

            if (error) {
                console.error('Update error:', error);
                alert('Failed to update body.');
            }

            const newBodyEl = document.createElement('p');
            newBodyEl.className = 'note-body';
            newBodyEl.textContent = newBody;
            input.replaceWith(newBodyEl);

            // Re-enable editing
            enableInlineEditing(noteEl, noteId);
        };

        input.addEventListener('blur', save);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') input.blur();
        });

    });
}
