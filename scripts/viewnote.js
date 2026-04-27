import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

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
            const archivedNotes = [];
            notes.forEach(note => {
                const noteElement = document.createElement('div');
                noteElement.className = `note${note.col_archived ? ' archived' : ''}`;
                noteElement.innerHTML = `
                    <h3 class="note-title">${note.title || "[Untitled]"}</h3>
                    <p class="note-body">${note.body || "[Empty Body]"}</p>
                    <small>Created at: ${new Date(note.created_at).toLocaleString()}</small>
                    <button class="delete-btn" data-id="${note.id}">Delete</button>
                    <button class="archive-btn" data-id="${note.id}">${note.col_archived ? 'Unarchive' : 'Archive'}</button>
                `;

                if (note.archived) {
                    archivedNotes.push(noteElement);
                } else {
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
                    
                    // Add archive/unarchive event listener
                    noteElement.querySelector('.archive-btn').addEventListener('click', async () => {
                        if (note.col_archived) {
                            await unarchiveNote(note.id);
                        } else {
                            await archiveNote(note.id);
                        }
                    });
                }
            });

            // Render archived notes at the bottom
            if (archivedNotes.length > 0) {
                const archivedContainer = document.createElement('div');
                archivedContainer.id = 'archived-notes-container';
                archivedContainer.innerHTML = '<h3>Archived Notes</h3>';
                archivedNotes.forEach(archivedNote => archivedContainer.appendChild(archivedNote));
                notesContainer.appendChild(archivedContainer);
            }

        } else {
            notesContainer.innerHTML = '<p>No archived notes available.</p>';
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
            .eq('id', noteId);

        if (error) {
            console.error('Delete error:', error);
            alert('Failed to delete note.');
        } else {
            alert('Note deleted successfully!');
            location.reload();
        }
    } catch (error) {
        console.error('Error deleting note:', error);
        alert('Failed to delete note.');
    }
}

// Function to archive a note
async function archiveNote(noteId) {
    try {
        const { error } = await supabaseClient
            .from('tbl_user_notes')
            .update({ col_archived: true })
            .eq('id', noteId);

        if (error) {
            console.error('Archive error:', error);
            alert('Failed to archive note.');
        } else {
            alert('Note archived successfully!');
            location.reload();
        }
    } catch (error) {
        console.error('Error archiving note:', error);
        alert('Failed to archive note.');
    }
}

// Function to unarchive a note
async function unarchiveNote(noteId) {
    try {
        const { error } = await supabaseClient
            .from('tbl_user_notes')
            .update({ col_archived: false })
            .eq('id', noteId);

        if (error) {
            console.error('Unarchive error:', error);
            alert('Failed to unarchive note.');
        } else {
            alert('Note unarchived successfully!');
            location.reload();
        }
    } catch (error) {
        console.error('Error unarchiving note:', error);
        alert('Failed to unarchive note.');
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

            enableInlineEditing(noteEl, noteId);
        };

        input.addEventListener('blur', save);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') input.blur();
        });

    });
}
