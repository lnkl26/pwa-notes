# pwa-notes
PWA for note-taking.

## Notes
- Users are connected to Supabase. To sign-up, users need an email and password. I think Supabase needs to send an email confirmation that the account has been created. But it does create the account and users are able to login with the email and password as their credentials.
- In-Line editing, users should be able to tap the "note title" or "note body" to update it's content.

## Bugs
| Bug # | Date Found | Date Fixed | Bug Notes |
| --- | --- | --- | --- |
| 1 | 20260405 | 20260406 | Notes are being created and populated in Supabase database, but it is not showing on all user created notes. Seemingly only shows the first one. [FIXED] Syntax error in JavaScript file. |