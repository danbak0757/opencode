# Custom OpenCode — opis naszej wersji

Ta gałąź jest niezależną, eksperymentalną wersją OpenCode rozwijaną na bazie projektu upstream. Nie jest oficjalnym wydaniem ani nie jest utrzymywana przez zespół OpenCode.

## Cel

Dostosować terminalowe OpenCode do pracy nad zadaniami programistycznymi z pomocą polskojęzycznego, wieloagentowego zespołu. Priorytetem jest jakość zaakceptowanego rezultatu przy możliwie niskim całkowitym koszcie — z uwzględnieniem delegowania, review, poprawek i czasu użytkownika.

Gotowy do skopiowania pakiet agentów i ustawień znajduje się w [`custom-config/`](./custom-config/README.md). Build z tego repozytorium osadza te agenty, instrukcje i pluginy jako domyślne; nie zapisuje ich ani nie nadpisuje konfiguracji użytkownika.

## Tryby pracy

- **Planowanie** — analiza i doprecyzowanie zadania; zapis ograniczony do wskazanego pliku planu.
- **Diagnostyka** — badanie problemu bez modyfikowania plików.
- **Automat** — realizacja uzgodnionego zakresu, z kontrolą i weryfikacją rezultatu.

Interfejs udostępnia wybór trybu oraz listę agentów i ich widocznych stanów. Wybór trybu przekazywany jest do nowej sesji. Tryby z ograniczonym zapisem ustawiają uprawnienia sesji, ale nie należy traktować samego interfejsu ani opisu trybu jako gwarancji bezpieczeństwa — skuteczność granic trzeba sprawdzać dla używanej konfiguracji i narzędzi. Konfiguracja użytkownika i projektu może nadpisać domyślnych agentów.

## Zasady projektu

- Koordynator dobiera agentów do zadania; docelowy katalog specjalizacji nie oznacza uruchamiania wszystkich agentów naraz.
- Prace niezależne mogą być wykonywane równolegle, a wyniki powinny być zebrane, ocenione i zweryfikowane.
- Jakość, testy, poprawki, koszt i czas ocenia się dla pełnego cyklu do akceptacji, a nie tylko pierwszej odpowiedzi ani samych tokenów.
- Działania destrukcyjne i ryzykowne oraz integracje zewnętrznego kodu lub zależności wymagają odpowiedniej zgody.
- Zmiany wdraża się etapowo; wyniki używane do benchmarków i ewaluacji należy zachować jako niezmienione dowody.

## Stan i zastrzeżenia

To praca rozwojowa, a nie gotowa dystrybucja. Dostępne funkcje, ograniczenia uprawnień, koszty i kompatybilność mogą zależeć od wersji OpenCode, dostawcy modeli oraz konfiguracji. Przed użyciem na ważnym repozytorium sprawdź bieżące zmiany, wykonaj kopię zapasową i zweryfikuj granice uprawnień.

Szczegółowe wymagania i plany projektu są prowadzone osobno, poza tym repozytorium źródłowym.
