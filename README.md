# SubTrack

A small web app for tracking recurring subscriptions. You add your subscriptions
(name, amount, billing cycle, category), and the app gives you a clear dashboard
with the total you spend per month. As an optional extra, it can read a bank
statement (CSV) and use an AI model to suggest which transactions look like
subscriptions, so you don't have to enter them by hand.

I chose this idea because it's a problem I actually have. Between streaming,
music, cloud storage, and work tools, my own subscription list kept growing —
and each charge on its own looks harmless, until you realise how much leaves
your account every month. Scattered across different apps and bank statements,
they're easy to forget, duplicate, or simply lose track of. SubTrack is my
attempt to put them in one place, see the real monthly cost at a glance, and
finally get them under control.

This was built as a recruitment task for the **AI-Augmented Developer Intern,
QVP Team** position at Boldare.

---

## What it does

- **Register / log in** — accounts secured with hashed passwords and JWT tokens.
  Each user only sees their own data.
- **Manage subscriptions** — full CRUD: add, edit, delete. Each subscription has
  a name, amount, billing cycle (`monthly` / `yearly`) and a category
  (entertainment, music, work tools, other).
- **Monthly total** — the app normalizes yearly subscriptions to a monthly cost
  (`amount / 12`) and shows you a single "per month" number plus a dashboard
  summary.
- **AI import (optional)** — upload a bank statement CSV, and an AI model scans
  the transactions, detects recurring subscription-like payments, and proposes
  them for one-click import. This is a **bring-your-own-key** feature (see below).
- **Bilingual UI** — English / Polish, with a light/dark theme toggle.

Clear input (a form or a CSV), clear logic (validation, monthly normalization,
AI detection), clear output (a dashboard) — matching the brief.

---

## Stack choice

| Layer            | Technology                                                       |
| ---------------- | ---------------------------------------------------------------- |
| Frontend         | React 19 + TypeScript, Vite, Mantine UI, TanStack Query, i18next |
| Backend          | PHP 8.2, Symfony 7.2 (REST API), Doctrine ORM                    |
| Auth             | JWT (`lexik/jwt-authentication-bundle`)                          |
| Database         | PostgreSQL 16                                                    |
| AI import        | OpenRouter API (model: Anthropic Claude), BYOK                   |
| Containerization | Docker + Docker Compose                                          |
| Tests            | PHPUnit (backend), Vitest + React Testing Library (frontend)     |

---

## How to run it (Docker)

You only need Docker with Docker Compose. From the repository root:

```bash
docker compose up
```

First run (or after changing a `Dockerfile` / `package.json`):

```bash
docker compose up --build
```

On startup the backend container automatically:

- installs PHP dependencies,
- generates the JWT key pair,
- runs the database migrations.

So there are no manual setup steps — just `docker compose up`.

### URLs once it's running

| Service            | URL                              |
| ------------------ | -------------------------------- |
| Frontend (the app) | http://localhost:5173            |
| Backend API        | http://localhost:8000            |
| API via Vite proxy | http://localhost:5173/api/\*     |
| Health check       | http://localhost:8000/api/health |

Open **http://localhost:5173**, register an account, and start adding
subscriptions.

### Trying the AI import

A realistic sample bank statement is included at
[`samples/bank_statement_sample.csv`](samples/bank_statement_sample.csv). Use it
in the import modal to see the AI detection in action (this requires an
OpenRouter API key — see below).

---

## Why "bring your own key" (BYOK) for the AI import

The AI import is an **optional, secondary feature** — not the core of the app.
The core (manual subscription tracking + monthly totals) works fully without any
API key. I deliberately designed the AI part this way for a few reasons:

- **The brief mentions using a "public API".** I wasn't sure how strictly
  "public" is meant here, and most genuinely useful AI APIs require
  authentication and credits. To stay on the safe side, I made the AI feature
  **optional** rather than a hard dependency. If you don't have a key, nothing
  is blocked and the project is not disqualified — you simply skip the import
  step and add subscriptions manually.
- **It uses Claude via [OpenRouter](https://openrouter.ai).** OpenRouter is a
  unified, OpenAI-compatible gateway to many LLMs. Calling it costs money
  (pay-per-token, prepaid credits), so a working key needs a small amount of
  credit on the account.
- **The key is never stored.** It's entered per-import, used only for that single
  request to OpenRouter, and never written to the database, logs, or
  `localStorage`. That's also why it can't just be baked into the repo.

**Why Claude specifically?** The task is to read messy, real-world bank
transaction descriptions (truncated merchant names, mixed Polish/English,
inconsistent formatting) and reliably return clean, structured JSON. Claude is
strong at exactly this kind of careful instruction-following and structured
extraction, and it was easy to swap in through OpenRouter (the model is just a
config value: `OPENROUTER_MODEL=anthropic/claude-sonnet-4.6`). If needed, the
model can be changed in `docker-compose.yml` without touching the code.

> **Need a key to test the AI import?** Reach out and I'll provide one with
> credit on it. Again — this is optional; everything else works without it.

---

## Running the tests

Start the stack first, then run the suites inside the running containers.

```bash
# 1. Start everything
docker compose up -d

# 2. Backend tests (PHPUnit) — 28 tests
docker compose exec backend php bin/phpunit

# 3. Frontend tests (Vitest) — 26 tests
docker compose exec frontend npm test
```

The backend tests include unit tests (monthly total calculator, CSV parser,
serializers, import proposal mapping, registration) and functional API tests
(auth + subscription endpoints) that exercise the real HTTP layer. The frontend
tests cover utilities, hooks, the API client, and key components.

---

## Project structure

```
boldare-recruitment/
├── docker-compose.yml          # orchestrates db + backend + frontend
├── backend/                    # Symfony REST API (PHP)
│   ├── src/
│   │   ├── Controller/         # thin HTTP layer
│   │   ├── Service/            # business logic (subscriptions + import)
│   │   ├── Entity/ Repository/ DTO/ Enum/
│   │   └── ...
│   └── tests/                  # PHPUnit (Unit + Functional)
├── frontend/                   # React + TypeScript (Vite)
│   └── src/                    # pages, components, hooks, api client
└── samples/
    └── bank_statement_sample.csv
```

---

## Reflection

I used AI as a thinking partner throughout, not just as a code generator. Because
the job posting mentioned Symfony and I hadn't used it before, I leaned into AI
precisely because that's the point of the task — these days you can build something
substantial quickly with AI, and a slightly larger, end-to-end app shows that
better than a trivial script I could have written by hand.

**My process** was deliberate and top-down. First I decided what the app would be,
then I wrote a high-level product plan, then a technical plan, and only then did I
implement the backend and finally the frontend. The technical-planning phase was
where most of the real thinking happened: I had long discussions with the AI and
tried to genuinely understand every topic and decision — what each option was, and
its trade-offs — rather than just accepting the first answer. When implementing the
backend, instead of generating big chunks and reviewing them afterwards, I
generated the code in very small pieces and asked the agent to actively explain
each one. That's how I actually learned a good amount of the framework along the
way — the security/JWT firewall, Doctrine entities and migrations, DTOs with
request mapping, and service wiring.

What I found most valuable is that AI let me work productively in an unfamiliar
framework and language while still operating at the level that matters: I could
reason about the right abstractions, how the code is structured, whether it follows
clean-code principles, and whether responsibilities were well separated —
without needing to know every detail of the syntax up front.

I also pushed back on the AI in plenty of places. On scope and security it kept
wanting to go further than the task needed — extra auth hardening, email
confirmation, rate limiting — and I cut those to keep the project aligned with the
brief's "don't over-engineer it" guidance. It also frequently pushed me toward
architectures and "advanced" solutions I didn't actually understand and that felt
unnecessarily complex, and I deliberately declined those rather than ship code I
couldn't explain. On the product side I insisted the AI import stay an optional
BYOK feature rather than a hard dependency, kept the API key out of any persistent
storage, and chose Claude over the model's first suggestions because
structured-extraction quality on messy bank data mattered more than cost. I even
had to switch between different models during the work, since some produced a
genuinely poor frontend. Overall, AI accelerated the parts I already understood and
taught me the parts I didn't, while I stayed responsible for the architecture, the
trade-offs, and knowing when to stop.
