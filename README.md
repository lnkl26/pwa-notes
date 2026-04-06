# pwa-notes
PWA for note-taking.

## Notes
- Users are connected to Supabase. To sign-up, users need an email and password. I think Supabase needs to send an email confirmation that the account has been created. But it does create the account and users are able to login with the email and password as their credentials.
- In-Line editing, users should be able to tap the "note title" or "note body" to update it's content.
- I need to figure out the UI/UX for how users will archive an delete their notes. Considering "swiping" or utilizing buttons.

## Features
| # Feature Name | Date Added | Status | Notes |
| --- | --- | --- | --- |
| 1 Account Creation & Sync | 20260405 | WORKING | User can create an account based on their email and password. To sync data, users have to log in with the same credentials. |
| 2 Offline Usability | 20260405 | IN PROGRESS | User is able to create, view, update, and delete notes offline. |
| 3 Note Creation | 20260405 | WORKING | User can create a simple text note with a title and body. |
| 4 Note In-Line Updating | 20260405 | WORKING | User can click/tap the the title or body to update its content. |
| 5 Note Deletion & Archive | PLANNED | PLANNED | Users can permanently delete their notes, or archive it (hidden but still accessible). |
| 6 Note Tagging | PLANNED | PLANNED | Users are able to create tags, and apply none, one, or multiple to a note. |
| 7 Timed Notes | PLANNED | PLANNED | Users can place a "due time" on notes. Once the due time arrives, the user will receive a notification. |
| 8 Note Sharing | PLANNED | PLANNED | Users can befriend other users to share notes. Shared users can view existing notes. | 


## Bugs
| Bug # | Date Found | Date Fixed | Notes |
| --- | --- | --- | --- |
| 1 | 20260405 | 20260406 | Notes are being created and populated in Supabase database, but it is not showing on all user created notes. Seemingly only shows the first one. [**FIXED**] Syntax error in JavaScript file. |