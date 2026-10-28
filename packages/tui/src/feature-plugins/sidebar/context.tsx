import { Plugin } from "@opencode/plugin/tui"
import { createMemo, Show, createSignal } from "solid-js"
import { contextUsage } from "../../util/session"

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export function SidebarContext(props: { context: Plugin.Context; sessionID: string }) {
  const theme = props.context.theme
  const [sessionOpen, setSessionOpen] = createSignal(true)
  const [answerOpen, setAnswerOpen] = createSignal(true)
  const msg = createMemo(() => props.context.data.session.message.list(props.sessionID))
  const session = createMemo(() => props.context.data.session.get(props.sessionID))
  const cost = createMemo(() => props.context.data.session.cost(props.sessionID))

  const state = createMemo(() =>
    contextUsage(msg(), props.context.data.location.model.list(session()?.location), session()?.revert?.messageID),
  )

  return (
    <Show when={state() || cost() > 0}>
      <box gap={1}>
        <box>
          <box
            id="sidebar.context.session.toggle"
            flexDirection="row"
            gap={1}
            onMouseDown={() => setSessionOpen((value) => !value)}
          >
            <text fg={theme.text.base}>{sessionOpen() ? "▼" : "▶"}</text>
            <text fg={theme.text.base}>
              <b>Sesja</b>
            </text>
          </box>
          <Show when={sessionOpen()}>
            <Show when={state()}>
              {(value) => (
                <>
                  <UsageRow
                    label="Tokens"
                    value={`${value().tokens.toLocaleString()} tokens`}
                    color={theme.text.muted}
                  />
                  <Show when={value().percent !== undefined}>
                    <UsageRow label="Used" value={`${value().percent}%`} color={theme.text.muted} />
                  </Show>
                </>
              )}
            </Show>
            <Show when={cost() > 0}>
              <UsageRow label="Koszt" value={money.format(cost())} color={theme.text.muted} />
            </Show>
          </Show>
        </box>
        <Show when={state()}>
          {(value) => (
            <box>
              <box
                id="sidebar.context.answer.toggle"
                flexDirection="row"
                gap={1}
                onMouseDown={() => setAnswerOpen((current) => !current)}
              >
                <text fg={theme.text.base}>{answerOpen() ? "▼" : "▶"}</text>
                <text fg={theme.text.base}>
                  <b>Ostatnia odpowiedź</b>
                </text>
              </box>
              <Show when={answerOpen()}>
                <UsageRow label="Wejściowe" value={value().input.toLocaleString()} color={theme.text.muted} />
                <UsageRow label="Wyjściowe" value={value().output.toLocaleString()} color={theme.text.muted} />
                <UsageRow label="Myślenie" value={value().reasoning.toLocaleString()} color={theme.text.muted} />
                <UsageRow label="Cache" value={value().cache.toLocaleString()} color={theme.text.muted} />
                <UsageRow label="Łącznie" value={value().tokens.toLocaleString()} color={theme.text.muted} bold />
              </Show>
            </box>
          )}
        </Show>
      </box>
    </Show>
  )
}

function UsageRow(props: { label: string; value: string; color: Plugin.Context["theme"]["text"]["muted"]; bold?: boolean }) {
  return (
    <box flexDirection="row" gap={1} minWidth={0}>
      <text fg={props.color} flexGrow={1} flexShrink={1} minWidth={0} wrapMode="none" truncate>
        {props.label}
      </text>
      <text fg={props.color} flexShrink={0} wrapMode="none">
        {props.bold ? <b>{props.value}</b> : props.value}
      </text>
    </box>
  )
}

export default Plugin.define({
  id: "opencode.sidebar.context",
  setup(context) {
    context.ui.slot({
      append: "sidebar.content",
      render: (props) => <SidebarContext context={context} sessionID={props.sessionID} />,
    })
  },
})
