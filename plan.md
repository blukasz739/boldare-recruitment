# Plan aplikacji do zarządzania subskrypcjami

> Dokument opisuje wizję produktu (nie plan techniczny).  
> Kontekst: zadanie rekrutacyjne.

---

## Wizja w jednym zdaniu

**Jedno miejsce, w którym użytkownik widzi wszystkie swoje subskrypcje internetowe, wie ile płaci miesięcznie i może je dodawać ręcznie lub — opcjonalnie — zaimportować z wyciągu bankowego przy użyciu własnego klucza API (AI).**

---

## Problem, który rozwiązujemy

Użytkownicy mają coraz więcej subskrypcji (streaming, SaaS, chmura, narzędzia AI itd.) i często:

- nie wiedzą, **ile łącznie płacą** w skali miesiąca,
- **zapominają**, za co jeszcze płacą,
- nie chcą ręcznie przepisywać danych z wyciągu, ale też nie chcą podpinać konta bankowego.

---

## Zakres produktu (MVP)

### Must-have

| Funkcja | Opis |
|--------|------|
| **Rejestracja i logowanie** | Tylko username + hasło. Bez emaila, bez potwierdzania konta, bez OAuth. |
| **Ręczne dodawanie subskrypcji** | Główna, równorzędna ścieżka obok importu. |
| **Lista subskrypcji** | Przejrzysty widok wszystkich aktywnych subskrypcji użytkownika. |
| **Suma miesięczna** | Jedna wyraźna liczba na dashboardzie — łączny koszt w perspektywie miesiąca. |
| **Edycja i usuwanie** | Użytkownik może poprawić lub usunąć wpis. |
| **Izolacja danych** | Po zalogowaniu użytkownik widzi tylko swoje subskrypcje. |

### Opcjonalne (równie ważne wizualnie, ale nie wymagane do używania aplikacji)

| Funkcja | Opis |
|--------|------|
| **Import wyciągu bankowego (AI)** | Użytkownik wgrywa plik wyciągu; AI wykrywa powtarzalne płatności wyglądające jak subskrypcje. |
| **Bring Your Own Key (BYOK)** | Import wymaga własnego klucza API użytkownika do usługi AI — aplikacja nie ponosi kosztów tokenów. **Klucz nie jest nigdzie zapisywany** (ani w bazie, ani w przeglądarce). |

---

## Dane subskrypcji

Celowo ograniczony zestaw pól — wystarczający do pokazania realnego kosztu bez zbędnego formularza.

| Pole | Opis | Uwagi |
|------|------|-------|
| **Nazwa usługi** | Np. Netflix, Spotify, iCloud | Konieczne — bez tego lista nie ma sensu |
| **Kwota** | Cena subskrypcji | Główna metryka na dashboardzie |
| **Cykl płatności** | Miesięcznie / rocznie | Potrzebne do poprawnej sumy miesięcznej (roczne ÷ 12) |
| **Kategoria** | Grupa usługi | Ułatwia orientację na liście; wybór z predefiniowanej listy |

### Predefiniowane kategorie

Użytkownik wybiera kategorię z listy (bez własnych tagów na start):

- **Rozrywka** — streaming wideo, gry, VOD
- **Muzyka i audio** — Spotify, Audioteka itp.
- **Praca i narzędzia** — SaaS, AI, produktywność, chmura i storage (iCloud, Google One, Dropbox)
- **Inne** — wszystko, co nie pasuje do powyższych

Przy imporcie AI może **zaproponować kategorię** na podstawie nazwy usługi; użytkownik zatwierdza wynik bez ręcznego uzupełniania.

### Świadomie odłożone (poza scope MVP)

- data następnej płatności i przypomnienia,
- wykresy i wizualizacje,
- integracja z kontem bankowym (live sync),
- OAuth / logowanie przez zewnętrzne serwisy,
- email i potwierdzanie rejestracji konta,
- historia importów i zmian cen,
- współdzielenie subskrypcji w rodzinie.

---

## Uwierzytelnianie

- **Rejestracja:** username + hasło — konto aktywne od razu po rejestracji.
- **Logowanie:** username + hasło.
- **Sesja:** użytkownik pozostaje zalogowany do momentu wylogowania.
- **Wylogowanie:** dostępne z poziomu aplikacji.

**Świadomie pominięte:** email, potwierdzenie rejestracji (link aktywacyjny, kod weryfikacyjny), OAuth (logowanie przez Google, Facebook itd.). Na zadanie rekrutacyjne wystarczy proste konto w aplikacji — użytkownik podaje nazwę użytkownika, hasło i od razu może korzystać z panelu.

---

## Dwie równorzędne ścieżki dodawania subskrypcji

### 1. Ręczne dodawanie

Użytkownik wypełnia formularz: nazwa, kwota, cykl płatności, kategoria.

- Prosty, szybki flow (minimum pól).
- Działa zawsze — bez klucza API, bez pliku.
- **Równie ważna** jak import — nie jest „planem B ukrytym w menu”.

### 2. Import wyciągu (AI, opcjonalny)

Użytkownik wgrywa plik wyciągu bankowego (np. CSV). AI analizuje transakcje i zwraca propozycje subskrypcji.

**Zasada:** import jest **zamiennikiem ręcznego wpisywania**, nie osobnym modułem — kończy się zapisem do tej samej listy subskrypcji.

**Flow:**

1. Użytkownik klika „Import z wyciągu”.
2. Podaje **własny klucz API** (BYOK) — przy każdym imporcie; używany wyłącznie do tego jednego żądania.
3. Wgrywa plik wyciągu.
4. Aplikacja pokazuje listę wykrytych subskrypcji (nazwa, kwota, cykl, proponowana kategoria).
5. Użytkownik zatwierdza wybrane pozycje (domyślnie wszystkie zaznaczone).
6. Zatwierdzone wpisy trafiają na listę — tak jak przy ręcznym dodaniu.

**Automatyczność:** użytkownik nie mapuje kolumn ani nie edytuje pól — tylko zatwierdza lub odrzuca propozycje.

**BYOK — zasady:**

- brak kosztów API po stronie twórcy aplikacji,
- użytkownik kontroluje swoje konto u dostawcy AI,
- **klucz API nie jest nigdzie zapisywany** — używany tylko na czas analizy wyciągu, potem odrzucany,
- na demo rekrutacyjnym reviewer może przetestować import własnym kluczem.

**Komunikat dla użytkownika (orientacyjny):**

> Import używa AI do wykrycia subskrypcji na wyciągu. Podaj swój klucz API — nie zapisujemy go nigdzie. Aplikacja działa w pełni bez tej funkcji dzięki ręcznemu dodawaniu.

---

## Dashboard — prosty i przejrzysty

**Bez wykresów** — przy statycznym zestawie subskrypcji lista z sumą jest czytelniejsza niż wykres kołowy. Kategorie pomagają grupować wpisy na liście; wykresy i raporty per kategoria można dodać później.

### Układ ekranu głównego

```
┌─────────────────────────────────────────┐
│  Twoje subskrypcje                      │
│  Łącznie: 187 zł / miesiąc              │  ← duża, wyraźna liczba
│  (3 aktywne)                            │
├─────────────────────────────────────────┤
│  [ + Dodaj ręcznie ]  [ Import wyciągu ]│  ← dwa równorzędne CTA
├─────────────────────────────────────────┤
│  Netflix     Rozrywka        60 zł    miesięcznie  │
│  Spotify     Muzyka i audio  37 zł    miesięcznie  │
│  iCloud      Praca i narzędzia  10 zł    miesięcznie  │
│  ...                                    │
└─────────────────────────────────────────┘
```

### Elementy UI (opcjonalne usprawnienia bez wykresów)

- filtrowanie lub grupowanie listy po kategorii,
- sortowanie po kwocie (najdroższe na górze),
- prosty pasek udziału % przy każdej pozycji (zamiast osobnego wykresu),
- czytelny pusty stan z zachętą do dodania pierwszej subskrypcji.

---

## Model danych (logiczny)

Prosta baza — dwie tabele, jedna relacja.

```
Użytkownik (User)
    │
    ├── Subskrypcja 1
    ├── Subskrypcja 2
    └── Subskrypcja 3
```

### Użytkownicy (`users`)

- `id` — identyfikator
- `username` — login, unikalny (bez emaila)
- `password_hash` — hasło (nigdy w czystym tekście)
- opcjonalnie: `created_at`

### Subskrypcje (`subscriptions`)

- `id` — identyfikator
- `user_id` — powiązanie z użytkownikiem
- `name` — nazwa usługi
- `amount` — kwota
- `billing_cycle` — miesięcznie / rocznie
- `category` — kategoria z predefiniowanej listy
- opcjonalnie: `created_at`

**Suma miesięczna** liczona w aplikacji (nie przechowywana w bazie): subskrypcje miesięczne + roczne ÷ 12.

Pliki wyciągów **nie muszą** być trwale zapisywane — wystarczy analiza i zapis wynikowych rekordów. **Klucz API użytkownika nie trafia do bazy ani do pamięci trwałej** — wyłącznie jednorazowe użycie przy imporcie.

---

## Ekrany aplikacji

1. **Rejestracja** — username + hasło
2. **Logowanie** — username + hasło
3. **Dashboard** — suma miesięczna, lista subskrypcji, CTA (dodaj ręcznie / import)
4. **Formularz ręcznego dodawania** — nazwa, kwota, cykl, kategoria
5. **Import wyciągu** — pole na klucz API (BYOK, bez zapisu), upload pliku, loader
6. **Podgląd wyników importu** — lista propozycji z możliwością zatwierdzenia / odrzucenia
7. **Edycja subskrypcji** — te same pola co przy dodawaniu

---

## Przepływ użytkownika (scenariusz demo)

### Scenariusz A — ręczne dodawanie (zawsze działa)

1. Użytkownik rejestruje się (username + hasło) i od razu jest zalogowany.
2. Widzi pusty dashboard z sumą 0 zł.
3. Klika „Dodaj ręcznie” i wpisuje Netflix, 60 zł, miesięcznie, kategoria: Rozrywka.
4. Powtarza dla kilku usług.
5. Dashboard pokazuje listę i łączną kwotę miesięczną.

### Scenariusz B — import (opcjonalny)

1. Zalogowany użytkownik klika „Import wyciągu”.
2. Podaje klucz API (BYOK) — tylko na ten import, bez zapisywania.
3. Wgrywa plik CSV z wyciągiem.
4. Aplikacja pokazuje wykryte subskrypcje.
5. Użytkownik zatwierdza — wpisy pojawiają się na tej samej liście co przy ręcznym dodaniu.

---

## Prywatność i zaufanie

- Brak podpinania konta bankowego — tylko jednorazowy upload pliku (opcjonalnie).
- Import AI jest **świadomym wyborem** użytkownika, nie wymogiem.
- BYOK — użytkownik używa własnego konta u dostawcy AI.
- **Klucz API nie jest zapisywany** — ani w bazie, ani w localStorage, ani w sesji po zakończeniu importu.
- Plik wyciągu nie jest przechowywany po analizie (jeśli tak zostanie zaimplementowane).

---

## Co świadomie nie robimy

- integracja z bankiem na żywo,
- OAuth / social login,
- wykresy i zaawansowane raporty,
- obsługa wielu banków i formatów wyciągów w pierwszej wersji,
- email, potwierdzanie rejestracji, reset hasła, 2FA,
- zapisywanie klucza API użytkownika,
- płatny model / monetyzacja.

## Podsumowanie decyzji produktowych

| Decyzja | Ustalenie |
|---------|-----------|
| Główna wartość | Lista subskrypcji + suma miesięczna |
| Dodawanie danych | Ręczne **i** import AI — równorzędnie |
| Import | Opcjonalny, automatyczny, BYOK — klucz nie jest zapisywany |
| Pola subskrypcji | Nazwa, kwota, cykl (mies./rok), kategoria |
| UI | Prosty, przejrzysty — bez wykresów |
| Auth | Tylko username + hasło; bez emaila, bez potwierdzania konta, bez OAuth |
| Baza | Użytkownicy + subskrypcje (relacja 1:N) |
| Bank | Brak integracji — tylko opcjonalny upload pliku |

---

## Notatka pod README / prezentację

> Aplikacja pozwala zarządzać subskrypcjami internetowymi w jednym miejscu. Użytkownik dodaje je ręcznie lub — opcjonalnie — importuje z wyciągu bankowego przy użyciu własnego klucza API (AI); klucz nie jest nigdzie zapisywany. Każda subskrypcja ma nazwę, kwotę, cykl rozliczenia i kategorię — wystarczy to, by pokazać realny miesięczny koszt i uporządkować listę bez zbędnej złożoności. Pełna funkcjonalność dostępna jest bez importu i bez integracji z bankiem.
