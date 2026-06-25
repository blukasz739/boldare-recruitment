# QVP Task

## Uruchomienie (Docker Compose)

Z korzenia repozytorium:

```bash
docker compose up
```

Pierwszy start lub po zmianie `Dockerfile` / `package.json`:

```bash
docker compose up --build
```

### Adresy po starcie

| Serwis   | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:8000 |
| API (przez proxy Vite) | http://localhost:5173/api/* |
| Health   | http://localhost:8000/api/health |

### Scenariusze uruchomienia

| Scenariusz | Komenda |
|------------|---------|
| Cały stack w Dockerze | `docker compose up` |
| Tylko backend + baza | `docker compose up db backend` |
| Backend w Dockerze, frontend na hoście | `cd frontend && npm run dev` |
