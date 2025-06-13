# Dokument wymagań produktu (PRD) - Fiszki

## 1. Przegląd produktu

Fiszki to aplikacja webowa umożliwiająca efektywne tworzenie i wykorzystanie fiszek edukacyjnych przy pomocy sztucznej inteligencji. Produkt pozwala użytkownikom szybko generować wysokiej jakości fiszki na podstawie wprowadzonego tekstu, a następnie korzystać z nich w procesie nauki wykorzystującym metodę powtórek rozłożonych w czasie (spaced repetition).

Aplikacja kierowana jest do osób uczących się, które chcą maksymalizować efektywność procesu przyswajania wiedzy, minimalizując jednocześnie czas potrzebny na przygotowanie materiałów edukacyjnych. MVP produktu skupia się na podstawowej funkcjonalności generowania, zarządzania i wykorzystania fiszek tekstowych.

## 2. Problem użytkownika

Manualne tworzenie wysokiej jakości fiszek edukacyjnych jest czasochłonne, co zniechęca do korzystania z efektywnej metody nauki jaką jest spaced repetition. Użytkownicy często rezygnują z tworzenia fiszek, mimo że jest to udowodniona metoda efektywnego przyswajania wiedzy, ponieważ:

1. Proces tworzenia fiszek zajmuje zbyt dużo czasu
2. Trudno jest wybrać najważniejsze informacje do umieszczenia na fiszkach
3. Sformułowanie pytań i odpowiedzi wymaga dodatkowego wysiłku intelektualnego
4. Tworzenie dużej liczby fiszek jest żmudne i monotonne

Aplikacja Fiszki rozwiązuje ten problem, automatyzując proces tworzenia fiszek przy pomocy AI, co znacząco skraca czas potrzebny na przygotowanie materiałów edukacyjnych i pozwala użytkownikom skupić się na właściwym procesie nauki.

## 3. Wymagania funkcjonalne

1. System kont użytkowników

   - Rejestracja, logowanie i zarządzanie kontem użytkownika
   - Bezpieczne przechowywanie danych użytkownika
   - Resetowanie hasła

2. Generowanie fiszek przez AI

   - Wprowadzanie tekstu źródłowego przez użytkownika
   - Generowanie do 5 propozycji fiszek przez AI
   - Podgląd, edycja i akceptacja wybranych propozycji fiszek
   - Zapis zaakceptowanych fiszek do bazy danych użytkownika

3. Manualne tworzenie fiszek

   - Prosty formularz z polami tekstowymi dla przodu i tyłu fiszki
   - Ograniczenia: tytuł do 100 znaków, treść do 1000 znaków
   - Zapisywanie fiszek w bazie danych użytkownika

4. Zarządzanie fiszkami

   - Przeglądanie listy wszystkich fiszek użytkownika
   - Szczegółowy podgląd pojedynczej fiszki
   - Edycja istniejących fiszek
   - Usuwanie fiszek

5. System nauki z fiszkami

   - Integracja z gotowym algorytmem powtórek (open-source)
   - Wyświetlanie fiszek zgodnie z harmonogramem powtórek
   - Ocenianie znajomości materiału przez użytkownika
   - Dostosowywanie harmonogramu powtórek na podstawie ocen użytkownika

6. Infrastruktura techniczna
   - Frontend w React i TypeScript
   - Backend z wykorzystaniem bazy danych + Supabase
   - API łączące frontend z backendem

## 4. Granice produktu

W zakres MVP nie wchodzą następujące funkcjonalności:

1. Własny, zaawansowany algorytm powtórek (jak SuperMemo, Anki)
2. Import wielu formatów (PDF, DOCX, itp.)
3. Współdzielenie zestawów fiszek między użytkownikami
4. Integracje z innymi platformami edukacyjnymi
5. Aplikacje mobilne (na początek tylko web)
6. Fiszki zawierające obrazy, dźwięki lub wideo
7. Kategoryzacja/tagowanie fiszek
8. Statystyki i szczegółowe analizy postępów w nauce
9. Eksport fiszek do innych formatów
10. Funkcje społecznościowe (komentarze, udostępnianie, itp.)

## 5. Historyjki użytkowników

### US-001: Rejestracja nowego użytkownika

- Jako nowy użytkownik, chcę stworzyć konto w aplikacji, aby móc korzystać z jej funkcjonalności.
- Kryteria akceptacji:
  1. Użytkownik może utworzyć konto podając email i hasło
  2. System weryfikuje poprawność i unikalność adresu email
  3. Hasło musi spełniać wymogi bezpieczeństwa (min. 8 znaków, wielkie litery, cyfry)
  4. Po poprawnej rejestracji, użytkownik otrzymuje potwierdzenie i może się zalogować
  5. System zapobiega atakom brute force i spam rejestracji

### US-002: Logowanie do aplikacji

- Jako zarejestrowany użytkownik, chcę zalogować się do aplikacji, aby uzyskać dostęp do moich fiszek.
- Kryteria akceptacji:
  1. Użytkownik może zalogować się podając email i hasło
  2. System weryfikuje poprawność danych logowania
  3. W przypadku niepoprawnych danych, system wyświetla ogólny komunikat błędu
  4. Po poprawnym logowaniu, użytkownik ma dostęp do wszystkich funkcji aplikacji

### US-003: Odzyskiwanie hasła

- Jako użytkownik, który zapomniał hasła, chcę zresetować moje hasło, aby odzyskać dostęp do konta.
- Kryteria akceptacji:
  1. Użytkownik może zainicjować proces resetowania hasła podając adres email
  2. System wysyła email z instrukcjami resetowania hasła
  3. Link do resetowania hasła wygasa po 24 godzinach
  4. Użytkownik może ustawić nowe hasło po kliknięciu w link
  5. System potwierdza zmianę hasła i umożliwia zalogowanie się

### US-004: Generowanie fiszek przez AI

- Jako użytkownik, chcę wkleić tekst źródłowy i otrzymać propozycje fiszek wygenerowane przez AI, aby zaoszczędzić czas na manualnym tworzeniu fiszek.
- Kryteria akceptacji:
  1. Użytkownik może wprowadzić tekst źródłowy
  2. System generuje do 5 propozycji fiszek na podstawie tekstu
  3. Propozycje fiszek są wyświetlane w czytelny sposób
  4. Użytkownik może podejrzeć przód i tył każdej proponowanej fiszki
  5. System informuje użytkownika o postępie generowania
  6. W przypadku błędu generowania, system wyświetla zrozumiały komunikat

### US-005: Wybór i edycja wygenerowanych fiszek

- Jako użytkownik, chcę wybrać, edytować i zaakceptować wygenerowane przez AI fiszki, aby dostosować je do moich potrzeb.
- Kryteria akceptacji:
  1. Użytkownik może wybrać jedną lub więcej propozycji fiszek do akceptacji
  2. Użytkownik może edytować tekst na przedniej i tylnej stronie fiszki przed akceptacją
  3. System weryfikuje, czy treść fiszki nie przekracza limitów (tytuł do 100 znaków, treść do 1000 znaków)
  4. Po akceptacji, fiszki są zapisywane w bazie danych użytkownika
  5. Użytkownik otrzymuje potwierdzenie zapisania fiszek

### US-006: Manualne tworzenie fiszki

- Jako użytkownik, chcę manualnie stworzyć fiszkę, aby mieć pełną kontrolę nad jej treścią.
- Kryteria akceptacji:
  1. Użytkownik ma dostęp do formularza z polami dla przodu i tyłu fiszki
  2. System weryfikuje, czy treść fiszki nie przekracza limitów (tytuł do 100 znaków, treść do 1000 znaków)
  3. Po zapisaniu, fiszka jest dodawana do bazy danych użytkownika
  4. Użytkownik otrzymuje potwierdzenie zapisania fiszki
  5. Formularz jest resetowany po zapisaniu fiszki, umożliwiając dodanie kolejnej

### US-007: Przeglądanie listy fiszek

- Jako użytkownik, chcę zobaczyć listę wszystkich moich fiszek, aby móc zarządzać swoją kolekcją.
- Kryteria akceptacji:
  1. System wyświetla listę wszystkich fiszek użytkownika
  2. Lista zawiera podstawowe informacje o fiszkach (np. fragment przodu fiszki)
  3. Lista jest paginowana, jeśli liczba fiszek jest duża
  4. Użytkownik może sortować listę (np. wg daty utworzenia)
  5. System informuje, gdy lista fiszek jest pusta

### US-008: Podgląd pojedynczej fiszki

- Jako użytkownik, chcę zobaczyć szczegóły pojedynczej fiszki, aby przypomnieć sobie jej zawartość.
- Kryteria akceptacji:
  1. Użytkownik może wybrać fiszkę z listy, aby zobaczyć jej szczegóły
  2. System wyświetla pełną treść przodu i tyłu fiszki
  3. Interfejs umożliwia przełączanie między przodem a tyłem fiszki
  4. Z widoku szczegółów fiszki, użytkownik może wrócić do listy fiszek

### US-009: Edycja istniejącej fiszki

- Jako użytkownik, chcę edytować istniejącą fiszkę, aby poprawić jej treść lub zaktualizować informacje.
- Kryteria akceptacji:
  1. Użytkownik może wybrać opcję edycji z widoku szczegółów fiszki
  2. System wyświetla formularz z aktualnymi danymi fiszki
  3. Użytkownik może zmienić treść przodu i tyłu fiszki
  4. System weryfikuje, czy edytowana treść nie przekracza limitów
  5. Po zapisaniu zmian, fiszka jest aktualizowana w bazie danych
  6. Użytkownik otrzymuje potwierdzenie zapisania zmian

### US-010: Usuwanie fiszki

- Jako użytkownik, chcę usunąć fiszkę, której już nie potrzebuję, aby utrzymać porządek w mojej kolekcji.
- Kryteria akceptacji:
  1. Użytkownik może wybrać opcję usunięcia z widoku szczegółów fiszki
  2. System prosi o potwierdzenie przed usunięciem
  3. Po potwierdzeniu, fiszka jest trwale usuwana z bazy danych
  4. Użytkownik otrzymuje potwierdzenie usunięcia fiszki
  5. Po usunięciu, użytkownik jest przekierowywany do listy fiszek

### US-011: Wylogowanie z aplikacji

- Jako zalogowany użytkownik, chcę wylogować się z aplikacji, aby zabezpieczyć moje dane.
- Kryteria akceptacji:
  1. Użytkownik może wylogować się z dowolnego miejsca w aplikacji
  2. System kończy sesję użytkownika
  3. Dostęp do prywatnych danych jest blokowany po wylogowaniu
  4. Użytkownik jest przekierowywany do strony logowania
  5. Wylogowanie działa również po zamknięciu przeglądarki

## 6. Metryki sukcesu

1. Wskaźniki adopcji AI:

   - 75% fiszek wygenerowanych przez AI jest akceptowane przez użytkownika
   - Użytkownicy tworzą 75% fiszek z wykorzystaniem AI (a nie manualnie)

2. Wskaźniki zaangażowania użytkowników:

   - Średni czas spędzony na sesji nauki
   - Częstotliwość powracania do aplikacji
   - Liczba utworzonych fiszek na użytkownika

3. Wskaźniki efektywności nauki:

   - Poprawa w ocenach znajomości materiału w czasie
   - Średni czas potrzebny na opanowanie pojedynczej fiszki

4. Wskaźniki techniczne:

   - Średni czas generowania propozycji fiszek przez AI
   - Czas odpowiedzi aplikacji
   - Liczba zgłoszeń błędów

5. Wskaźniki użyteczności:
   - Współczynnik ukończenia kluczowych ścieżek użytkownika
   - Współczynnik porzuceń na różnych etapach procesu
   - Wyniki ankiet satysfakcji użytkowników
