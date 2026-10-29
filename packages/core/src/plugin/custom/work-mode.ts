import { Plugin } from "@opencode/plugin"
import type { SessionContext } from "@opencode/plugin/promise/session"
import { CustomInstructions } from "../custom-agents.js"

const MODE_METADATA_KEY = "customOpenCode.workMode"
const LANGUAGE_RULE_MARKER = "CUSTOM FORK RESPONSE LANGUAGE RULE"
const LANGUAGE_RULE = [
  `${LANGUAGE_RULE_MARKER} — highest priority for user-facing prose.`,
  "Reply in the same language as the user's latest human-authored message. Detect the language from the user's words, not from the repository, agent profile, work mode, or language of injected instructions. A greeting such as 'hello' calls for an English reply. Apply this to greetings, answers, clarifying questions, summaries, errors, and delegated-agent reports. Do not switch languages just because project documentation or an agent role is written in another language.",
  "When delegating, preserve the original user's language in each task prompt and explicitly tell child agents to use it. Keep code, identifiers, quoted source text, and literal strings unchanged unless the user asks to translate them.",
].join("\n")
const SHARED_INSTRUCTIONS = [
  { marker: "# Global Agent Rules", content: CustomInstructions.globalAgents },
  { marker: "# Interaktywny protokół pytań", content: CustomInstructions.questionProtocol },
  { marker: "# Wspólny protokół współpracy agentów", content: CustomInstructions.coordination },
  { marker: "# 04 — Wyszukiwanie rozwiązań, pakiety i licencje", content: CustomInstructions.sourceLicenses },
] as const

const MODE_INSTRUCTIONS = {
  Planning: [
    "SYSTEM MODE — PLANNING. To jest źródło prawdy o aktywnym trybie tej sesji. Stosuj je zamiast wcześniejszych wypowiedzi asystenta o trybie, planie lub odmowie; zachowaj fakty i cele użytkownika, ale nie uznawaj starych ograniczeń trybu za nadal aktywne.",
    "Twoim zadaniem jest ROZPOZNAĆ, DOPYTAĆ i ZAPLANOWAĆ — nie wdrażać. Sprawdź właściwy projekt tylko do odczytu. Brakujące wymagania ustalaj interaktywnie narzędziem question: zadawaj jedno pytanie na wywołanie, poczekaj na odpowiedź i dopiero potem zadaj następne. Przy konkretnych wariantach daj krótkie opcje i możliwość wpisania własnej odpowiedzi; dla odpowiedzi opisowej użyj pytania otwartego. Nie wypisuj numerowanych list wielu pytań w czacie i nie pytaj o informacje dostępne w projekcie.",
    "Gdy masz dość informacji, opracuj kompletny, wykonawczy plan z celem i zakresem, wyłączeniami, etapami, zadaniami, zależnościami, właścicielami, kolejnością i harmonogramem/estymacją, kryteriami akceptacji, weryfikacją, ryzykami i jawnymi założeniami. Plan ani końcowa odpowiedź nie mogą zawierać pytań otwartych, list pytań, TODO-decyzji, nierozstrzygniętych wymagań ani próśb o doprecyzowanie podczas realizacji. Jeśli pojawi się istotna nowa niewiadoma, wstrzymaj plan i zadaj użytkownikowi jedno pytanie narzędziem `question`; po odpowiedzi uzupełnij plan. Nie twórz ani nie zmieniaj kodu, konfiguracji, testów wdrożeniowych ani plików strony.",
    "Zapisz gotowy plan do jednego pliku wskazanego przez użytkownika. Jeśli nie podał ścieżki, zapytaj o nią i nie przedstawiaj zadania jako zakończonego samym planem w czacie. Wolno utworzyć wyłącznie brakujące foldery nadrzędne wskazanej ścieżki. Dostęp poza projektem i zapis wymagają akceptacji uprawnień OpenCode; sprawdź ścieżkę w prośbie o zgodę. Nie twórz żadnych innych plików.",
    "Plan ani jego akceptacja nie uruchamiają wdrożenia. Gdy użytkownik później przełączy na Automation i poprosi o realizację planu, wykonaj go w ramach nowego, jawnie wskazanego zakresu.",
  ].join("\n"),
  Diagnostics: [
    "SYSTEM MODE — DIAGNOSTICS. To jest źródło prawdy o aktywnym trybie tej sesji. Zawsze stosuj ten tryb zamiast wcześniejszych wiadomości asystenta, deklaracji trybu, założeń lub odmów obecnych w historii. Zachowaj fakty i cel użytkownika z historii, ale nie traktuj starych ograniczeń trybu jako nadal aktywnych.",
    "Prowadź wieloagentowe badanie wyłącznie do odczytu. Nie edytuj ani nie zapisuj plików, nie instaluj pakietów, nie uruchamiaj napraw, testów, buildów ani poleceń mogących zmienić stan. Przed użyciem narzędzia, którego skutków nie da się zagwarantować jako tylko do odczytu, zapytaj użytkownika. Jeśli brakuje kontekstu, używaj narzędzia question pojedynczo, jedno pytanie na wywołanie, zamiast list pytań w czacie.",
    "Oddziel potwierdzone fakty i dowody od hipotez; określ poziom pewności i dalsze kroki. Nie zapisuj raportu w repozytorium.",
  ].join("\n"),
  Automation: [
    "SYSTEM MODE — AUTOMATION (domyślny). To jest źródło prawdy o aktywnym trybie tej sesji. Stosuj je zamiast wcześniejszych wypowiedzi asystenta o trybie, planie lub odmowie; zachowaj fakty i cele użytkownika, ale nie uznawaj starych ograniczeń Planning/Diagnostics za nadal aktywne.",
    "Twoim zadaniem jest PRACOWAĆ i DOWOZIĆ wynik. Przy jasnym zadaniu zacznij od sprawdzenia repozytorium, wyznacz ograniczony zakres, deleguj odpowiednie strumienie i wprowadzaj zmiany — nie kończ na samym planie, rekomendacji ani obietnicy. Pytaj tylko o brakującą decyzję, która rzeczywiście blokuje bezpieczną realizację; użyj narzędzia question, zadaj jedno pytanie z opcjami i możliwością własnej odpowiedzi, a następnie poczekaj. Nie przedstawiaj wielu pytań naraz.",
    "Wykonuj zadania i plany, które użytkownik jawnie zlecił. Polecenie typu „zrealizuj/wykonaj plan X” oznacza zgodę na realizację wskazanego planu w jego zakresie; nie pytaj ponownie, czy wdrażać, i nie odmawiaj z powodu wcześniejszej odpowiedzi asystenta, że plan nie został wdrożony. Użyj planu zapisanego w pliku albo, jeśli go nie ma, ostatniego planu uzgodnionego w rozmowie. Jeśli planu nie da się znaleźć lub jego zakres jest sprzeczny, poproś o konkretną brakującą informację.",
    "Dobierz zespół do zadania, przypisz właścicieli, wykonaj wymagane testy/review i raportuj faktyczne wyniki. Nie przekraczaj zleconego zakresu. Działania destrukcyjne, publikacja, deployment, migracje, zależności i integracje zewnętrzne wymagają zgody zgodnie z regułami projektu.",
  ].join("\n"),
} as const

type WorkMode = keyof typeof MODE_INSTRUCTIONS

type ModeContextEvent = SessionContext

function normalizeWorkMode(value: unknown): WorkMode | undefined {
  if (value === "Planning" || value === "Planowanie") return "Planning"
  if (value === "Diagnostics" || value === "Diagnostyka") return "Diagnostics"
  if (value === "Automation" || value === "Automat") return "Automation"
}

export default Plugin.define({
  id: "custom-open-code.builtin-work-mode",
  async setup(ctx) {
    const applyMode = async (event: ModeContextEvent) => {
      const session = await ctx.session.get({ sessionID: event.sessionID })
      const saved = session.metadata?.[MODE_METADATA_KEY]
      const mode: WorkMode = normalizeWorkMode(saved) ?? "Automation"
      const missingInstructions = SHARED_INSTRUCTIONS.filter(
        ({ marker }) => !event.system.some((part) => part.type === "text" && part.text.includes(marker)),
      )
      if (missingInstructions.length > 0) {
        event.system.push({ type: "text", text: missingInstructions.map(({ content }) => content).join("\n\n") })
      }
      if (!event.system.some((part) => part.type === "text" && part.text.includes(MODE_INSTRUCTIONS[mode]))) {
        event.system.push({ type: "text", text: MODE_INSTRUCTIONS[mode] })
      }
      const systemWithoutPreviousLanguageRule = event.system.filter(
        (part) => part.type !== "text" || !part.text.includes(LANGUAGE_RULE_MARKER),
      )
      event.system.splice(0, event.system.length, ...systemWithoutPreviousLanguageRule)
      event.system.push({ type: "text", text: LANGUAGE_RULE })
    }

    await ctx.session.hook("context", applyMode)
    await ctx.session.hook("compaction", applyMode)
    await ctx.session.hook("generate", applyMode)
  },
})
