# Specyfikacja Techniczna: Moduł Autentykacji Użytkowników

## 1. Wprowadzenie

Niniejszy dokument opisuje architekturę i szczegóły implementacyjne modułu autentykacji użytkowników (rejestracja, logowanie, odzyskiwanie hasła) dla aplikacji "Fiszki". Projekt opiera się na stacku technologicznym obejmującym Astro, React, TypeScript, TailwindCSS, Shadcn/ui oraz Supabase jako backend. Celem jest stworzenie bezpiecznego, wydajnego i zgodnego z wymaganiami (US-001, US-002, US-003) systemu zarządzania sesją użytkownika w architekturze Server-Side Rendering (SSR).

## 2. Architektura Interfejsu Użytkownika (Frontend)

Logika interfejsu użytkownika zostanie podzielona pomiędzy strony Astro, które odpowiadają za routing i renderowanie struktury, oraz komponenty React, które zarządzają stanem formularzy i interakcjami użytkownika.

### 2.1. Layouty (Astro)

Wprowadzone zostaną dwa główne layouty w celu separacji widoków publicznych (dla niezalogowanych użytkowników) i prywatnych (po zalogowaniu).

- **`src/layouts/AuthLayout.astro`**:

  - **Cel**: Podstawowy layout dla stron publicznych, takich jak logowanie, rejestracja i odzyskiwanie hasła.
  - **Struktura**: Minimalistyczna, wyśrodkowana zawartość na stronie, zawierająca logo aplikacji i slot na formularz. Brak elementów nawigacyjnych przeznaczonych dla zalogowanego użytkownika.

- **`src/layouts/AppLayout.astro`**:
  - **Cel**: Główny layout aplikacji dla zalogowanych użytkowników.
  - **Struktura**: Zawierać będzie główną nawigację (np. do dashboardu, zarządzania fiszkami), slot na zawartość strony oraz komponent `UserDropdown` w nagłówku, umożliwiający wylogowanie. Dostęp do tego layoutu będzie chroniony przez middleware.

### 2.2. Strony (Astro)

Strony będą renderowane serwerowo, wykorzystując odpowiednie layouty i osadzając w sobie interaktywne komponenty React.

- **`/src/pages/login.astro`**:

  - **Opis**: Strona logowania.
  - **Layout**: `AuthLayout.astro`.
  - **Komponent**: Osadza `<LoginForm client:load />`.

- **`/src/pages/register.astro`**:

  - **Opis**: Strona rejestracji.
  - **Layout**: `AuthLayout.astro`.
  - **Komponent**: Osadza `<RegisterForm client:load />`.

- **`/src/pages/forgot-password.astro`**:

  - **Opis**: Strona inicjowania procesu odzyskiwania hasła.
  - **Layout**: `AuthLayout.astro`.
  - **Komponent**: Osadza `<ForgotPasswordForm client:load />`.

- **`/src/pages/auth/callback.astro`**:

  - **Opis**: Endpoint, na który Supabase przekieruje użytkownika po udanej operacji (np. logowanie przez OAuth, potwierdzenie maila). Obsłuży wymianę kodu na sesję i przekieruje użytkownika do panelu.
  - **Logika**: Server-side, bez widoku UI.

### 2.3. Komponenty (React)

Komponenty React (`.tsx`) będą zaimplementowane z użyciem `Shadcn/ui` dla spójnego wyglądu. Do walidacji formularzy po stronie klienta i serwera wykorzystana zostanie biblioteka `Zod`.

- **`src/components/auth/RegisterForm.tsx`**:

  - **Pola**: Email, Hasło, Potwierdź hasło.
  - **Walidacja (Zod)**:
    - Email: poprawny format, pole wymagane.
    - Hasło: min. 8 znaków, co najmniej jedna wielka litera, jedna cyfra.
    - Potwierdzenie hasła: musi być identyczne z hasłem.
  - **Logika**: Zarządza stanem formularza. Po wysłaniu (submit) wykonuje zapytanie `POST` do `/api/auth/register`. Wyświetla komunikaty o błędach walidacji (np. "Hasło jest za krótkie") oraz błędy zwrócone z API (np. "Użytkownik o tym adresie email już istnieje").

- **`src/components/auth/LoginForm.tsx`**:

  - **Pola**: Email, Hasło.
  - **Walidacja (Zod)**: Email i hasło są wymagane.
  - **Logika**: Po wysłaniu wykonuje zapytanie `POST` do `/api/auth/login`. W przypadku błędu (np. "Nieprawidłowe dane logowania"), wyświetla ogólny komunikat błędu pod formularzem. Po sukcesie, frontend przekierowuje na stronę główną aplikacji (np. `/dashboard`).

- **`src/components/auth/ForgotPasswordForm.tsx`**:

  - **Pola**: Email.
  - **Logika**: Po wysłaniu wykonuje `POST` do `/api/auth/forgot-password`. Wyświetla komunikat o sukcesie (np. "Jeśli konto istnieje, link do resetu hasła został wysłany na Twój email.").

- **`src/components/auth/ResetPasswordForm.tsx`**:

  - **Pola**: Nowe hasło, Potwierdź nowe hasło.
  - **Logika**: Komponent odczytuje token z parametrów URL. Po wysłaniu wykonuje `POST` do `/api/v1/auth/reset-password` z nowym hasłem. Po sukcesie wyświetla potwierdzenie i link do strony logowania.

- **`src/components/layout/UserDropdown.tsx`**:
  - **Opis**: Komponent w `AppLayout`, wyświetlający email zalogowanego użytkownika.
  - **Funkcjonalność**: Zawiera menu z opcją "Wyloguj", która po kliknięciu wywołuje `POST` do `/api/v1/auth/logout` i przekierowuje użytkownika na stronę logowania.

## 3. Logika Backendowa

Backend będzie oparty o architekturę Astro (SSR), wykorzystując API routes do komunikacji z Supabase oraz middleware do ochrony stron.

### 3.1. Middleware

Plik `src/middleware/index.ts` będzie centralnym punktem kontroli dostępu.

- **Funkcjonalność**:
  1.  Przy każdym żądaniu do serwera, middleware weryfikuje sesję użytkownika na podstawie ciasteczek (cookies) zarządzanych przez pakiet `@supabase/ssr`.
  2.  Pobiera dane sesji i użytkownika, a następnie umieszcza je w `context.locals`, dzięki czemu są dostępne w każdej renderowanej stronie Astro po stronie serwera.
  3.  **Ochrona tras**:
      - Jeśli użytkownik **nie jest** zalogowany i próbuje uzyskać dostęp do chronionej strony (np. `/dashboard`, `/flashcards`), middleware przekierowuje go na `/login`.
      - Jeśli użytkownik **jest** zalogowany i próbuje uzyskać dostęp do stron autentykacji (np. `/login`, `/register`), middleware przekierowuje go na główną stronę aplikacji (`/dashboard`).
  4.  Definicja chronionych i publicznych ścieżek będzie zarządzana centralnie w tym pliku.

### 3.2. Endpointy API (`src/pages/api/v1/auth`)

API routes będą obsługiwać logikę biznesową, komunikując się z Supabase Auth. Zapewnią warstwę abstrakcji między frontendem a Supabase.

- **`POST /api/v1/auth/register`**:

  - **Kontrakt (Request Body)**: `{ email: string, password: string }`.
  - **Logika**: Waliduje dane wejściowe przy użyciu schematu Zod. Wywołuje `supabase.auth.signUp()`. Obsługuje błędy (np. użytkownik już istnieje, słabe hasło) i zwraca odpowiedni status HTTP (400, 409) z komunikatem błędu w formacie JSON.

- **`POST /api/v1/auth/login`**:

  - **Kontrakt (Request Body)**: `{ email: string, password: string }`.
  - **Logika**: Waliduje dane. Wywołuje `supabase.auth.signInWithPassword()`. Supabase automatycznie ustawi odpowiednie ciasteczka sesyjne w odpowiedzi. W przypadku błędu (nieprawidłowe dane), zwraca status 401.

- **`POST /api/v1/auth/logout`**:

  - **Logika**: Wywołuje `supabase.auth.signOut()`. To unieważnia sesję i usuwa ciasteczka. Zwraca status 200.

- **`POST /api/v1/auth/forgot-password`**:

  - **Kontrakt (Request Body)**: `{ email: string }`.
  - **Logika**: Waliduje email. Wywołuje `supabase.auth.resetPasswordForEmail()`, podając URL do strony resetowania hasła w naszej aplikacji (`/forgot-password`).

- **`POST /api/v1/auth/reset-password`**:
  - **Kontrakt (Request Body)**: `{ password: string }`. Token będzie przekazywany w inny sposób, np. przez sesję po obsłużeniu callbacku.
  - **Logika**: Po tym, jak użytkownik kliknie link i zostanie przekierowany na `auth/callback`, Supabase stworzy sesję z tokenem. Ten endpoint użyje tej sesji do wywołania `supabase.auth.updateUser()` z nowym hasłem.

### 3.3. Modele Danych i Walidacja

- **`src/lib/validators/auth.ts`**: Plik zawierający schematy Zod dla wszystkich formularzy autentykacji (rejestracja, logowanie, etc.). Będą one reużywane do walidacji zarówno na froncie (w komponentach React), jak i na backendzie (w endpointach API), zapewniając spójność.

## 4. System Autentykacji (Integracja z Supabase)

### 4.1. Klient Supabase

- **`src/lib/supabase/server.ts`**: Inicjalizacja serwerowego klienta Supabase przy użyciu pakietu `@supabase/ssr`. Będzie on wykorzystywany w middleware i API routes. Klient ten potrafi odczytywać i zapisywać ciasteczka w kontekście żądania HTTP.
- **`src/lib/supabase/client.ts`**: Inicjalizacja klienckiego klienta Supabase, który może być używany w komponentach React, jeśli zajdzie taka potrzeba (chociaż preferowana jest komunikacja przez API routes).
- **Zmienne środowiskowe**: Klucze `SUPABASE_URL` i `SUPABASE_ANON_KEY` będą przechowywane w pliku `.env` i używane do konfiguracji klientów.

### 4.2. Przepływ Autentykacji (Server-Side Flow)

1.  Użytkownik wypełnia formularz (np. `LoginForm`) w przeglądarce.
2.  Formularz wysyła zapytanie `POST` do odpowiedniego endpointu w Astro (`/api/v1/auth/login`).
3.  Endpoint API na serwerze, używając serwerowego klienta Supabase, wywołuje metodę Supabase Auth (np. `signInWithPassword`).
4.  Supabase przetwarza żądanie, a w przypadku sukcesu, serwerowa biblioteka Supabase dołącza do odpowiedzi HTTP nagłówki `Set-Cookie` z bezpiecznymi, `HttpOnly` ciasteczkami sesyjnymi.
5.  Przeglądarka otrzymuje odpowiedź i zapisuje ciasteczka.
6.  Przy każdym kolejnym żądaniu do aplikacji, przeglądarka automatycznie dołącza te ciasteczka.
7.  Middleware w Astro odczytuje ciasteczka przy pomocy serwerowego klienta Supabase, weryfikuje sesję i udostępnia dane użytkownika w `context.locals`, podejmując decyzje o ewentualnym przekierowaniu.

Ten model zapewnia wysokie bezpieczeństwo, ponieważ tokeny JWT nigdy nie są przechowywane w `localStorage` i nie są dostępne dla kodu JavaScript po stronie klienta.
