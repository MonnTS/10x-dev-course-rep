# Plan Implementacji Endpointu API: Generowanie Fiszke

## 1. Przegląd Endpointu

Endpoint Generowania umożliwia generowanie fiszek na podstawie tekstu źródłowego przy użyciu AI.

## 2. Szczegóły Żądania

- **Metody HTTP**: POST
- **Struktura URL**: `/api/v1/generations`
- **Ciało Żądania**:

| Pole         | Typ    | Reguły                                   |
| ------------ | ------ | ---------------------------------------- |
| `sourceText` | string | Wymagany, min 1000, max 10,000 znaków    |
| `model`      | string | Opcjonalny, nazwa modelu z OpenRouter.ai |

## 3. Używane Typy

Wszystkie typy zdefiniowane w `src/types.ts`: `GenerateFlashcardsCommand`, `GenerateFlashcardsResponse`.

## 4. Szczegóły Odpowiedzi

- **Odpowiedź Sukcesu (201 Created)**: JSON z wygenerowanymi fiszkami i metadanymi.
  ```json
  {
    "flashcards": [
      {
        "front": "string",
        "back": "string",
        "source": "ai-full"
      }
    ],
    "metadata": {
      "model": "string",
      "generation_time": "string"
    }
  }
  ```

## 5. Przepływ Danych

- **Interakcje z Bazą Danych**:
  - Tworzy rekord w tabeli `generations`.
- **Usługi Zewnętrzne**: OpenRouter.ai do generowania fiszek AI

## 6. Względy Bezpieczeństwa

- **Uwierzytelnianie**: Supabase Auth z tokenami JWT
- **Autoryzacja**: Polityki RLS dla dostępu do danych
- **Walidacja Danych**: Schematy Zod do walidacji danych wejściowych

## 7. Obsługa Błędów

| Kod | Sytuacja                                  |
| --- | ----------------------------------------- |
| 400 | Błąd walidacji (np. długość `sourceText`) |
| 401 | Brak lub nieprawidłowy token JWT          |
| 500 | Błąd serwera, błąd API, błąd bazy danych  |

## 8. Względy Wydajności

- **Wąskie Gardła**: Zewnętrzne wywołania API do OpenRouter.ai.
- **Strategie Optymalizacji**:
  - Zaimplementuj przetwarzanie w tle dla dużych tekstów źródłowych.

## 9. Kroki Implementacji

1. Skonfiguruj klienta Supabase i middleware do uwierzytelniania.
2. Rozwiń serwis generowania w `src/lib/services/ai-generation.service.ts`:
   - Przetwarzaj tekst źródłowy i waliduj dane wejściowe za pomocą Zod.
   - Wywołaj API OpenRouter.ai.
   - Parsuj i waliduj wygenerowane fiszki.
   - Utwórz rekord generowania w bazie danych.
   - Zwróć propozycje fiszek z metadanymi.
3. Utwórz trasę API generowania w `src/pages/api/v1/generations/index.ts`:
   - Zaimplementuj walidację żądania.
   - Obsłuż uwierzytelnianie.
   - Wywołaj serwis generowania.
   - Zwróć ustrukturyzowaną odpowiedź.
4. Skonfiguruj logowanie błędów z odpowiednimi typami błędów.
5. Zaimplementuj właściwą obsługę błędów i feedback dla użytkownika.
