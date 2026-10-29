/** @jsxImportSource @opentui/solid */
import { expect, test } from "bun:test"
import { BoxRenderable, RGBA } from "@opentui/core"
import { testRender } from "@opentui/solid"
import type { Context } from "@opencode/plugin/tui/context"
import { normalizeWorkMode } from "../../src/context/work-mode"
import { SidebarWorkMode } from "../../src/feature-plugins/sidebar/work-mode"

interface AgentFixture {
  id: string
  name: string
  description?: string
}

interface SessionFixture {
  id: string
  agent?: string
  metadata?: Record<string, unknown>
  permissions?: Array<{ action: string; resource: string; effect: "allow" | "deny" | "ask" }>
  parentID?: string
  outcome?: "succeeded" | "failed" | "interrupted"
  time: { updated: string }
}

interface ContextOptions {
  agents?: AgentFixture[]
  sessions?: SessionFixture[]
  running?: string[]
  permissions?: string[]
  forms?: string[]
  updates?: Array<{
    sessionID: string
    metadata?: Record<string, unknown>
    permissions?: Array<{ action: string; resource: string; effect: "allow" | "deny" | "ask" }>
  }>
}

test("normalizes legacy stored work modes before session creation", () => {
  expect(normalizeWorkMode("Planowanie")).toBe("Planning")
  expect(normalizeWorkMode("Diagnostyka")).toBe("Diagnostics")
  expect(normalizeWorkMode("Automat")).toBe("Automation")
})

function context(options: ContextOptions = {}) {
  const base = RGBA.fromInts(200, 200, 200)
  const success = RGBA.fromInts(20, 180, 90)
  const info = RGBA.fromInts(50, 130, 220)
  const warning = RGBA.fromInts(220, 170, 20)
  const error = RGBA.fromInts(220, 50, 50)
  const agents = options.agents ?? [
    { id: "01-koordynator-główny", name: "01-koordynator-główny", description: "Koordynator główny" },
    { id: "planner", name: "planner", description: "Planner" },
    { id: "builder", name: "builder", description: "Builder" },
    { id: "reviewer", name: "reviewer", description: "Reviewer" },
  ]
  const sessions = options.sessions ?? [
    { id: "root", agent: "01-koordynator-główny", time: { updated: "2026-01-01T00:00:00Z" } },
  ]
  const sessionByID = new Map(sessions.map((session) => [session.id, session]))
  const active = new Set(options.running ?? ["root"])
  const permissions = new Set(options.permissions ?? [])
  const forms = new Set(options.forms ?? [])
  const updates = options.updates ?? []

  return {
    location: undefined,
    theme: {
      text: {
        base,
        muted: base,
        faint: base,
        formfield: { base, focused: base },
        feedback: {
          success: { base: success },
          info: { base: info },
          warning: { base: warning },
          error: { base: error },
        },
      },
      background: { formfield: { focused: RGBA.fromInts(30, 40, 50) } },
    },
    data: {
      location: {
        default: () => ({ directory: "." }),
        agent: { list: () => agents },
      },
      session: {
        root: () => "root",
        family: () => sessions.filter((session) => session.id !== "root").map((session) => session.id),
        get: (id: string) => sessionByID.get(id),
        status: (id: string) => (active.has(id) ? "running" : "idle"),
        permission: { list: (id: string) => (permissions.has(id) ? [{}] : []) },
        form: { list: (id: string) => (forms.has(id) ? [{}] : []) },
      },
    },
    client: {
      session: {
        update: (input: {
          sessionID: string
          metadata?: Record<string, unknown>
          permissions?: Array<{ action: string; resource: string; effect: "allow" | "deny" | "ask" }>
        }) => {
          updates.push(input)
          const session = sessionByID.get(input.sessionID)
          if (session) {
            if (input.metadata !== undefined) session.metadata = input.metadata
            if (input.permissions !== undefined) session.permissions = input.permissions
          }
          return Promise.resolve({})
        },
      },
    },
    ui: { toast: { show: () => undefined } },
  } as unknown as Context
}

test("sidebar displays selectable work modes and loaded agents", async () => {
  const app = await testRender(() => <SidebarWorkMode context={context()} sessionID="root" />, {
    width: 54,
    height: 20,
  })

  try {
    await app.renderOnce()
    const frame = app.captureCharFrame()
    expect(frame).toContain("Work Mode")
    expect(frame).toContain("Planning")
    expect(frame).toContain("Diagnostics")
    expect(frame).toContain("Automation")
    expect(frame).toContain("Agent List")
    expect(frame).toContain("Lead Coordinator")
    expect(frame).toContain("Planner")
    expect(frame).toContain("Builder")
    expect(frame).toContain("Reviewer")
    expect(frame).not.toContain("gotowe")
    expect(frame).not.toContain("pracuje")
  } finally {
    app.renderer.destroy()
  }
})

test("legacy Polish session mode metadata remains recognized", async () => {
  const app = await testRender(
    () =>
      <SidebarWorkMode
        context={context({
          sessions: [
            {
              id: "root",
              metadata: { "customOpenCode.workMode": "Diagnostyka" },
              time: { updated: "2026-01-01T00:00:00Z" },
            },
          ],
        })}
        sessionID="root"
      />,
    { width: 54, height: 20 },
  )

  try {
    await app.renderOnce()
    const diagnostics = app.renderer.root.findDescendantById("sidebar.work-mode.Diagnostics")! as BoxRenderable
    const automation = app.renderer.root.findDescendantById("sidebar.work-mode.Automation")! as BoxRenderable
    expect(diagnostics.backgroundColor.toInts()).not.toEqual([0, 0, 0, 0])
    expect(automation.backgroundColor.toInts()).toEqual([0, 0, 0, 0])
  } finally {
    app.renderer.destroy()
  }
})

test("agent activity uses distinct states and keeps idle agents at the bottom", async () => {
  const app = await testRender(
    () =>
      <SidebarWorkMode
        context={
          context({
            agents: [
              { id: "idle", name: "idle", description: "Idle" },
              { id: "complete", name: "complete", description: "Completed" },
              { id: "queued", name: "queued", description: "Queued" },
              { id: "working", name: "working", description: "Working" },
              { id: "error", name: "error", description: "Error" },
              { id: "decision", name: "decision", description: "Needs Decision" },
              { id: "question", name: "question", description: "Question" },
            ],
            sessions: [
              { id: "root", time: { updated: "2026-01-01T00:00:00Z" } },
              {
                id: "complete-task",
                agent: "complete",
                parentID: "root",
                outcome: "succeeded",
                time: { updated: "2026-01-01T00:04:00Z" },
              },
              {
                id: "queued-task",
                agent: "queued",
                parentID: "root",
                time: { updated: "2026-01-01T00:03:00Z" },
              },
              {
                id: "working-task",
                agent: "working",
                parentID: "root",
                time: { updated: "2026-01-01T00:02:00Z" },
              },
              {
                id: "error-task",
                agent: "error",
                parentID: "root",
                outcome: "failed",
                time: { updated: "2026-01-01T00:01:00Z" },
              },
              {
                id: "decision-task",
                agent: "decision",
                parentID: "root",
                time: { updated: "2026-01-01T00:00:30Z" },
              },
              {
                id: "question-task",
                agent: "question",
                parentID: "root",
                time: { updated: "2026-01-01T00:00:20Z" },
              },
            ],
            running: ["working-task"],
            permissions: ["decision-task"],
            forms: ["question-task"],
          })
        }
        sessionID="root"
      />,
    { width: 64, height: 28 },
  )

  try {
    await app.renderOnce()
    const frame = app.captureCharFrame()
    const names = ["Needs Decision", "Question", "Error", "Working", "Queued", "Completed", "Idle"]
    const positions = names.map((name) => frame.indexOf(name))
    expect(positions.every((position) => position >= 0)).toBe(true)
    expect(positions).toEqual([...positions].sort((left, right) => left - right))
    expect(frame).not.toContain("decyzja")
    expect(frame).not.toContain("błąd")
    expect(frame).not.toContain("pracuje")
    expect(frame).not.toContain("kolejka")
    expect(frame).not.toContain("gotowe")
    expect(frame).toContain("?")
    expect(frame).toContain("!")
    expect(frame).toContain("⚒")
    expect(frame).toContain("↻")
    expect(frame).toContain("✓")
  } finally {
    app.renderer.destroy()
  }
})

test("work mode can be selected and both sidebar sections collapse independently", async () => {
  const updates: NonNullable<ContextOptions["updates"]> = []
  const basePermissions = [
    { action: "shell", resource: "*", effect: "ask" as const },
    { action: "read", resource: "*.env", effect: "deny" as const },
  ]
  const app = await testRender(
    () =>
      <SidebarWorkMode
        context={
          context({
            updates,
            sessions: [
              {
                id: "root",
                agent: "01-koordynator-główny",
                metadata: { projectTag: "preserve" },
                permissions: basePermissions,
                time: { updated: "2026-01-01T00:00:00Z" },
              },
            ],
          })
        }
        sessionID="root"
      />,
    {
    width: 54,
    height: 20,
    },
  )

  try {
    await app.renderOnce()
    const planning = app.renderer.root.findDescendantById("sidebar.work-mode.Planning")! as BoxRenderable
    const automation = app.renderer.root.findDescendantById("sidebar.work-mode.Automation")! as BoxRenderable
    expect(automation.backgroundColor.toInts()).not.toEqual([0, 0, 0, 0])

    await app.mockMouse.click(planning.x, planning.y)
    await app.renderOnce()
    expect(updates).toEqual([
      {
        sessionID: "root",
        metadata: {
          projectTag: "preserve",
          "customOpenCode.workMode": "Planning",
          "customOpenCode.basePermissions": basePermissions,
        },
        permissions: [
          ...basePermissions,
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
          { action: "edit", resource: "*", effect: "ask" },
          { action: "external_directory", resource: "*", effect: "ask" },
          { action: "read", resource: "*.env", effect: "deny" },
        ],
      },
    ])
    expect(planning.backgroundColor.toInts()).not.toEqual([0, 0, 0, 0])
    expect(automation.backgroundColor.toInts()).toEqual([0, 0, 0, 0])

    const diagnostics = app.renderer.root.findDescendantById("sidebar.work-mode.Diagnostics")! as BoxRenderable
    await app.mockMouse.click(diagnostics.x, diagnostics.y)
    await app.renderOnce()
    expect(updates[1]).toEqual({
      sessionID: "root",
      metadata: {
        projectTag: "preserve",
        "customOpenCode.workMode": "Diagnostics",
        "customOpenCode.basePermissions": basePermissions,
      },
      permissions: [
        ...basePermissions,
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
        { action: "read", resource: "*.env", effect: "deny" },
      ],
    })

    await app.mockMouse.click(automation.x, automation.y)
    await app.renderOnce()
    expect(updates[2]).toEqual({
      sessionID: "root",
      metadata: { projectTag: "preserve", "customOpenCode.workMode": "Automation" },
      permissions: basePermissions,
    })

    const modeToggle = app.renderer.root.findDescendantById("sidebar.work-mode.toggle")!
    await app.mockMouse.click(modeToggle.x, modeToggle.y)
    await app.renderOnce()
    expect(app.captureCharFrame()).not.toContain("Diagnostics")
    expect(app.captureCharFrame()).toContain("Agent List")

    const agentToggle = app.renderer.root.findDescendantById("sidebar.agent-list.toggle")!
    await app.mockMouse.click(agentToggle.x, agentToggle.y)
    await app.renderOnce()
    expect(app.captureCharFrame()).not.toContain("Lead Coordinator")
    expect(app.captureCharFrame()).toContain("Agent List")
  } finally {
    app.renderer.destroy()
  }
})
