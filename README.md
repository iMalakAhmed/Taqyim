# Taqyim

Taqyim (تقييم) is a mini Yelp‑style app. It shows the places around you, lets you read and write reviews, and stores everything in a SQL Server database behind an ASP.NET Core API.

## Prerequisites

- Node.js 20
- .NET SDK 8
- SQL Server (Express or Developer Edition)
- SQL Server Management Studio (SSMS)

## Repo layout

```
/frontend   # React + Vite client
/backend    # ASP.NET Core API + EF Core
```

## Quick start (local dev)

1. Install all prerequisites mentioned above
2. Open SQL Server Management Studio (SSMS) and create a new database named `TaqyimDb`
3. Copy the sample env files:

   ```bash
   cp backend/.env.example  backend/.env
   cp frontend/.env.example frontend/.env
   ```
4. API server:

   ```bash
   cd backend
   dotnet watch run
   ```
5. Front‑end:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```
6. Open **[http://localhost:5173](http://localhost:5173)** in your browser.

That's it! 🎉

## Database Management

The project uses SQL Server Management Studio (SSMS) for database management. You can:
- View and manage your database
- Execute queries
- Monitor database performance
- Manage database security
- Create and modify database objects

## Contributing

Pull requests welcome—please follow Conventional Commits and keep PRs focused.

---

MIT License.
