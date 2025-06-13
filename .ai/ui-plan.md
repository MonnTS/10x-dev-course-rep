# Architektura UI dla Fiszki

## 1. Przegląd struktury UI

Aplikacja Fiszki wykorzystuje minimalistyczny, jednotorowy interfejs z dwoma głównymi modułami:

- Moduł generowania fiszek (AI)
- Moduł zarządzania fiszkami (CRUD)

Struktura składa się z:

- Stały nagłówek z logo i przyciskiem wylogowania
- Główny obszar treści z dynamiczną zawartością
- Floating Action Button (FAB) dla głównych akcji
- System powiadomień dla feedbacku

### Główne założenia:

- Separacja generowania od zarządzania fiszkami
- Brak zaawansowanych funkcji w MVP
- Fokus na podstawowe operacje
- Prosty system nawigacji
- Natychmiastowy feedback dla użytkownika
- Responsywność dla mobile/desktop

## 2. Lista widoków

### Auth (/auth)

- **Cel**: Autentykacja użytkownika
- **Komponenty**:
  - Formularz logowania
  - Formularz rejestracji
  - Link do resetowania hasła
- **Względy UX**:
  - Walidacja w czasie rzeczywistym
  - Jasne komunikaty błędów
  - Automatyczne przekierowanie po sukcesie

### Lista Fiszek (/flashcards)

- **Cel**: Zarządzanie kolekcją fiszek
- **Kluczowe informacje**:
  - Lista fiszek z checkboxami
  - Źródło fiszki (AI/manual/edited)
  - Metadane generowania (dla AI)
  - Data utworzenia
- **Komponenty**:
  - Tabela z możliwością zaznaczania
  - Dropdown filtrowania źródła
  - Akcje masowego usuwania
  - FAB do tworzenia nowej fiszki
- **Względy UX**:
  - Scrollable table na mobile
  - Potwierdzenie usuwania z "nie pytaj ponownie"
  - Instant feedback dla akcji

### Generator AI (/generate)

- **Cel**: Generowanie propozycji fiszek przez AI
- **Kluczowe informacje**:
  - Licznik pozostałych fiszek
  - Status generowania
  - Lista wygenerowanych propozycji
- **Komponenty**:
  - Formularz tekstu źródłowego
  - Progress bar
  - Lista propozycji z możliwością wyboru
  - System retry (max 3 próby)
  - Przycisk zapisu wybranych fiszek
- **Względy UX**:
  - Jasne komunikaty statusu
  - Możliwość anulowania
  - Zachowanie stanu formularza
  - Przekierowanie do /flashcards po zapisie

### Edycja Fiszki (/flashcards/:id)

- **Cel**: Modyfikacja istniejącej fiszki
- **Kluczowe informacje**:
  - Aktualna treść (przód/tył)
  - Status źródła
- **Komponenty**:
  - Formularz edycji
  - Przyciski akcji (zapisz/anuluj)
- **Względy UX**:
  - Autosave (opcjonalnie)
  - Potwierdzenie porzucenia zmian

## 3. Mapa podróży użytkownika

### Główne przepływy:

1. Autentykacja:

   ```
   /auth -> /flashcards (po sukcesie)
   ```

2. Tworzenie fiszek:

   ```
   /flashcards (FAB) -> /generate -> wybór fiszek -> zapis -> /flashcards
   /flashcards (FAB) -> /flashcards/:id (nowa fiszka) -> /flashcards
   ```

3. Zarządzanie fiszkami:
   ```
   /flashcards -> /flashcards/:id (edycja) -> /flashcards
   /flashcards -> potwierdzenie usunięcia -> /flashcards
   ```

## 4. Układ i struktura nawigacji

### Desktop:

- Stały header z logo i wylogowaniem
- Główny obszar treści (70-80% szerokości)
- FAB w prawym dolnym rogu
- Toast notifications w prawym górnym rogu

### Nawigacja:

- Bezpośrednia (bez zagnieżdżonych poziomów)
- Konsekwentny przycisk powrotu
- Zachowanie historii przeglądania

## 5. Kluczowe komponenty

### Layout Components:

- **AppHeader**: Logo, wylogowanie
- **MainContent**: Kontener głównej treści
- **FAB**: Akcje tworzenia

### Shared Components:

- **FlashcardTable**: Lista z checkboxami
- **FlashcardForm**: Formularz edycji/tworzenia
- **SourceFilter**: Dropdown filtrowania
- **DeleteConfirmation**: Dialog z "nie pytaj ponownie"
- **LoadingSpinner**: Wskaźnik postępu
- **Toast**: System powiadomień

### Form Components:

- **TextInput**: Pola tekstowe
- **ActionButton**: Przyciski akcji
- **Checkbox**: Zaznaczanie elementów

### Feedback Components:

- **ErrorMessage**: Komunikaty błędów
- **ProgressBar**: Wskaźnik generowania
- **StatusIndicator**: Status operacji
