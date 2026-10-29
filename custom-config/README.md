# Custom Config

Ten katalog pakuje niestandardową konfigurację projektu OpenCode. To pliki źródłowe — samo sklonowanie ani zbudowanie repozytorium nie instaluje ich automatycznie.

## Zawartość

- `project/opencode.jsonc` — konfiguracja projektu wybierająca polskiego koordynatora głównego i dołączająca wspólny protokół współpracy.
- `project/.opencode/agents/` — 67 agentów projektowych.
- `project/.opencode/COORDINATION.md` — zasady współpracy, granice bezpieczeństwa i format raportowania.
- `project/04-zrodla-i-licencje.md` — procedura źródeł oraz licencji, do której odwołują się instrukcje.
- `user/plugins/team-run.ts` — równoległe uruchamianie niezależnych zadań agentów, odbiór wyników i kontrola nakładających się zakresów zapisu.
- `user/plugins/work-mode.ts` — dołączanie instrukcji Planowania, Diagnostyki lub Automatu do kontekstu sesji.
- `user/AGENTS.md` i `user/question-protocol.md` — opcjonalne reguły globalne dla konfiguracji użytkownika.

## Użycie w projekcie

Skopiuj `project/opencode.jsonc` do katalogu głównego projektu pod nazwą `opencode.jsonc`. Scal zawartość `project/.opencode/` z katalogiem `.opencode/` projektu — nie zastępuj całego istniejącego `.opencode/`. Skopiuj też `project/04-zrodla-i-licencje.md` do katalogu głównego projektu.

## Opcjonalna konfiguracja użytkownika

Aby udostępnić narzędzie `team_run` i instrukcje trybów we wszystkich projektach, skopiuj `user/plugins/*.ts` do katalogu `plugins/` globalnej konfiguracji OpenCode (w Windows zwykle `%USERPROFILE%\.config\opencode\plugins\`). Pliki `user/AGENTS.md` i `user/question-protocol.md` kopiuj tylko wtedy, gdy chcesz włączyć te zasady globalnie. Przed scaleniem lub zastąpieniem istniejących plików zrób ich kopię.

Sam przełącznik trybów w sidebarze jest częścią niestandardowego TUI z tego repozytorium. Plugin `work-mode.ts` wymaga tego buildu; skopiowanie go do standardowej, niezależnej instalacji OpenCode nie doda kontrolki UI.

## Bezpieczeństwo i zakres

- 67 definicji to katalog specjalizacji, a nie lista agentów uruchamianych przy każdym zadaniu.
- Planowanie i Diagnostyka opierają się na uprawnieniach sesji i instrukcjach, a nie na sandboxie systemu plików. Przed użyciem na wrażliwych projektach sprawdź prośby o uprawnienia i działanie narzędzi.
- Pakiet sam nie włącza zaplanowanych zadań, wdrożeń, instalowania zależności ani innych ryzykownych operacji.
- Pakiet nie zawiera sekretów, kluczy API ani danych osobowych.
