import type { SessionInfo } from "@opencode/client"
import { Plugin } from "@opencode/plugin/tui"
import { createMemo, createSignal, For, Show } from "solid-js"
import { SidebarSectionHeading } from "./section-heading"
import type { WorkMode } from "../../context/work-mode"

const WORK_MODES = ["Planowanie", "Diagnostyka", "Automat"] as const satisfies readonly WorkMode[]
type AgentStatus = "completed" | "queued" | "working" | "error" | "decision" | "idle"
interface SessionPermissionRule {
  action: string
  resource: string
  effect: "allow" | "deny" | "ask"
}

const MODE_METADATA_KEY = "customOpenCode.workMode"
const BASE_PERMISSIONS_METADATA_KEY = "customOpenCode.basePermissions"
const READ_ONLY_ACTIONS = ["read", "glob", "grep", "subagent", "skill", "question", "webfetch", "websearch", "execute"]
const READ_ONLY_PERMISSIONS: SessionPermissionRule[] = [
  { action: "*", resource: "*", effect: "deny" },
  { action: "read", resource: "*", effect: "allow" },
  { action: "glob", resource: "*", effect: "allow" },
  { action: "grep", resource: "*", effect: "allow" },
  { action: "subagent", resource: "*", effect: "allow" },
  { action: "skill", resource: "*", effect: "allow" },
  { action: "question", resource: "*", effect: "allow" },
  { action: "webfetch", resource: "*", effect: "allow" },
  { action: "websearch", resource: "*", effect: "allow" },
  { action: "execute", resource: "*", effect: "allow" },
]
const PLAN_PERMISSIONS: SessionPermissionRule[] = [
  ...READ_ONLY_PERMISSIONS,
  { action: "edit", resource: "*", effect: "ask" },
  { action: "external_directory", resource: "*", effect: "ask" },
]

const STATUS_ORDER: Record<AgentStatus, number> = {
  decision: 0,
  error: 1,
  working: 2,
  queued: 3,
  completed: 4,
  idle: 5,
}

const STATUS_PRESENTATION: Record<AgentStatus, { icon: string; label: string }> = {
  completed: { icon: "✓", label: "gotowe" },
  queued: { icon: "↻", label: "kolejka" },
  working: { icon: "⚒", label: "pracuje" },
  error: { icon: "!", label: "błąd" },
  decision: { icon: "?", label: "decyzja" },
  idle: { icon: "", label: "" },
}

export function SidebarWorkMode(props: { context: Plugin.Context; sessionID: string }) {
  const theme = props.context.theme
  const [modeOpen, setModeOpen] = createSignal(true)
  const [agentListOpen, setAgentListOpen] = createSignal(true)
  const [mode, setMode] = createSignal<WorkMode>(readMode())
  const [restrictedModeBaseline, setRestrictedModeBaseline] = createSignal(
    readPermissionBaseline(props.context.data.session.get(props.sessionID)?.metadata?.[BASE_PERMISSIONS_METADATA_KEY]),
  )
  const location = () => props.context.location ?? props.context.data.location.default()
  const agents = createMemo(() => props.context.data.location.agent.list(location()) ?? [])
  const sessions = createMemo(() => {
    const rootID = props.context.data.session.root(props.sessionID)
    const sessionIDs = new Set([rootID, ...props.context.data.session.family(rootID)])
    return [...sessionIDs].flatMap((sessionID) => {
      const session = props.context.data.session.get(sessionID)
      return session ? [session] : []
    })
  })
  const rows = createMemo(() =>
    agents()
      .map((agent, index) => ({
        agent,
        index,
        status: agentStatus(agent.id, sessions(), props.context, location()),
      }))
      .sort((left, right) => STATUS_ORDER[left.status] - STATUS_ORDER[right.status] || left.index - right.index),
  )

  function readMode(): WorkMode {
    const saved = props.context.data.session.get(props.sessionID)?.metadata?.[MODE_METADATA_KEY]
    return typeof saved === "string" && WORK_MODES.some((option) => option === saved)
      ? (saved as WorkMode)
      : "Automat"
  }

  async function selectMode(option: WorkMode) {
    try {
      const current = props.context.data.session.get(props.sessionID)
      const metadata: NonNullable<SessionInfo["metadata"]> = {
        ...current?.metadata,
        [MODE_METADATA_KEY]: option,
      }
      let permissions: SessionPermissionRule[] | undefined
      let nextBaseline = restrictedModeBaseline()

      if (option === "Planowanie" || option === "Diagnostyka") {
        const wasRestricted =
          mode() !== "Automat" ||
          current?.metadata?.[MODE_METADATA_KEY] === "Planowanie" ||
          current?.metadata?.[MODE_METADATA_KEY] === "Diagnostyka"
        const baseline = wasRestricted
          ? readPermissionBaseline(current?.metadata?.[BASE_PERMISSIONS_METADATA_KEY]) ?? nextBaseline
          : current?.permissions ?? []
        if (!baseline) throw new Error("Nie można bezpiecznie odtworzyć bazowych uprawnień tej sesji.")
        metadata[BASE_PERMISSIONS_METADATA_KEY] = baseline.map((rule) => ({ ...rule }))
        const retainedRestrictions = baseline.flatMap((rule) => {
          if (rule.effect === "allow") return []
          const restrictedActions =
            option === "Planowanie" ? [...READ_ONLY_ACTIONS, "edit", "external_directory"] : READ_ONLY_ACTIONS
          if (rule.action === "*") return restrictedActions.map((action) => ({ ...rule, action }))
          return restrictedActions.includes(rule.action) ? [rule] : []
        })
        permissions = [
          ...baseline,
          ...(option === "Planowanie" ? PLAN_PERMISSIONS : READ_ONLY_PERMISSIONS),
          ...retainedRestrictions,
        ]
        nextBaseline = baseline
      } else if (
        mode() !== "Automat" ||
        current?.metadata?.[MODE_METADATA_KEY] === "Planowanie" ||
        current?.metadata?.[MODE_METADATA_KEY] === "Diagnostyka"
      ) {
        const baseline = readPermissionBaseline(current?.metadata?.[BASE_PERMISSIONS_METADATA_KEY]) ?? nextBaseline
        if (!baseline) throw new Error("Nie można bezpiecznie odtworzyć bazowych uprawnień tej sesji.")
        delete metadata[BASE_PERMISSIONS_METADATA_KEY]
        permissions = baseline
      }

      await props.context.client.session.update({
        sessionID: props.sessionID,
        metadata,
        ...(permissions === undefined ? {} : { permissions }),
      })
      setMode(option)
      setRestrictedModeBaseline(option === "Automat" ? undefined : nextBaseline)
    } catch (error) {
      props.context.ui.toast.show({
        title: `Nie udało się uruchomić trybu ${option}`,
        message: error instanceof Error ? error.message : "Nieznany błąd podczas uruchamiania trybu.",
        variant: "error",
        sessionID: props.sessionID,
      })
    }
  }

  function readPermissionBaseline(value: unknown): SessionPermissionRule[] | undefined {
    if (!Array.isArray(value)) return
    const rules: unknown[] = value
    const parsed: SessionPermissionRule[] = []
    for (const rule of rules) {
      if (
        typeof rule !== "object" ||
        rule === null ||
        !("action" in rule) ||
        !("resource" in rule) ||
        !("effect" in rule) ||
        typeof rule.action !== "string" ||
        typeof rule.resource !== "string" ||
        (rule.effect !== "allow" && rule.effect !== "deny" && rule.effect !== "ask")
      )
        return
      parsed.push({ action: rule.action, resource: rule.resource, effect: rule.effect })
    }
    return parsed
  }

  return (
    <box gap={1}>
      <box>
        <SidebarSectionHeading
          id="sidebar.work-mode.toggle"
          title="Tryb pracy"
          open={modeOpen()}
          color={theme.text.base}
          onToggle={() => setModeOpen((value) => !value)}
        />
        <Show when={modeOpen()}>
          <box flexDirection="row" gap={1}>
            <For each={WORK_MODES}>
              {(option) => {
                const selected = () => mode() === option
                return (
                  <box
                    id={`sidebar.work-mode.${option}`}
                    paddingLeft={1}
                    paddingRight={1}
                    backgroundColor={selected() ? theme.background.formfield.focused : undefined}
                    onMouseDown={() => void selectMode(option)}
                  >
                    <text fg={selected() ? theme.text.formfield.focused : theme.text.formfield.base}>
                      {selected() ? <b>{option}</b> : option}
                    </text>
                  </box>
                )
              }}
            </For>
          </box>
        </Show>
      </box>

      <box>
        <SidebarSectionHeading
          id="sidebar.agent-list.toggle"
          title="Agent List"
          open={agentListOpen()}
          color={theme.text.base}
          onToggle={() => setAgentListOpen((value) => !value)}
        />
        <Show when={agentListOpen()}>
          <For each={rows()}>
            {({ agent, status }) => (
              <box flexDirection="row" gap={1} minWidth={0}>
                <text fg={statusColor(theme, status)}>{STATUS_PRESENTATION[status].icon || " "}</text>
                <text flexGrow={1} fg={status === "idle" ? theme.text.muted : theme.text.base} wrapMode="none" truncate>
                  {agent.description?.split(" — ")[0] || agent.name}
                </text>
                <Show when={status !== "idle"}>
                  <text fg={statusColor(theme, status)}>{STATUS_PRESENTATION[status].label}</text>
                </Show>
              </box>
            )}
          </For>
        </Show>
      </box>
    </box>
  )
}

function agentStatus(
  agentID: string,
  sessions: SessionInfo[],
  context: Plugin.Context,
  location: ReturnType<Plugin.Context["data"]["location"]["default"]>,
): AgentStatus {
  const assigned = sessions.filter((session) => session.agent === agentID)
  if (assigned.length === 0) return "idle"

  const needsDecision = assigned.some(
    (session) =>
      (context.data.session.permission.list(session.id)?.length ?? 0) > 0 ||
      (context.data.session.form.list(session.id, location)?.length ?? 0) > 0,
  )
  if (needsDecision) return "decision"
  if (assigned.some((session) => context.data.session.status(session.id) === "running")) return "working"
  if (assigned.some((session) => session.parentID && !session.outcome)) return "queued"

  const latest = assigned
    .filter((session) => session.outcome)
    .sort((left, right) => right.time.updated - left.time.updated)[0]
  if (!latest) return "idle"
  return latest.outcome === "succeeded" ? "completed" : "error"
}

function statusColor(theme: Plugin.Context["theme"], status: AgentStatus) {
  if (status === "completed") return theme.text.feedback.success.base
  if (status === "queued") return theme.text.feedback.info.base
  if (status === "working") return theme.text.feedback.warning.base
  if (status === "error" || status === "decision") return theme.text.feedback.error.base
  return theme.text.muted
}

export default Plugin.define({
  id: "opencode.sidebar.work-mode",
  setup(context) {
    context.ui.slot({
      append: "home.prompt",
      render: ({ workMode, onWorkModeChange }) => (
        <HomeWorkMode context={context} workMode={workMode} onWorkModeChange={onWorkModeChange} />
      ),
    })
    context.ui.slot({
      append: "sidebar.content",
      render: ({ sessionID }) => <SidebarWorkMode context={context} sessionID={sessionID} />,
    })
  },
})

function HomeWorkMode(props: {
  context: Plugin.Context
  workMode: string
  onWorkModeChange: (mode: string) => void
}) {
  const theme = props.context.theme

  return (
    <box flexDirection="row" justifyContent="center" gap={1} paddingBottom={1}>
      <For each={WORK_MODES}>
        {(option) => {
          const selected = () => props.workMode === option
          return (
            <box
              id={`home.work-mode.${option}`}
              paddingLeft={1}
              paddingRight={1}
              backgroundColor={selected() ? theme.background.formfield.focused : undefined}
              onMouseDown={() => props.onWorkModeChange(option)}
            >
              <text fg={selected() ? theme.text.formfield.focused : theme.text.formfield.base}>
                {selected() ? <b>{option}</b> : option}
              </text>
            </box>
          )
        }}
      </For>
    </box>
  )
}
