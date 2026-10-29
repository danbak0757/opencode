import type { Plugin } from "@opencode/plugin/tui"

export function SidebarSectionHeading(props: {
  id: string
  title: string
  open: boolean
  color: Plugin.Context["theme"]["text"]["base"]
  onToggle: () => void
}) {
  return (
    <box id={props.id} flexDirection="row" gap={1} onMouseDown={props.onToggle}>
      <text fg={props.color}>{props.open ? "▼" : "▶"}</text>
      <text fg={props.color}>
        <b>{props.title}</b>
      </text>
    </box>
  )
}
