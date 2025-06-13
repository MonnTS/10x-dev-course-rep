# Plan testów dla projektu

## 1. Wprowadzenie i cele testowania

Celem procesu testowania jest zapewnienie, że aplikacja spełnia wymagania funkcjonalne i niefunkcjonalne, działa stabilnie na docelowych środowiskach oraz udostępnia użytkownikom bezpieczne i intuicyjne interfejsy. Testy mają również na celu:

- wczesne wykrywanie defektów i regresji,
- potwierdzenie zgodności z projektem architektury i wzorcami kodowania,
- ocenę wydajności i skalowalności kluczowych komponentów,
- minimalizację ryzyka biznesowego związanego z błędami produkcyjnymi.

## 2. Zakres testów

Objęte testami będą następujące elementy projektu:

- **Warstwa prezentacji (Astro + React 19 + Tailwind 4 + Shadcn/ui)** – strony `src/pages`, dynamiczne komponenty w `src/components`.
- **Warstwa API (Astro API Routes)** – endpointy REST dostępne pod `src/pages/api/v1/**`.
- **Warstwa usług i logiki domenowej** – moduły w `src/lib/services`, `src/lib/validators`, `src/lib/utils`.
- **Dostęp do danych — Supabase** – klient w `src/db`, definicje typów oraz procedury.
- **Integracja z Openrouter.ai** – usługa `openrouter.service` odpowiadająca za komunikację z modelami AI.
- **Middleware aplikacyjne** – `src/middleware/index.ts` odpowiadające m.in. za kontrolę sesji i przekierowania.

Poza zakresem pozostają aspekty DevOps (infrastruktura Docker/DigitalOcean, konfiguracja GitHub Actions), chyba że defekty środowiskowe uniemożliwią wykonanie testów funkcjonalnych.

## 3. Typy testów

1. **Testy jednostkowe** – logika biznesowa, walidatory i helpery (`vitest`).
2. **Testy integracyjne** – API ↔ Supabase (z użyciem testowej bazy lub mocków), integracja z Openrouter (mock HTTP).
3. **Testy end-to-end (E2E)** – kluczowe ścieżki użytkownika w przeglądarce (Playwright).
4. **Testy kontraktowe** – zgodność schematów odpowiedzi API z oczekiwanym kontraktem (`zod`, typy TypeScript).
5. **Testy wydajnościowe** – bulk endpointy (np. `flashcards/bulk`, `generations`) przy użyciu k6.
6. **Testy bezpieczeństwa** – autoryzacja, CSRF, XSS, SQL Injection (automaty + testy ręczne).
7. **Testy użyteczności** – sesje UX z użytkownikami lub heurystyczne przeglądy eksperckie.
8. **Testy regresji** – uruchamiane w pipeline CI po każdym mergu do `main`.

## 4. Scenariusze testowe (wybór P1)

| ID          | Obszar         | Scenariusz                                          | Oczekiwany rezultat                                |
| ----------- | -------------- | --------------------------------------------------- | -------------------------------------------------- |
| **AU-01**   | Autentykacja   | Rejestracja nowego użytkownika z poprawnymi danymi  | Konto utworzone, e-mail potwierdzający wysłany     |
| **AU-02**   | Autentykacja   | Próba logowania nieaktywnego/konto bez weryfikacji  | Komunikat o konieczności aktywacji, brak sesji     |
| **FC-01**   | Flashcards     | Utworzenie pojedynczej fiszki                       | Fiszka pojawia się na liście i w DB                |
| **FC-02**   | Flashcards     | Masowe dodawanie fiszek przez endpoint `bulk`       | Wszystkie rekordy zapisane atomowo lub rollback    |
| **FC-03**   | Flashcards     | Wyszukiwanie i paginacja listy przy dużym wolumenie | Poprawne sortowanie, paginacja, czasy < 200 ms     |
| **GE-01**   | Generations    | Generowanie treści z Openrouter (happy path)        | Odpowiedź 200, treść zgodna z promptem             |
| **GE-02**   | Generations    | Timeout/model error z Openrouter                    | Odpowiedź 502/503, komunikat błędu user-friendly   |
| **MW-01**   | Middleware     | Dostęp do chronionej strony bez sesji               | Przekierowanie na `/login`                         |
| **SEC-01**  | Bezpieczeństwo | Próba XSS w polu `content` fiszki                   | Dane zeskalowane/odrzucone, brak wykonania skryptu |
| **PERF-01** | Wydajność      | 500 równoległych zapytań do `GET /flashcards`       | Percentyl 95 < 500 ms, brak błędów 5xx             |

_(Pełna tabela scenariuszy w oddzielnym arkuszu TestRail)._

## 5. Środowisko testowe

- **System operacyjny**: Linux 6.15 (docker container) + macOS Ventura (E2E).
- **Node.js**: wersja z `.nvmrc` (np. 20.x).
- **Baza danych**: Supabase Local (docker) z fabryką danych seedujących.
- **Zmienne środowiskowe**: klucze testowe do Openrouter, dane SMTP (mail-trap), itp.
- **Przeglądarki**: Chrome stable, Firefox latest, WebKit (Playwright).
- **CI**: GitHub Actions – workflow `test.yml`.

## 6. Narzędzia do testowania

| Cel               | Narzędzie                                                    |
| ----------------- | ------------------------------------------------------------ |
| Unit/Integration  | **Vitest**, **@testing-library/react**, **supabase-js** mock |
| E2E               | **Playwright** + `@playwright/test`                          |
| Wydajność         | **k6** (skrypty w `/tests/perf`)                             |
| Statyczna analiza | **ESLint**, **TypeScript**, **Dependabot**                   |
| Raporty pokrycia  | **c8** / `vitest --coverage`                                 |
| Security          | **OWASP ZAP** (DAST), Snyk OSS                               |

## 7. Harmonogram (przykładowy sprint 2-tygodniowy)

| Dzień | Aktywność                                              |
| ----- | ------------------------------------------------------ |
| 1-2   | Przygotowanie środowiska testowego, przegląd wymagań   |
| 3-6   | Implementacja testów jednostkowych + integracyjnych P1 |
| 7-8   | Budowa scenariuszy E2E, konfiguracja Playwright CI     |
| 9     | Testy wydajnościowe `flashcards`, `generations`        |
| 10    | Testy bezpieczeństwa (ZAP scan)                        |
| 11-12 | Analiza wyników, naprawa krytycznych defektów          |
| 13    | Retest, regresja automatyczna                          |
| 14    | Demo jakości, podpisanie raportu QA                    |

_(Harmonogram aktualizowany w Jira road-map)._

## 8. Kryteria akceptacji testów

- 100 % przejścia dla testów P1, max 10 % nie-P1 otwartych defektów.
- Pokrycie linii/gałęzi ≥ 80 % dla warstwy usług i API.
- Brak defektów o krytycznym poziomie bezpieczeństwa (OWASP Top 10).
- Średni czas odpowiedzi krytycznych endpointów < 300 ms (p95).
- Wszystkie testy przechodzą w pipeline CI bez flaków.

## 9. Role i odpowiedzialności

| Rola              | Zakres                                                         |
| ----------------- | -------------------------------------------------------------- |
| **QA Lead**       | definiowanie strategii testów, przydział zadań, raport końcowy |
| **Inżynier QA**   | implementacja i utrzymanie testów, analiza defektów            |
| **Developer**     | naprawa defektów, code review testów                           |
| **DevOps**        | utrzymanie pipeline CI/CD, środowisk testowych                 |
| **Product Owner** | akceptacja kryteriów, priorytetyzacja defektów                 |

## 10. Procedury raportowania błędów

1. Defekt zgłaszany w GitHub Issues z szablonu „Bug report”.
2. Pola obowiązkowe: tytuł, etapy reprodukcji, obserwowany vs oczekiwany rezultat, severity, zrzuty ekranu/logi.
3. Defekt oznaczany etykietą: `severity:critical|major|minor|trivial`, `component:api|ui|db|infra`.
4. QA Lead monitoruje przepływ _Open → In Progress → Review → Done_.
5. Retest wykonany automatycznie (CI) lub manualnie w zależności od obszaru.

---

Dokument podlega przeglądowi co sprint lub przy znaczących zmianach architektury.
