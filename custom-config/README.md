# Custom Config

Ten katalog zawiera przenośny pakiet konfiguracji OpenCode. W niestandardowym buildzie z tego repozytorium agenci, instrukcje trybów i pluginy agentowe są osadzone w aplikacji i ładują się automatycznie. Pliki tutaj są również dostępne do ręcznego użycia z inną instalacją.

## Zawartość

- `project/opencode.jsonc` — konfiguracja projektu wybierająca polskiego koordynatora głównego i dołączająca wspólny protokół współpracy.
- `project/.opencode/agents/` — 67 agentów projektowych.
- `project/.opencode/COORDINATION.md` — zasady współpracy, granice bezpieczeństwa i format raportowania.
- `project/04-zrodla-i-licencje.md` — procedura źródeł oraz licencji, do której odwołują się instrukcje.
- `user/plugins/team-run.ts` i `user/plugins/work-mode.ts` — kompatybilne kopie pluginów dla ręcznej instalacji; w naszym custom buildzie ich odpowiedniki są wbudowane.
- `user/AGENTS.md` i `user/question-protocol.md` — opcjonalne reguły globalne dla konfiguracji użytkownika.

## Użycie w projekcie

Przy używaniu naszego custom builda nie musisz instalować tych plików ręcznie. Dla innej instalacji skopiuj `project/opencode.jsonc` do katalogu głównego projektu jako `opencode.jsonc`. Scal zawartość `project/.opencode/` z katalogiem `.opencode/` projektu — nie zastępuj całego istniejącego `.opencode/`. Skopiuj też `project/04-zrodla-i-licencje.md` do katalogu głównego projektu.

## Opcjonalna konfiguracja użytkownika

W naszym custom buildzie nie kopiuj pluginów do globalnego katalogu — są wbudowane. Pliki `user/AGENTS.md` i `user/question-protocol.md` również są dołączane do kontekstu przez wbudowany plugin trybów; można je skopiować globalnie tylko w innej instalacji. Kontrolka trybów w sidebarze jest częścią TUI skompilowanego z tego repozytorium i nie pojawi się w standardowym, niezależnym buildzie OpenCode.

## Bezpieczeństwo i zakres

- 67 definicji to katalog specjalizacji, a nie lista agentów uruchamianych przy każdym zadaniu.
- Planowanie i Diagnostyka opierają się na uprawnieniach sesji i instrukcjach, a nie na sandboxie systemu plików. Przed użyciem na wrażliwych projektach sprawdź prośby o uprawnienia i działanie narzędzi.
- Pakiet sam nie włącza zaplanowanych zadań, wdrożeń, instalowania zależności ani innych ryzykownych operacji.
- Pakiet nie zawiera sekretów, kluczy API ani danych osobowych.
