# 04 — Wyszukiwanie rozwiązań, pakiety i licencje

## Zakres źródeł
Publiczne repozytoria GitHub, oficjalna dokumentacja oraz rejestry pakietów. Użytkownik nie zatwierdził dostępu do repozytoriów prywatnych; nie zakładamy ich użycia.

## Procedura przed implementacją
1. Ustalić, czy istnieje utrzymywane i pasujące rozwiązanie, biblioteka lub oficjalny wzorzec.
2. Sprawdzić źródło, aktywność/utrzymanie, kompatybilność, bezpieczeństwo i zależności.
3. Odczytać licencję z repozytorium/pakietu i określić, czy dopuszcza użycie w komercyjnej aplikacji.
4. Przedstawić użytkownikowi krótkie porównanie: link, licencja, co chcemy wykorzystać, obowiązki/ryzyka, alternatywa bez dodawania.
5. Czekać na zgodę przed kopiowaniem kodu, dodaniem zależności lub integracją zewnętrznego materiału, jeśli użytkownik tego nie zlecił. Jednoznaczne polecenie użycia bezpłatnych zdjęć stockowych jest zgodą na wyszukanie i użycie pasujących zdjęć po sprawdzeniu ich konkretnych źródeł i licencji; nie pytaj ponownie o tę samą zgodę.
6. Zachować informację o źródle i wymaganych atrybucjach w dokumentacji projektu.

## Polityka licencyjna
- Preferować licencje uznawane za permissive i zgodne z komercyjnym użyciem (np. MIT, BSD, Apache-2.0), po weryfikacji warunków i zależności.
- Licencje copyleft, ograniczające użycie, brak licencji lub niejasna sytuacja: nie integrować tego konkretnego zasobu. Przy zdjęciach stockowych najpierw szukaj alternatywy z jasnymi warunkami; pytaj użytkownika tylko wtedy, gdy nie ma pasującej, zweryfikowanej alternatywy albo wybór zmienia istotnie zakres/ryzyko.
- Nie przedstawiać analizy jako porady prawnej ani nie twierdzić, że sama obecność na GitHubie daje prawo do użycia.
- Dodawanie zależności zawsze jest propozycją do zatwierdzenia przez użytkownika.

## Fotografie stockowe w pracach wizualnych

- Przy zadaniu wymagającym fotografii agent wizualny ma korzystać z bezpłatnego banku stockowego, preferencyjnie Pexels lub Pixabay. Unsplash wolno stosować po sprawdzeniu aktualnej licencji; użycie API wymaga ponadto przestrzegania jego odrębnych wytycznych (w tym hotlinkowania i atrybucji).
- Dla każdego wykorzystanego zdjęcia zachować ścieżkę/nazwę lokalnego pliku, adres strony zdjęcia, autora gdy podany, adres warunków/licencji, datę weryfikacji i wymaganą atrybucję. Powiąż każdy wpis z plikiem faktycznie użytym w UI. Nie zakładaj, że pobranie lokalnej kopii znosi warunki licencji ani że „darmowe” oznacza brak ograniczeń: sprawdź zakazy redystrybucji, użycia jako znak towarowy, wizerunek osób i kontekst sugerujący poparcie.
- Jeśli użytkownik jawnie wymaga zdjęć stockowych, są one kryterium akceptacji, a nie opcjonalną sugestią. Nie zastępuj ich po cichu ilustracjami CSS/SVG, obrazami generowanymi ani pustymi placeholderami; jeśli pierwsze wyszukiwanie nie da odpowiedniego zdjęcia, sprawdź kolejne źródła albo zgłoś konkretny, udokumentowany blocker.
- Korzystaj ze strony konkretnego zdjęcia i zweryfikuj sam obraz; nie używaj wyników wyszukiwarki jako źródła licencji. Preferuj lokalne pliki projektu zamiast hotlinkowania, chyba że warunki używanego API wymagają innego sposobu. Dodaj atrybucję, jeśli licencja lub warunki banku jej wymagają.
- Dopasuj zdjęcie do prezentowanej treści: nie pokazuj zdjęcia kontekstowego jako wiernego zdjęcia fikcyjnego produktu. Jeśli zdjęcie przedstawia aranżację/lifestyle, oznacz je jako takie i dobierz osobne ujęcie przedmiotu do karty/PDP, gdy wymagane jest zdjęcie produktu.
- Jeśli pochodzenia lub warunków konkretnego materiału nie da się potwierdzić, nie używać go; wybrać inne zdjęcie albo zgłosić blokadę. Wykorzystanie musi spełniać warunki banku w chwili użycia.
- Oficjalne punkty startowe: [Pexels License](https://www.pexels.com/license/), [Pixabay License Summary](https://pixabay.com/service/license-summary/), [Unsplash License](https://unsplash.com/license/) i [Unsplash API Guidelines](https://help.unsplash.com/en/articles/2511245-unsplash-license).
