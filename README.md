# pwa-notes
PWA for note-taking.

## Notes
- Users are connected to Supabase. To sign-up, users need an email and password. I think Supabase needs to send an email confirmation that the account has been created. But it does create the account and users are able to login with the email and password as their credentials.
- In-Line editing, users should be able to tap the "note title" or "note body" to update it's content.
- I need to figure out the UI/UX for how users will archive an delete their notes. Considering "swiping" or utilizing buttons.
- [20260406] Testing styling. Finished styling on mobile layout for main menu (desktop layout is in progress). Mobile and desktop layout is in progress for Account/Profile/Settings menu. Added additional placeholder content on Account/Profile/Settings menu. 
- Users are able to delete notes permanently.
- Users are able to change and update their Display Name.
- Users are able to log out of their accounts.

## Features
| # Feature Name | Date Added | Status | Notes |
| --- | --- | --- | --- |
| 1 Account Creation & Sync | 20260405 | WORKING | User can create an account based on their email and password. To sync data, users have to log in with the same credentials. |
| 2 Account Log Out & Deletion | 20260408 | IN PROGRESS | Users can log out of their account on their device or delete their account entirely. |
| 3 Offline Usability | 20260405 | IN PROGRESS | User is able to create, view, update, and delete notes offline. |
| 4 Note Creation | 20260405 | WORKING | User can create a simple text note with a title and body. |
| 5 Note In-Line Updating | 20260405 | WORKING | User can click/tap the the title or body to update its content. |
| 6 Note Deletion & Archive | 20260406 | IN PROGRESS | Users can permanently delete their notes, or archive it (hidden but still accessible). |
| 7 Note Tagging | PLANNED | PLANNED | Users are able to create tags, and apply none, one, or multiple to a note. |
| 8 Timed Notes | PLANNED | PLANNED | Users can place a "due time" on notes. Once the due time arrives, the user will receive a notification. |
| 9 Note Sharing | PLANNED | PLANNED | Users can befriend other users to share notes. Shared users can view existing notes. | 
| 10 User Display Name | 20260408 | WORKING | Users can change their display name. |


## Bugs
| Bug # | Date Found | Date Fixed | Notes |
| --- | --- | --- | --- |
| 1 | 20260405 | 20260406 | Notes are being created and populated in Supabase database, but it is not showing on all user created notes. Seemingly only shows the first one. [**FIXED**] Syntax error in JavaScript file. |
| 2 | 20260406 | 20260406 | Notes list no longer updating after new delete function. New notes no longer appear after new delete function. In-line editing no longer saves. [**FIXED**] Not really a coding bug, the browser wasn't updating the code correctly, switched to private browsing everything is fine and dandy. |
| 3 | 20260413 | 20260413 | Logging in, doesn't immediately show the user profile. The page must be reloaded in order to show the correct screen. [**FIXED**] Missing `window.location.reload();` in logging in function. |
| 4 | 20260413 | IN PROGRESS | Users are unable to in-line edit the note title/body if they don't exist. |