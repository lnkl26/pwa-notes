# Progressive Web App (PWA) for Note Taking
![Static Badge](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white)
![Static Badge](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![Static Badge](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)

---

This project utilizes Supabase for backend and HTML, CSS, and Vanilla JavaScript for frontend. To use this project, ensure that you have a Supabase account and have created a Supabase project.

To clone this repository:
```bash
git clone https://github.com/lnkl26/pwa-notes.git
```

To link the Supabase database, create a `config.js` in the scripts folder.
```bash
/PROJECT ROOT
  ├── /scripts
  │    └── /config.js
  │    └── /newnote.js
  │    └── /profile.js
  │    └── /viewnote.js
```

Inside the `config.js` add your Supabase Database URL and Anon/Publishable Key.
```js
export const SUPABASE_URL = "YOUR_DATABASE_URL_HERE";
export const SUPABASE_ANON_KEY = "YOUR_PUBLISHABLE_KEY_HERE";
```

---

For additional information about the projects (Features, Bugs, etc.) visit the [Wiki](https://github.com/lnkl26/pwa-notes/wiki).
