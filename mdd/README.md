MDD Website - Local Development Backend

This workspace contains a static frontend (`mdd_website.html`) and a minimal Node/Express backend to provide persistent CRUD for articles.

Quick start (Windows PowerShell):

1. Install dependencies

```powershell
cd "c:\Users\Akullu Gloria\Desktop\mdd"
npm install
```

2. Start server

```powershell
npm start
```

3. Open the site in your browser:

http://localhost:3000/mdd_website.html

Admin/demo credentials (demo only):
- Email: admin@admin.com
- Password: admin

API endpoints (demo):
- POST /api/admin/login -> { email, password } -> returns { token }
- GET /api/articles -> list articles
- POST /api/articles (admin) -> create article
- PUT /api/articles/:id (admin) -> update article
- DELETE /api/articles/:id (admin) -> delete article
- POST /api/articles/bulk (admin) -> replace all articles with array in body

Notes:
- This backend is intended for local development and demo purposes only. Do not use the demo admin token or credentials in production.
- If you'd like, I can wire the frontend to use these API endpoints next (patch `mdd_website.html`).
