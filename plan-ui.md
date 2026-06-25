# Plan UI — SubTrack

> Dokument opisuje warstwę prezentacji frontendu aplikacji do zarządzania subskrypcjami.  
> Uzupełnia dokumenty produktowy `[plan.md](./plan.md)` i techniczny `[plan_techniczny.md](./plan_techniczny.md)`.

---

## Streszczenie decyzji


| Obszar               | Decyzja                                                                                   |
| -------------------- | ----------------------------------------------------------------------------------------- |
| Nazwa aplikacji      | **SubTrack**                                                                              |
| UI kit               | **Mantine v7** (domyślna paleta kolorów)                                                  |
| Motyw                | Light + dark (`useMantineColorScheme`, persystencja w `localStorage`); **domyślnie dark** |
| Czcionka             | **Inter** (domyślna Mantine)                                                              |
| i18n                 | **react-i18next** — angielski (domyślny) + polski                                         |
| Waluta               | Symbol `**$`** bez kodu waluty (np. `$60.00`)                                             |
| HTTP client          | **Natywny `fetch`** + cienki wrapper (`api/client.ts`) — bez axios                        |
| Walidacja formularzy | **Zod** + `@mantine/form` + `mantine-form-zod-resolver`                                   |
| Stan serwera         | TanStack Query (React Query)                                                              |
| Routing              | React Router                                                                              |


---

## Stack frontendowy

### Zależności główne


| Pakiet                                             | Rola                             |
| -------------------------------------------------- | -------------------------------- |
| `react`, `react-dom`                               | UI                               |
| `typescript`, `vite`                               | język i bundler                  |
| `react-router-dom`                                 | routing                          |
| `@tanstack/react-query`                            | cache i mutacje API              |
| `@mantine/core`, `@mantine/hooks`, `@mantine/form` | komponenty i formularze          |
| `@mantine/dropzone`                                | upload pliku CSV w imporcie      |
| `mantine-form-zod-resolver`                        | integracja Zod z `@mantine/form` |
| `zod`                                              | schematy walidacji               |
| `react-i18next`, `i18next`                         | tłumaczenia PL / EN              |


### Zasady

- Wszystkie wywołania API w `api/` — komponenty nie znają URL-i.
- Token JWT w wrapperze `fetch` (nagłówek `Authorization: Bearer …`).
- Typy TypeScript zgodne z kontraktem API (enumy: `billing_cycle`, `category`).
- Etykiety UI przez `useTranslation()` — brak hardcodowanych stringów w komponentach.

---

## Motyw i wygląd

### Paleta i typografia

- **Paleta:** domyślny theme Mantine — bez custom `colors` w `MantineProvider`.
- **Czcionka:** Inter (wbudowana w Mantine) — bez dodatkowego importu fontów.
- **Przełącznik motywu:** ikona słońca / księżyca w headerze; stan zapisywany w `localStorage`.

### Light / dark

```
MantineProvider
  └── defaultColorScheme="dark"   // domyślny motyw ciemny
  └── ColorSchemeScript w index.html (defaultColorScheme="dark")
```

- **Domyślny motyw:** dark — pierwsze wejście użytkownika bez zapisanej preferencji.
- Przełącznik w headerze pozwala przejść na light; wybór persystowany w `localStorage` (Mantine `colorScheme` manager).
- Komponenty korzystają z tokenów Mantine (`theme.colors`, `var(--mantine-color-*)`) — automatyczna adaptacja do obu motywów.

### Kategorie — kolory badge'ów

Badge kategorii na kafelkach — mapowanie na odcienie z domyślnej palety Mantine:


| Enum API        | PL                | EN            | Kolor badge (propozycja) |
| --------------- | ----------------- | ------------- | ------------------------ |
| `entertainment` | Rozrywka          | Entertainment | `pink`                   |
| `music`         | Muzyka i audio    | Music & audio | `grape`                  |
| `work_tools`    | Praca i narzędzia | Work & tools  | `blue`                   |
| `other`         | Inne              | Other         | `gray`                   |


---

## Internacjonalizacja (i18n)

### Biblioteka: react-i18next

- Pliki tłumaczeń: `src/locales/en.json` (fallback), `src/locales/pl.json`.
- Domyślny język: **angielski** (`lng: 'en'`, `fallbackLng: 'en'`).
- Przełącznik **EN | PL** w headerze (landing, auth, dashboard).
- Wybór języka persystowany w `localStorage` (`i18next-browser-languagedetector`); przy braku zapisanej preferencji — EN.

### Co się tłumaczy

- Wszystkie etykiety UI, przyciski, komunikaty błędów walidacji (Zod → custom error map lub tłumaczone komunikaty).
- Nazwy kategorii i cykli rozliczenia (mapowanie z enumów API).
- Teksty modali, pustego stanu, steppera importu.

### Czego się nie tłumaczy

- Nazwy subskrypcji wpisane przez użytkownika.
- Symbol waluty: zawsze `**$`** + format `60.00` (kropka jako separator dziesiętny) w obu językach.

### Formatowanie kwot

```ts
// utils/formatCurrency.ts
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
```

Przykłady: `$60.00`, `$10.50`, `$120.00 / year` (etykieta cyklu z i18n).

---

## Routing


| Ścieżka      | Widok           | Dostęp          |
| ------------ | --------------- | --------------- |
| `/`          | `LandingPage`   | publiczny       |
| `/login`     | `LoginPage`     | publiczny       |
| `/register`  | `RegisterPage`  | publiczny       |
| `/dashboard` | `DashboardPage` | chroniony (JWT) |


### Przekierowania

- Zalogowany użytkownik wchodzi na `/`, `/login`, `/register` → redirect na `/dashboard`.
- Niezalogowany wchodzi na `/dashboard` → redirect na `/login`.

### Świadomie brak osobnych stron

Dodawanie, edycja i import odbywają się w **modalach** na dashboardzie — bez tras `/subscriptions/new`, `/import`, `/import/review`.

---

## Wspólny layout

### Header (wszystkie widoki)

```
┌──────────────────────────────────────────────────────────┐
│  SubTrack              [ EN | PL ]  [ 🌙 / ☀️ ]  [ Auth ] │
└──────────────────────────────────────────────────────────┘
```


| Widok            | Prawa strona headera                                    |
| ---------------- | ------------------------------------------------------- |
| Landing          | `Zaloguj się` · `Zarejestruj się` (linki / przyciski)   |
| Login / Register | tylko język + motyw (nawigacja linkiem pod formularzem) |
| Dashboard        | `Wyloguj`                                               |


### Komponenty layoutu

- `AppShell` (Mantine) z `Header`.
- `LanguageSwitcher` — `SegmentedControl` lub `Menu` (EN / PL).
- `ThemeToggle` — `ActionIcon` + `useMantineColorScheme`.
- `AuthGuard` — wrapper na chronione trasy.

---

## Widoki

### 1. Landing page (`/`)

**Styl:** minimalistyczny — bez sekcji feature, bez footera z listą funkcji.

```
┌──────────────────────────────────────────────────────────┐
│  SubTrack              [ EN | PL ]  [ 🌙 ]  Zaloguj  Rejestracja │
├──────────────────────────────────────────────────────────┤
│                                                          │
│              Wszystkie subskrypcje w jednym miejscu      │
│              Wiedz, ile płacisz miesięcznie              │
│                                                          │
│         [ Zacznij za darmo ]    [ Zaloguj się ]          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- `Container` + wycentrowany `Stack`.
- `Title` (order 1) + `Text` (subtitle, `c="dimmed"`).
- Primary CTA → `/register`, secondary → `/login`.
- Tło: domyślne `theme.colors` (body background Mantine).

---

### 2. Login (`/login`)

Wycentrowana karta na tle strony.


| Element             | Komponent Mantine                         |
| ------------------- | ----------------------------------------- |
| Karta               | `Paper` + `shadow="md"`, max-width ~420px |
| Nazwa użytkownika   | `TextInput`                               |
| Hasło               | `PasswordInput`                           |
| Submit              | `Button` fullWidth                        |
| Błąd API            | `Alert` color="red"                       |
| Link do rejestracji | `Anchor` → `/register`                    |


**Walidacja (Zod):**

- `username`: wymagane, min. 3 znaki
- `password`: wymagane

**Flow:** `POST /api/login` → zapis JWT → redirect `/dashboard`.

---

### 3. Register (`/register`)

Ten sam layout co login.


| Pole              | Walidacja                         |
| ----------------- | --------------------------------- |
| Nazwa użytkownika | wymagane, min. 3 znaki            |
| Hasło             | wymagane, min. 6 znaków           |
| Powtórz hasło     | musi być identyczne (`.refine()`) |


**Flow:** `POST /api/register` → auto-login (JWT z odpowiedzi lub kolejny login) → redirect `/dashboard`.

Link: „Masz już konto? Zaloguj się” → `/login`.

---

### 4. Dashboard (`/dashboard`) — lista subskrypcji

Główny ekran aplikacji po zalogowaniu.

#### Nagłówek sekcji

```
Twoje subskrypcje
$187.00 / month  ·  4 active          ← duża, wyraźna suma
[ + Add ]  [ Import statement ]       ← dwa równorzędne CTA
```

- Suma z `GET /api/subscriptions/summary` (`monthly_total`, `count`).
- Oba przyciski otwierają modale (`useDisclosure`).

#### Kafelki subskrypcji

Powierzchnia kafelka jest **proporcjonalna do udziału w miesięcznym koszcie**.

**Obliczenia (frontend):**

```ts
monthlyEquivalent =
  billing_cycle === 'monthly' ? amount : amount / 12;

share = monthlyEquivalent / totalMonthly;  // 0–1
```

**Desktop (≥ 768px):**

- Kontener CSS Grid.
- Kolumny / wiersze z wagami opartymi na `monthlyEquivalent` (jednostki `fr`).
- `min-height` na kafelku, żeby małe subskrypcje pozostały czytelne.

**Mobile (< 768px):**

- Jedna kolumna, pełna szerokość.
- **Wysokość** kafelka ∝ udział (zamiast szerokości).

#### Zawartość kafelka (`SubscriptionTile`)


| Element      | Opis                                                  |
| ------------ | ----------------------------------------------------- |
| Nazwa usługi | `Title` order 3                                       |
| Kwota + cykl | np. `$60.00 / month`                                  |
| Udział       | np. `32%` kosztów                                     |
| Kategoria    | `Badge` z kolorem per kategoria                       |
| Akcje        | Edytuj (ikona) → modal edycji; Usuń → `Modal` confirm |


#### Sortowanie

Domyślnie: **malejąco po `monthlyEquivalent`** (najdroższe największe).

#### Pusty stan

Jeden wycentrowany obszar zamiast siatki kafelków:

- Tekst zachęty (i18n).
- Oba CTA: Dodaj · Import.

---

## Modale

Wszystkie modale: Mantine `Modal`, zamknięcie przez X, klik poza modal i klawisz Escape.

### Modal: Dodaj subskrypcję


| Pole         | Komponent                       | Walidacja Zod                                 |
| ------------ | ------------------------------- | --------------------------------------------- |
| Nazwa usługi | `TextInput`                     | `string().min(2)`                             |
| Kwota        | `NumberInput`                   | `number().positive()`, 2 miejsca po przecinku |
| Cykl         | `SegmentedControl` lub `Select` | `enum(['monthly', 'yearly'])`                 |
| Kategoria    | `Select`                        | `enum([...])`                                 |


Przyciski: **Anuluj** | **Dodaj** (primary).

Po sukcesie: `POST /api/subscriptions` → zamknięcie modala → `invalidateQueries` listy i summary.

---

### Modal: Edytja subskrypcji

Identyczny formularz jak przy dodawaniu, wstępnie wypełniony danymi kafelka.

- Tytuł modala: „Edytuj subskrypcję” / „Edit subscription”.
- Submit: `PUT /api/subscriptions/{id}`.
- Otwierany po kliknięciu ikony edycji na kafelku.

---

### Modal: Import wyciągu (stepper)

Wieloetapowy flow w jednym `Modal` z `Stepper` (Mantine).

#### Krok 1 — Upload


| Element   | Opis                                                                  |
| --------- | --------------------------------------------------------------------- |
| Klucz API | `PasswordInput` — BYOK, **nie zapisywany** nigdzie po stronie klienta |
| Info      | `Alert` color="blue": klucz używany tylko do tej analizy              |
| Plik      | `@mantine/dropzone` — akceptuje `.csv`                                |
| Akcja     | **Analizuj** — disabled dopóki brak klucza i pliku                    |


#### Krok 2 — Analiza

- `Loader` + tekst „Analizuję wyciąg…”
- `POST /api/import/analyze` (`multipart/form-data`: `file`, `api_key`)
- Błąd → powrót do kroku 1 z `Alert`

#### Krok 3 — Podgląd propozycji

- Lista propozycji z checkboxami (domyślnie wszystkie zaznaczone).
- Każda pozycja: nazwa, `$amount`, cykl, badge kategorii.
- Przycisk: **Zatwierdź wybrane (N)**.

#### Krok 4 — Sukces

- Komunikat sukcesu.
- Przycisk **Zamknij** → invalidate listy i summary.

**Zasady BYOK (UI):**

- Pole klucza czyszczone po zamknięciu modala (`form.reset()`).
- Brak zapisu w `localStorage`, `sessionStorage`, cookies.

---

### Modal: Potwierdzenie usunięcia

- Krótki tekst: „Czy na pewno chcesz usunąć {name}?”
- **Anuluj** | **Usuń** (red).
- `DELETE /api/subscriptions/{id}`.

---

## Walidacja formularzy

### Integracja Zod + Mantine

```ts
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';

const form = useForm({
  initialValues: { ... },
  validate: zodResolver(subscriptionSchema),
});
```

### Schematy Zod (`src/schemas/`)


| Plik              | Użycie                                |
| ----------------- | ------------------------------------- |
| `auth.ts`         | login, register                       |
| `subscription.ts` | dodawanie, edycja                     |
| `import.ts`       | klucz API (wymagany) + obecność pliku |


Komunikaty błędów — przez i18n (custom `z.setErrorMap` lub mapowanie w resolverze).

---

## Struktura katalogów frontendu

```
frontend/
├── src/
│   ├── api/
│   │   ├── client.ts              # fetch wrapper + JWT
│   │   ├── auth.ts
│   │   ├── subscriptions.ts
│   │   └── import.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppHeader.tsx
│   │   │   ├── LanguageSwitcher.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── AuthGuard.tsx
│   │   ├── subscriptions/
│   │   │   ├── SubscriptionTile.tsx
│   │   │   ├── SubscriptionGrid.tsx
│   │   │   ├── MonthlyTotal.tsx
│   │   │   ├── CategoryBadge.tsx
│   │   │   └── EmptyState.tsx
│   │   └── modals/
│   │       ├── AddSubscriptionModal.tsx
│   │       ├── EditSubscriptionModal.tsx
│   │       ├── ImportModal.tsx
│   │       └── DeleteConfirmModal.tsx
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── DashboardPage.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useSubscriptions.ts
│   ├── schemas/
│   │   ├── auth.ts
│   │   ├── subscription.ts
│   │   └── import.ts
│   ├── locales/
│   │   ├── pl.json
│   │   └── en.json
│   ├── types/
│   │   ├── subscription.ts
│   │   └── auth.ts
│   ├── utils/
│   │   ├── formatCurrency.ts
│   │   └── subscriptionShare.ts   # monthlyEquivalent, share
│   ├── theme/
│   │   └── index.ts               # MantineProvider config (bez custom colors)
│   ├── i18n.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── Dockerfile
```

---

## Mapowanie na API


| Akcja UI              | Endpoint                         |
| --------------------- | -------------------------------- |
| Rejestracja           | `POST /api/register`             |
| Logowanie             | `POST /api/login`                |
| Lista subskrypcji     | `GET /api/subscriptions`         |
| Suma miesięczna       | `GET /api/subscriptions/summary` |
| Dodaj                 | `POST /api/subscriptions`        |
| Edytuj                | `PUT /api/subscriptions/{id}`    |
| Usuń                  | `DELETE /api/subscriptions/{id}` |
| Analiza importu       | `POST /api/import/analyze`       |
| Zatwierdzenie importu | `POST /api/import/confirm`       |


---

## Testy UI (Vitest + RTL)


| Priorytet | Co testować                                                |
| --------- | ---------------------------------------------------------- |
| Wysoki    | `formatCurrency`, `subscriptionShare` (obliczenia udziału) |
| Wysoki    | `CategoryBadge` — poprawne tłumaczenie i kolor             |
| Średni    | Formularze — walidacja Zod (submit z pustymi polami)       |
| Średni    | `AuthGuard` — redirect bez tokena                          |
| Niski     | Snapshoty kafelków                                         |


E2E (Playwright) — poza MVP.

---

## Kolejność implementacji

Każdy etap kończy się **osobnym commitem** — zgodnym z [Conventional Commits](https://www.conventionalcommits.org/) i konwencją repozytorium (`type(scope): opis` w lowercase, scope `frontend`).


| #   | Etap          | Zakres prac                                                                                           | Commit (propozycja)                                                    |
| --- | ------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1   | Szkielet      | Vite + React + TS, Mantine (`defaultColorScheme: dark`), i18n (EN domyślnie, PL), routing, `AppShell` | `feat(frontend): add Vite scaffold with Mantine, dark theme and i18n`  |
| 2   | API + auth    | `api/client.ts` (fetch + JWT), `useAuth`, `AuthGuard`, przekierowania                                 | `feat(frontend): add fetch API client, auth hook and protected routes` |
| 3   | Strony auth   | `LandingPage`, `LoginPage`, `RegisterPage`, schematy Zod, layout headera                              | `feat(frontend): add landing, login and register pages`                |
| 4   | Dashboard     | suma miesięczna, pusty stan, `SubscriptionGrid` + `SubscriptionTile` (desktop)                        | `feat(frontend): add dashboard with proportional subscription tiles`   |
| 5   | CRUD modale   | `AddSubscriptionModal`, `EditSubscriptionModal`, `DeleteConfirmModal`                                 | `feat(frontend): add subscription create, edit and delete modals`      |
| 6   | Import        | `ImportModal` (stepper, Dropzone, BYOK)                                                               | `feat(frontend): add bank statement import modal with AI stepper`      |
| 7   | Responsywność | mobile — kafelki jedna kolumna, wysokość ∝ udział                                                     | `feat(frontend): add responsive subscription tile layout for mobile`   |
| 8   | Testy         | `formatCurrency`, `subscriptionShare`, `CategoryBadge`, `AuthGuard`                                   | `test(frontend): add unit tests for utils and key components`          |


### Zasady commitów (zgodne z historią repo)

- Format: `**type(scope): krótki opis`** — np. `feat(backend): add subscription CRUD and monthly total calculator`.
- Scope frontendu: `**frontend**` (analogicznie do `backend`, `docker`, `chore`).
- Typy: `feat` (nowa funkcja), `fix` (poprawka), `test` (testy), `chore` (konfiguracja, zależności), `refactor` (bez zmiany zachowania).
- Jeden commit = jeden ukończony etap z tabeli powyżej — bez mieszania niepowiązanych zmian.
- Opis po angielsku, lowercase po dwukropku, bez kropki na końcu (jak w istniejących commitach).
- Commit dopiero po działającym etapie (aplikacja się buduje, etap spełnia swój zakres).

---

## Różnice względem `plan_techniczny.md`


| `plan_techniczny.md`               | `plan-ui.md` (aktualne)                          |
| ---------------------------------- | ------------------------------------------------ |
| axios                              | **fetch** + wrapper                              |
| `/` = dashboard                    | `/` = landing, `/dashboard` = lista              |
| Osobne strony formularza i importu | **Modale** na dashboardzie                       |
| Etykiety po polsku (ogólnie)       | **EN + PL** (react-i18next, domyślnie EN)        |
| Brak Mantine / motywu              | **Mantine v7**, light + dark, **domyślnie dark** |
| `SubscriptionRow` (lista)          | **SubscriptionTile** (kafelki skalowane)         |


---

## Podsumowanie

**SubTrack** to prosta aplikacja SPA: minimalistyczny landing, auth na wycentrowanych kartach i dashboard z kafelkami subskrypcji, których rozmiar odzwierciedla udział w miesięcznym koszcie. Dodawanie, edycja i import (AI + BYOK) odbywają się w modalach. UI opiera się na Mantine z domyślną paletą, **domyślnym motywem dark** (z przełącznikiem na light), walidacją Zod i dwujęzycznością **EN/PL** (domyślnie angielski). Kwoty prezentowane są ze znakiem `$` bez narzucania konkretnej waluty. Implementacja podzielona na 8 etapów — każdy kończy się commitem `type(frontend): …` zgodnym z konwencją repozytorium.