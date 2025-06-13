# Plan Wdrożenia Usługi **OpenRouterService**

## 1. Opis usługi

`OpenRouterService` jest serwerową (Node/Astro SSR) warstwą integracyjną odpowiedzialną za komunikację z API OpenRouter.
Jej zadania obejmują:

1. Bezpieczne zarządzanie kluczem API (środowisko – `OPENROUTER_API_KEY`).
2. Budowanie ładunku zapytania (prompt, parametry modelu, `response_format`).
3. Wysyłanie żądań, obsługę ponownych prób i back-offu w razie błędów sieciowych.
4. Parsowanie odpowiedzi i walidację względem zadeklarowanego schematu Zod.
5. Zwrot zwalidowanych danych do warstwy wywołującej.

> **Kluczowe korzyści**: pełna enkapsulacja logiki LLM, spójna obsługa błędów, brak ekspozycji klucza API po stronie klienta.

---

## 2. Opis konstruktora

Konstruktor `OpenRouterService` jest **prywatny**, aby wymusić wzorzec Singleton i zapobiec wielokrotnemu tworzeniu instancji klasy. Podczas inicjalizacji wykonuje następujące kroki:

- Odczytuje wartość `OPENROUTER_API_KEY` z bezpiecznego kontekstu serwerowego (`import.meta.env`).
- Jeśli klucz nie jest ustawiony, natychmiast zgłasza `ConfigurationError`, uniemożliwiając uruchomienie aplikacji w niepoprawnej konfiguracji.
- Inicjalizuje stałą `baseUrl` równą `'https://openrouter.ai/api/v1'`, wskazującą główny endpoint API OpenRouter.
- Przechowuje klucz wewnętrznie w polu `apiKey`, aby udostępnić go metodom wysyłającym żądania.

Dodatkowo klasa udostępnia statyczną metodę `getInstance()`, która zwraca pojedynczą instancję usługi (lub tworzy ją przy pierwszym wywołaniu).

- **Wzorzec Singleton** zapewnia pojedynczą instancję, redukując koszty inicjalizacji oraz ułatwiając mockowanie w testach.
- **Błąd konfiguracyjny** rzucany jest natychmiast, aby aplikacja nie wystartowała w niepoprawnym środowisku.

---

## 3. Publiczne metody i pola

### 3.1 `getInstance(): OpenRouterService`

Pobiera instancję Singletona.

### 3.2 `generateChatCompletion<T extends z.ZodTypeAny>(params): Promise<z.infer<T>>`

Metoda koordynująca pełny cykl żądania → walidacja → odpowiedź.

#### Parametry (`GenerateChatParams<T>`)

1. **`model`** – np. `"anthropic/claude-3-haiku-20240307"`.
2. **`systemPrompt`** – kontekst/PROMPT systemowy.
3. **`userPrompt`** – wiadomość użytkownika.
4. **`responseSchema`** _(Zod)_ – docelowa struktura odpowiedzi.
5. **`schemaName`** – unikalna nazwa schematu w `response_format`.
6. **`modelParams`** _(opcjonalne)_ – `temperature`, `max_tokens`, `top_p`, itd.

#### Przykłady konfiguracji kluczowych elementów

1. **Komunikat systemowy**  
   `"Jesteś ekspertem kulinarnym. Odpowiadasz wyłącznie w formacie JSON."`
2. **Komunikat użytkownika**  
   `"Podaj 3 pomysły na śniadanie z owsem i bananem."`
3. **`response_format`**
   ```json
   {
     "type": "json_schema",
     "json_schema": {
       "name": "recipe_ideas_schema",
       "strict": true,
       "schema": { "$ref": "#/definitions/recipe_ideas_schema" }
     }
   }
   ```
4. **Nazwa modelu**  
   `"openai/gpt-4o-mini"`
5. **Parametry modelu**
   ```ts
   {
     temperature: 0.4,
     max_tokens: 512,
     top_p: 0.9,
   }
   ```

> Wszystkie powyższe elementy są przekazywane do `_buildPayload` w celu utworzenia kompletnego żądania HTTP POST.

---

## 4. Prywatne metody i pola

| #   | Komponent                   | Funkcjonalność                                                        | Potencjalne wyzwania                                                     | Rozwiązania                                                                                               |
| --- | --------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| 1   | `_buildPayload`             | Konwertuje schemat Zod → JSON Schema, buduje strukturę żądania.       | a) Poprawna konwersja z Zod, b) przekroczenie limitu znaków w promptach. | 1a) użyj `zod-to-json-schema`; 1b) trim prompt lub skrócenie treści.                                      |
| 2   | `_sendRequest`              | Realizuje `fetch` z nagłówkami oraz retry (np. exponential-back-off). | a) Błędy sieci/TLS, b) limity ratelimit 429.                             | 2a) Timeout + retry 3× z `AbortController`; 2b) odczytaj `Retry-After` i przełóż na kolejną próbę.        |
| 3   | `_parseAndValidateResponse` | JSON.parse + `responseSchema.safeParse`.                              | a) "hallucinated" tekst zamiast JSON, b) duże odpowiedzi > 4 MB.         | 3a) wykryj brak `{` na początku → `SchemaValidationError`; 3b) streamuj odpowiedź lub zwiększ limit body. |
| 4   | `_handleError` _(opc.)_     | Mapuje błędy niskopoziomowe → dedykowane klasy.                       | a) Rozróżnienie błędu HTTP ≠ błędu schematu.                             | 4a) Stwórz hierarchię błędów z bazową klasą `OpenRouterError`.                                            |

> Każdy komponent jest w pełni testowalny jednostkowo dzięki wstrzykiwaniu zależności (np. custom fetch impl).

---

## 5. Obsługa błędów

1. **`ConfigurationError`** – brak klucza API.
2. **`ApiConnectionError`** – timeout, DNS, TLS.
3. **`ApiStatusError`** – HTTP 4xx/5xx z treścią odpowiedzi.
4. **`ResponseParsingError`** – niepoprawny JSON (np. przerwane łącze).
5. **`SchemaValidationError`** – dane niezgodne ze schematem Zod.
6. **`RateLimitError`** _(specyficzny 429)_ – pozwala na back-off.
7. **`UnknownOpenRouterError`** – fallback dla nieprzewidzianych problemów.

Każda klasa dziedziczy po wspólnej bazie `OpenRouterError` i zawiera pole `cause` (dla stack-trace).

---

## 6. Kwestie bezpieczeństwa

1. **Klucz API** tylko na serwerze (`.env` + `.gitignore`).
2. **Sanityzacja promptów** – escape user input, usuwanie ciągów "```" itp.
3. **Ochrona kosztów** – limity budżetu + guard clause na długość promptu i `max_tokens`.
4. **Logowanie** – trzymać PII poza logami; maskować API Key.
5. **Środowisko produkcyjne** – wygasanie klucza, rotacja co X dni.

---

## 7. Plan wdrożenia krok po kroku

1. **Konfiguracja środowiska**
   ```bash
   # .env
   OPENROUTER_API_KEY="sk-or-v1-…"
   ```
2. **Instalacja zależności**
   ```bash
   npm i zod zod-to-json-schema
   ```
3. **Utworzenie pliku usługi**  
   `src/lib/services/openrouter/open-router.service.ts` – przenieś kod z sekcji 2–4.
4. **Dodanie typów**  
   `GenerateChatParams`, `ChatMessage`, `RequestPayload`, klasy błędów.
5. **Testy jednostkowe**  
   Mock `fetch`, symuluj 200, 429, 500 oraz halucynację tekstu.
6. **Endpoint API**  
   `src/pages/api/generate-summary.ts` – przykład użycia usługi.
7. **CI/CD**  
   a) lint + test, b) skan secretów, c) deployment Docker → DigitalOcean.
8. **Monitoring produkcyjny**  
   Metrics: liczba żądań, czas odpowiedzi, % błędów schematu.

---

> **Gotowe!**  
> Ten przewodnik zawiera wszystkie elementy niezbędne do poprawnego wdrożenia, testowania i utrzymania usługi `OpenRouterService` w obrębie przedstawionego stosu technologicznego (Astro 5 + TypeScript 5 + React 19 + Tailwind 4 + Shadcn/ui).
