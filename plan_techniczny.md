# Plan techniczny — aplikacja do zarządzania subskrypcjami

> Dokument opisuje architekturę, stack technologiczny i decyzje implementacyjne.  
> Uzupełnia dokument produktowy: [`plan.md`](./plan.md).

---

## Streszczenie

| Obszar | Decyzja |
|--------|---------|
| Architektura | SPA (React) + REST API (Symfony) |
| Repozytorium | **Monorepo** — `frontend/` + `backend/` w jednym Git |
| Baza danych | PostgreSQL |
| Autentykacja | JWT (`lexik/jwt-authentication-bundle`) |
| AI (import) | OpenRouter — `chat/completions`, BYOK |
| Konteneryzacja | Docker Compose w korzeniu repo |
| Testy backend | PHPUnit (unit + opcjonalnie integracyjne) |
| Testy frontend | Vitest + React Testing Library |
| Reverse proxy | nginx — **opcjonalny** (przydatny w produkcji, nie wymagany na start) |

---

## Architektura systemu

### Wzorzec: SPA + REST API

```
┌─────────────────┐         HTTP/JSON          ┌─────────────────┐
│  React (TS)     │  ◄──────────────────────►  │  Symfony (PHP)  │
│  port 5173      │      /api/*                  │  port 8000      │
└─────────────────┘                            └────────┬────────┘
                                                        │
                                               ┌────────▼────────┐
                                               │  PostgreSQL     │
                                               │  port 5432      │
                                               └─────────────────┘
```

- **Frontend** — interfejs użytkownika (formularze, dashboard, import). Działa w przeglądarce.
- **Backend** — logika biznesowa, autentykacja, dostęp do bazy, integracja z OpenRouter.
- **Baza danych** — trwałe przechowywanie użytkowników i subskrypcji.

Frontend **nie** łączy się bezpośrednio z bazą — komunikuje się wyłącznie przez API.

### REST API — czym jest i po co

**API** to umowa komunikacji między frontendem a backendem (format żądań i odpowiedzi).

**REST** to styl budowania API oparty na protokole HTTP. Używa standardowych metod:

| Metoda HTTP | Znaczenie | Przykład w aplikacji |
|-------------|-----------|----------------------|
| `GET` | Pobierz dane | lista subskrypcji, suma miesięczna |
| `POST` | Utwórz zasób | rejestracja, dodanie subskrypcji, import |
| `PUT` / `PATCH` | Aktualizuj | edycja subskrypcji |
| `DELETE` | Usuń | usunięcie subskrypcji |

**Endpoint** to konkretny adres URL + metoda HTTP, pod którym backend oferuje jedną operację.

Korzyści:
- rozdzielenie odpowiedzialności (frontend nie zna SQL),
- bezpieczeństwo (baza niedostępna z internetu),
- testowalność (np. Postman, testy integracyjne),
- czytelna konwencja dla reviewera.

Odpowiedzi API w formacie **JSON**.

---

## Monorepo

Oba projekty w **jednym repozytorium Git**. Bez narzędzi typu Nx/Turborepo — prosta struktura folderów.

```
qvp_task/
├── docker-compose.yml
├── README.md
├── plan.md
├── plan_techniczny.md
├── backend/                    # Symfony (PHP)
│   ├── composer.json
│   ├── src/
│   ├── tests/
│   └── Dockerfile
├── frontend/                   # React + TypeScript (Vite)
│   ├── package.json
│   ├── src/
│   └── Dockerfile
└── .github/workflows/          # opcjonalnie CI
    └── ci.yml
```

**Dlaczego monorepo:**
- jeden `git clone` dla reviewera,
- wspólny `docker compose up` z korzenia,
- spójna historia zmian (frontend + backend w jednym PR),
- jedna instrukcja w README.

**Świadomie pomijamy na start:** wspólny pakiet `shared/` z typami — enumy (cykl, kategoria) mogą być zdefiniowane osobno w PHP i TypeScript.

---

## Stack technologiczny

### Frontend

| Element | Technologia |
|---------|-------------|
| Framework | React 18+ |
| Język | TypeScript |
| Bundler / dev server | Vite |
| Routing | React Router |
| Stan serwera / cache API | TanStack Query (React Query) |
| HTTP client | axios |
| Testy | Vitest + @testing-library/react + @testing-library/user-event |
| Mock API (opcjonalnie) | MSW |

### Backend

| Element | Technologia |
|---------|-------------|
| Framework | Symfony 7.x |
| Język | PHP 8.2+ |
| ORM | Doctrine |
| Autentykacja | Symfony Security + `lexik/jwt-authentication-bundle` |
| Walidacja | Symfony Validator |
| HTTP client (OpenRouter) | Symfony HttpClient |
| Testy | PHPUnit |

### Infrastruktura

| Element | Technologia |
|---------|-------------|
| Baza | PostgreSQL 16 |
| Konteneryzacja | Docker + Docker Compose |
| Reverse proxy | nginx — opcjonalny (patrz sekcja poniżej) |

---

## Docker

`docker-compose.yml` w **korzeniu** repozytorium orkiestruje serwisy:

| Kontener | Rola |
|----------|------|
| `db` | PostgreSQL |
| `backend` | PHP-FPM + Symfony (port 8000) |
| `frontend` | Vite dev server (port 5173) lub zbudowany React w produkcji |

```yaml
# Szkic — docelowa konfiguracja
services:
  db:
    image: postgres:16

  backend:
    build: ./backend
    volumes:
      - ./backend:/app
    depends_on:
      - db

  frontend:
    build: ./frontend
    volumes:
      - ./frontend:/app
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:8000
```

Każdy serwis ma własny `Dockerfile` w swoim folderze.

### nginx — kiedy i po co

**nginx** to serwer WWW działający jako reverse proxy — jeden punkt wejścia dla użytkownika:

```
Użytkownik → https://aplikacja.pl/
                    │
                    ▼
              ┌───────────┐
              │   nginx   │
              └─────┬─────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
   /  → pliki React        /api → Symfony
```

| Środowisko | nginx |
|------------|-------|
| Development | **Nie wymagany** — frontend :5173, backend :8000 |
| Produkcja / demo | **Przydatny** — jeden URL, prostsze CORS, serwowanie buildu Reacta |

Na zadanie rekrutacyjne wystarczy Docker Compose bez nginx, o ile README jasno opisuje porty.

---

## Autentykacja (JWT)

### Wymagania produktowe

- Rejestracja: `username` + `hasło` (bez emaila, bez potwierdzenia).
- Logowanie: `username` + `hasło`.
- Sesja trwa do wylogowania.
- Izolacja danych — użytkownik widzi tylko swoje subskrypcje.

### JWT — co to jest

**JWT** (JSON Web Token) to podpisany token przekazywany w nagłówku `Authorization: Bearer <token>`. Backend na jego podstawie identyfikuje zalogowanego użytkownika przy każdym żądaniu.

### Flow

```
1. POST /api/register  { username, password }
   → konto utworzone, opcjonalnie od razu JWT

2. POST /api/login     { username, password }
   → { token: "eyJ..." }

3. Każde kolejne żądanie:
   GET /api/subscriptions
   Header: Authorization: Bearer eyJ...

4. Backend weryfikuje podpis JWT → user_id → zwraca dane użytkownika

5. POST /api/logout
   → frontend usuwa token (JWT jest stateless — serwer nie trzyma sesji)
```

### Dlaczego JWT, a nie sesja cookie

| | JWT | Sesja (cookie) |
|---|-----|----------------|
| SPA na osobnym porcie | Naturalne | Wymaga więcej konfiguracji CORS/cookie |
| Symfony | `lexik/jwt-authentication-bundle` | Wbudowane, ale trudniejsze z osobnym frontendem |

### Implementacja Symfony

- Encja `User` implementuje `UserInterface`.
- Hasło hashowane przez `password_hash` (Symfony `UserPasswordHasher`).
- `username` unikalny w bazie.
- Endpointy `/api/register` i `/api/login` publiczne; reszta chroniona firewall JWT.

### Ważne rozróżnienie

- **JWT** — tożsamość użytkownika aplikacji.
- **Klucz OpenRouter (BYOK)** — osobna sprawa; używany jednorazowo przy imporcie, **nie** zapisywany w JWT, bazie ani localStorage.

---

## Model danych

### Encje

```
User (1) ──────< Subscription (N)
```

#### Tabela `users`

| Kolumna | Typ | Uwagi |
|---------|-----|-------|
| `id` | int (PK) | auto |
| `username` | string, unique | login |
| `password` | string | hash (nigdy plain text) |
| `created_at` | datetime | opcjonalnie |

#### Tabela `subscriptions`

| Kolumna | Typ | Uwagi |
|---------|-----|-------|
| `id` | int (PK) | auto |
| `user_id` | int (FK) | relacja do `users` |
| `name` | string | nazwa usługi |
| `amount` | decimal | kwota (np. 60.00) |
| `billing_cycle` | enum | `monthly` / `yearly` |
| `category` | enum | patrz poniżej |
| `created_at` | datetime | opcjonalnie |

#### Enumy

**BillingCycle:**
- `monthly` — miesięcznie
- `yearly` — rocznie

**Category:**
- `entertainment` — Rozrywka
- `music` — Muzyka i audio
- `work_tools` — Praca i narzędzia
- `other` — Inne

W PHP: backed enum (`enum BillingCycle: string`). W TypeScript: union type lub const object.

### Suma miesięczna

**Nie przechowywana w bazie** — liczona w aplikacji:

```
suma = Σ (monthly → amount) + Σ (yearly → amount / 12)
```

Logika w dedykowanej klasie serwisowej: `MonthlyTotalCalculator` (backend). Frontend wyświetla wynik z API (`GET /api/subscriptions/summary`).

---

## API — endpointy

Wszystkie ścieżki pod prefiksem `/api`. Chronione endpointy wymagają nagłówka `Authorization: Bearer <token>`.

### Autentykacja

| Metoda | Endpoint | Body | Odpowiedź |
|--------|----------|------|-----------|
| `POST` | `/api/register` | `{ username, password }` | `201` + token lub `204` |
| `POST` | `/api/login` | `{ username, password }` | `200` + `{ token }` |
| `POST` | `/api/logout` | — | `204` (opcjonalny — głównie po stronie klienta) |

### Subskrypcje

| Metoda | Endpoint | Opis |
|--------|----------|------|
| `GET` | `/api/subscriptions` | Lista subskrypcji zalogowanego użytkownika |
| `GET` | `/api/subscriptions/summary` | `{ monthly_total, count }` |
| `GET` | `/api/subscriptions/{id}` | Pojedyncza subskrypcja |
| `POST` | `/api/subscriptions` | Dodanie ręczne |
| `PUT` | `/api/subscriptions/{id}` | Edycja |
| `DELETE` | `/api/subscriptions/{id}` | Usunięcie |

**Przykład `POST /api/subscriptions`:**

```json
{
  "name": "Netflix",
  "amount": 60,
  "billing_cycle": "monthly",
  "category": "entertainment"
}
```

### Import wyciągu (AI)

| Metoda | Endpoint | Opis |
|--------|----------|------|
| `POST` | `/api/import/analyze` | Upload CSV + klucz API → propozycje subskrypcji |
| `POST` | `/api/import/confirm` | Zatwierdzenie wybranych propozycji → zapis do bazy |

**`POST /api/import/analyze`** — `multipart/form-data`:
- `file` — plik CSV wyciągu
- `api_key` — klucz OpenRouter użytkownika (BYOK)

Odpowiedź:

```json
{
  "proposals": [
    {
      "name": "Netflix",
      "amount": 60,
      "billing_cycle": "monthly",
      "category": "entertainment",
      "selected": true
    }
  ]
}
```

**`POST /api/import/confirm`:**

```json
{
  "proposals": [ /* wybrane pozycje z analyze */ ]
}
```

### Kody odpowiedzi HTTP

| Kod | Znaczenie |
|-----|-----------|
| `200` | Sukces (GET, PUT) |
| `201` | Utworzono (POST) |
| `204` | Sukces bez treści (DELETE) |
| `400` | Błąd walidacji |
| `401` | Brak / nieprawidłowy token |
| `403` | Brak dostępu (np. cudza subskrypcja) |
| `404` | Nie znaleziono |
| `422` | Błąd przetwarzania (np. import AI) |

---

## Import wyciągu — OpenRouter

### Rola OpenRouter

OpenRouter to **dostawca LLM** — unified API do modeli (OpenAI-compatible). W aplikacji służy wyłącznie do analizy transakcji z CSV i wykrywania powtarzalnych płatności.

### BYOK — zasady implementacji

1. Użytkownik podaje klucz API **przy każdym imporcie**.
2. Klucz przekazywany w żądaniu `analyze` — backend używa go **tylko na czas tego requestu**.
3. **Nie zapisywać** klucza w: bazie, sesji, plikach, logach, localStorage.
4. Plik CSV **nie musi** być trwale przechowywany — analiza w pamięci, potem odrzucenie.

### Integracja techniczna

```
Frontend                    Backend                         OpenRouter
   │                           │                                │
   │ POST /api/import/analyze  │                                │
   │ (file + api_key)          │                                │
   ├──────────────────────────►│                                │
   │                           │ POST /api/v1/chat/completions  │
   │                           │ Authorization: Bearer {api_key}  │
   │                           ├───────────────────────────────►│
   │                           │◄───────────────────────────────┤
   │                           │ JSON z propozycjami              │
   │◄──────────────────────────┤                                │
   │ proposals[]               │                                │
```

**Endpoint OpenRouter:** `POST https://openrouter.ai/api/v1/chat/completions`

**Prompt (szkic):** przeanalizuj transakcje z CSV, znajdź powtarzalne płatności wyglądające jak subskrypcje, zwróć JSON z polami: `name`, `amount`, `billing_cycle`, `category`.

**Structured output:** odpowiedź parsowana do DTO; walidacja enumów po stronie backendu.

### OpenRouter a „ceny subskrypcji” — ważne rozróżnienie

| Pytanie | Odpowiedź |
|---------|-----------|
| Czy OpenRouter ma API z cenami Netflix/Spotify? | **Nie** — to nie jest katalog subskrypcji |
| Jak OpenRouter rozlicza się z developerem? | **Prepaid credits** — płatność per token, bez subskrypcji miesięcznej |
| Skąd cykl rozliczenia (mies./rok) w apce? | **AI wnioskuje z transakcji** na wyciągu (powtarzalność kwot i dat) |
| Przydatne endpointy OpenRouter | `GET /api/v1/models` (cennik modeli), `GET /api/v1/key` (saldo kredytów) |

### Moduł importu (backend)

```
src/Service/Import/
├── BankStatementParser.php      # CSV → tablica transakcji
├── OpenRouterClient.php         # wywołanie chat/completions
├── SubscriptionDetector.php     # orkiestracja: parse → AI → DTO
└── ImportProposalFactory.php    # mapowanie odpowiedzi AI na propozycje
```

---

## Struktura kodu

### Backend (Symfony)

```
backend/
├── config/
├── migrations/
├── public/
├── src/
│   ├── Controller/              # cienkie — HTTP in/out
│   │   ├── AuthController.php
│   │   ├── SubscriptionController.php
│   │   └── ImportController.php
│   ├── Entity/
│   │   ├── User.php
│   │   └── Subscription.php
│   ├── Repository/
│   ├── Service/
│   │   ├── Subscription/
│   │   │   ├── MonthlyTotalCalculator.php
│   │   │   └── SubscriptionManager.php
│   │   └── Import/
│   │       ├── BankStatementParser.php
│   │       ├── OpenRouterClient.php
│   │       └── SubscriptionDetector.php
│   ├── DTO/                       # request/response API
│   ├── Enum/
│   │   ├── BillingCycle.php
│   │   └── Category.php
│   └── Security/
├── tests/
│   ├── Unit/
│   │   ├── MonthlyTotalCalculatorTest.php
│   │   └── BankStatementParserTest.php
│   └── Integration/               # opcjonalnie
├── composer.json
└── Dockerfile
```

**Zasady:**
- Logika biznesowa w `Service/` — kontrolery cienkie.
- DTO dla kontraktów API (czytelne wejście/wyjście).
- Enumy zamiast magicznych stringów.
- Repozytoria tylko do zapytań DB — bez logiki biznesowej.

### Frontend (React)

```
frontend/
├── src/
│   ├── api/
│   │   ├── client.ts              # axios instance + interceptor JWT
│   │   ├── auth.ts
│   │   ├── subscriptions.ts
│   │   └── import.ts
│   ├── components/
│   │   ├── SubscriptionList.tsx
│   │   ├── SubscriptionRow.tsx
│   │   ├── MonthlyTotal.tsx
│   │   ├── CategoryBadge.tsx
│   │   ├── EmptyState.tsx
│   │   └── Layout.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── SubscriptionFormPage.tsx
│   │   ├── ImportPage.tsx
│   │   └── ImportReviewPage.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useSubscriptions.ts
│   ├── types/
│   │   ├── subscription.ts
│   │   └── auth.ts
│   ├── utils/
│   │   └── formatCurrency.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── Dockerfile
```

**Zasady:**
- Wszystkie wywołania API w `api/` — komponenty nie znają URL-i.
- TanStack Query do cache i mutacji (lista, dodawanie, usuwanie).
- Token JWT w axios interceptorze.
- Typy TypeScript zgodne z kontraktem API.

---

## Ekrany i routing (frontend)

| Ścieżka | Komponent | Dostęp |
|---------|-----------|--------|
| `/register` | `RegisterPage` | publiczny |
| `/login` | `LoginPage` | publiczny |
| `/` | `DashboardPage` | chroniony |
| `/subscriptions/new` | `SubscriptionFormPage` | chroniony |
| `/subscriptions/:id/edit` | `SubscriptionFormPage` | chroniony |
| `/import` | `ImportPage` | chroniony |
| `/import/review` | `ImportReviewPage` | chroniony |

**Protected route:** brak tokena → przekierowanie na `/login`.

---

## Testy

### Strategia

| Warstwa | Narzędzie | Priorytet | Co testować |
|---------|-----------|-----------|-------------|
| Backend unit | PHPUnit | **Wysoki** | `MonthlyTotalCalculator`, parser CSV, enumy, walidacja DTO |
| Backend integration | PHPUnit + test DB | Średni | endpointy API (jeśli starczy czasu) |
| Frontend unit | Vitest | **Wysoki** | utils, komponenty prezentacyjne |
| Frontend integration | Vitest + MSW | Średni | hooki z mockowanym API |
| E2E | Playwright/Cypress | **Poza MVP** | — |

### Backend — przykładowe testy

```
tests/Unit/
├── MonthlyTotalCalculatorTest.php
│   ├── testMonthlySubscriptionsSummedCorrectly()
│   ├── testYearlyDividedByTwelve()
│   └── testMixedCycles()
├── BankStatementParserTest.php
│   ├── testParsesValidCsv()
│   └── testRejectsEmptyFile()
└── CategoryEnumTest.php
```

### Frontend — przykładowe testy

Pliki testowe obok kodu (`*.test.ts`, `*.test.tsx`):

```
src/
├── utils/
│   ├── formatCurrency.ts
│   └── formatCurrency.test.ts
├── components/
│   ├── MonthlyTotal.tsx
│   ├── MonthlyTotal.test.tsx
│   ├── SubscriptionRow.test.tsx
│   └── EmptyState.test.tsx
└── pages/
    └── DashboardPage.test.tsx
```

| Test | Co sprawdza |
|------|-------------|
| `formatCurrency` | `60` → `"60 zł"` |
| `MonthlyTotal` | wyświetla przekazaną sumę |
| `SubscriptionRow` | nazwa, kategoria, kwota, cykl |
| `EmptyState` | komunikat przy pustej liście |
| `DashboardPage` | render listy z mockowanych danych (MSW) |

### Uruchamianie

```bash
# Backend
cd backend && composer test
# lub: docker compose exec backend php bin/phpunit

# Frontend
cd frontend && npm test

# Z roota (opcjonalny orchestrator w package.json)
npm run test
```

### CI (opcjonalnie)

```yaml
# .github/workflows/ci.yml
jobs:
  backend-tests:
    steps:
      - run: docker compose run --rm backend php bin/phpunit

  frontend-tests:
    steps:
      - run: cd frontend && npm ci && npm test
```

---

## Jakość kodu

### Backend (PHP)

- **PHP-CS-Fixer** lub **PHP_CodeSniffer** — spójny styl.
- **PHPStan** (level 6+) — statyczna analiza typów.
- PSR-12 / Symfony coding standards.
- Migracje Doctrine zamiast ręcznego SQL.

### Frontend (TypeScript)

- **ESLint** + **Prettier** — lint i formatowanie.
- Strict mode w `tsconfig.json`.
- Brak `any` bez uzasadnienia.

### Ogólne zasady

- Małe, jednozadaniowe klasy i funkcje.
- Nazwy opisowe (po angielsku w kodzie, etykiety UI po polsku).
- Komentarze tylko przy nietrywialnej logice biznesowej.
- Commit messages opisowe (np. `feat: add subscription monthly total calculator`).

---

## Bezpieczeństwo — checklist

- [ ] Hasła hashowane (`password_hash` / bcrypt).
- [ ] JWT z sensownym TTL (np. 24h lub 7 dni).
- [ ] Wszystkie endpointy subskrypcji filtrują po `user_id` z tokena.
- [ ] Klucz OpenRouter nie logowany, nie zapisywany.
- [ ] Walidacja uploadu (tylko CSV, limit rozmiaru pliku).
- [ ] CORS skonfigurowany tylko dla origin frontendu.
- [ ] Zmienne środowiskowe dla sekretów (JWT secret, DATABASE_URL) — `.env`, nie w repo.

---

## Kolejność implementacji (sugerowana)

### Faza 1 — Fundament
1. Monorepo: struktura folderów, Docker Compose, PostgreSQL.
2. Symfony: encje, migracje, podstawowe repozytoria.
3. React: szkielet Vite, routing, layout.

### Faza 2 — Auth
4. Rejestracja i logowanie (JWT).
5. Protected routes na frontendzie.
6. Testy: hash hasła, generowanie JWT.

### Faza 3 — CRUD subskrypcji
7. Endpointy CRUD + `MonthlyTotalCalculator`.
8. Dashboard: lista, suma, dodawanie, edycja, usuwanie.
9. Testy: kalkulator sumy, komponenty listy.

### Faza 4 — Import AI
10. Parser CSV, `OpenRouterClient`, `SubscriptionDetector`.
11. Flow importu: upload → review → confirm.
12. Testy: parser CSV, mock OpenRouter.

### Faza 5 — Polish
13. Pusty stan, sortowanie, filtrowanie po kategorii.
14. README z instrukcją `docker compose up`.
15. CI (opcjonalnie).

---

## Świadomie poza scope

- nginx (można dodać później),
- E2E testy,
- email, reset hasła, 2FA, OAuth,
- zapisywanie klucza API,
- trwałe przechowywanie plików wyciągów,
- wspólny pakiet typów `shared/`,
- Nx / Turborepo,
- wykresy i zaawansowane raporty.

---

## Słowniczek

| Termin | Znaczenie |
|--------|-----------|
| **SPA** | Single Page Application — jedna strona HTML, nawigacja bez przeładowań |
| **REST API** | Styl API oparty na HTTP i metodach GET/POST/PUT/DELETE |
| **Endpoint** | Konkretny URL + metoda HTTP obsługiwana przez backend |
| **JWT** | Token autoryzacji przekazywany w nagłówku `Authorization` |
| **BYOK** | Bring Your Own Key — użytkownik dostarcza własny klucz API |
| **DTO** | Data Transfer Object — obiekt opisujący kształt danych API |
| **Monorepo** | Wiele projektów w jednym repozytorium Git |
| **Doctrine** | ORM w Symfony — mapowanie encji PHP na tabele SQL |
| **MSW** | Mock Service Worker — mockowanie API w testach frontendu |

---

## Powiązane dokumenty

- [`plan.md`](./plan.md) — wizja produktu, wymagania MVP, flow użytkownika
