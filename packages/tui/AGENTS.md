# TUI Experiments

- Temporary, opt-in UI experiments belong in the `experiments` registry in `src/component/dialog-experiments.tsx`, with behavior gated by the matching `config.experimental` key.
- The Experiments framework is permanent infrastructure. Keep the registry, dialog, settings persistence, toggle handling, and UI entry point even when there are no active experiments.
- Graduating an experiment means removing only its registry entry and feature-specific gate, making that feature's behavior unconditional. Abandoning an experiment means removing its entry, gate, and experimental behavior.
- Do not remove or simplify away the reusable Experiments infrastructure because the registry is empty. An empty registry is intentional and ready for future experiments, not dead code.

## Live TUI Testing
- Run `bun run dev:live` from a development worktree to test its TUI against the elected `opencode` background server and live sessions. Pass a project directory after the script if needed.
- The script discovers the server via `opencode service status`, injects its private local credential from `opencode service get password`, and uses the `dev` TUI storage channel. Prefer it over plain `bun run dev`; explicit `--server` warns and continues without replacing the live server.

## TUI Stories
- Put fixture-driven stories under `src/feature-plugins/system/storybook` and register them in `index.tsx`. Render the real production component; keep submissions and side effects local. Expose meaningful state dimensions via keybindings listed in `StoryFooter`; add reset when combinations can confuse.
- Run a story with `OPENCODE_STORY=<story-id> bun run dev:live`; test narrow and wide terminal sizes when layout matters.

## TUI Theme Tokens
- Choose theme tokens by semantic role, not current color. Never use raw `theme.hue` or repurpose unrelated tokens.
- Use `text.feedback` / `background.feedback` only for outcome/status feedback; `formfield` for controls/selection markers and `action` for actions.
- If a semantic token is missing, extend schema, defaults, resolution and types. For public token changes verify light/dark defaults, custom fallback and the affected component.
