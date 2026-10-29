import { expect, test } from "bun:test"
import { Agent } from "@opencode/schema/agent"
import { Session } from "@opencode/schema/session"
import { SessionMessage } from "@opencode/schema/session-message"
import { Tool } from "@opencode/schema/tool"
import type { Context } from "@opencode/plugin/promise/plugin"
import type { Info, ToolContext, ToolEditor } from "@opencode/plugin/promise/tool"
import CustomTeamRunPlugin from "@opencode/core/plugin/custom/team-run"

function editor(registered: Info[]): ToolEditor {
  return {
    list: () => registered.map((tool) => ({ ...tool, id: tool.name })),
    get: (name) => {
      const tool = registered.find((candidate) => candidate.name === name)
      return tool === undefined ? undefined : { ...tool, id: name }
    },
    namespace: () => undefined,
    add: (tool) => {
      const existing = registered.findIndex((candidate) => candidate.name === tool.name)
      if (existing === -1) registered.push(tool)
      else registered[existing] = tool
    },
    update: () => undefined,
    remove: () => undefined,
  }
}

function toolContext(agent = "coordinator"): ToolContext {
  return {
    sessionID: Session.ID.make("ses_parent"),
    agent: Agent.ID.make(agent),
    messageID: SessionMessage.ID.make("msg_parent"),
    id: Tool.CallID.make("call_team_run"),
    signal: new AbortController().signal,
    progress: async () => undefined,
  }
}

test("registers team_run and waits for an independent batch to finish", async () => {
  const registered: Info[] = []
  const completeBatch = Promise.withResolvers<void>()
  const childSessions = new Map<string, string>()
  const inherited = new Map<string, { metadata: Record<string, unknown>; permissions: unknown[] }>()
  const childPrompts: string[] = []
  const parentMetadata = { parentKey: "preserved" }
  const parentPermissions = [{ action: "*", resource: "*", effect: "deny" }]
  let nextChild = 0
  let started = 0
  const context = {
    location: { directory: "C:\\workspace" },
    agent: {
      list: async () => ({
        data: [
          { id: "coordinator", mode: "primary" },
          { id: "frontend", mode: "subagent" },
          { id: "reviewer", mode: "subagent" },
        ],
      }),
    },
    tool: { transform: async (callback: (value: ToolEditor) => void) => callback(editor(registered)) },
    permission: { assert: async () => undefined },
    session: {
      get: async () => ({ metadata: parentMetadata, permissions: parentPermissions }),
      create: async (input: {
        agent: string
        metadata?: Record<string, unknown>
        permissions?: Array<{ action: string; resource: string; effect: string }>
      }) => {
        const id = `child-${++nextChild}`
        childSessions.set(id, input.agent)
        inherited.set(id, { metadata: input.metadata ?? {}, permissions: input.permissions ?? [] })
        return { id }
      },
      prompt: async (input: { text: string }) => {
        childPrompts.push(input.text)
      },
      wait: async () => {
        started++
        if (started === 2) completeBatch.resolve()
        await completeBatch.promise
      },
      context: async ({ sessionID }: { sessionID: string }) => [
        { type: "assistant", finish: "stop", content: [{ type: "text", text: `Report from ${sessionID}` }] },
        { type: "idle", outcome: "succeeded" },
      ],
    },
  } as unknown as Context

  await CustomTeamRunPlugin.setup(context)
  const legacy = registered.find((tool) => tool.name === "team_run")
  if (!legacy) throw new Error("Expected the compatibility team_run tool to register")
  registered[registered.indexOf(legacy)] = { ...legacy, description: "legacy compatibility copy" }
  await CustomTeamRunPlugin.setup(context)
  const teamRun = registered.find((tool) => tool.name === "team_run")
  if (!teamRun) throw new Error("Expected the built-in team_run tool to register")
  expect(registered.filter((tool) => tool.name === "team_run")).toHaveLength(1)
  expect(teamRun.description).not.toBe("legacy compatibility copy")

  const result = await teamRun.execute(
    {
      tasks: [
        { id: "frontend", agent: "frontend", goal: "Inspect UI", prompt: "Inspect the UI.", writeScope: ["src/ui"] },
        { id: "review", agent: "reviewer", goal: "Review UI", prompt: "Review the UI.", writeScope: ["src/review"] },
      ],
    },
    toolContext(),
  )
  const report =
    typeof result.content === "string"
      ? result.content
      : result.content?.flatMap((item) => (item.type === "text" ? [item.text] : [])).join("\n") ?? ""

  expect(started).toBe(2)
  expect(childSessions.size).toBe(2)
  expect(inherited.get("child-1")).toEqual({
    metadata: { ...parentMetadata, "customOpenCode.workMode": "Automation" },
    permissions: parentPermissions,
  })
  expect(inherited.get("child-2")).toEqual({
    metadata: { ...parentMetadata, "customOpenCode.workMode": "Automation" },
    permissions: parentPermissions,
  })
  expect(childPrompts.every((prompt) => prompt.includes("Write the handoff in the original end user's language"))).toBe(true)
  expect(report).toContain("Report from child-1")
  expect(report).toContain("Report from child-2")
})

test("blocks overlapping write scopes before creating subagent sessions", async () => {
  const registered: Info[] = []
  let created = false
  const context = {
    location: { directory: "C:\\workspace" },
    agent: { list: async () => ({ data: [{ id: "coordinator", mode: "primary" }, { id: "frontend", mode: "subagent" }] }) },
    tool: { transform: async (callback: (value: ToolEditor) => void) => callback(editor(registered)) },
    permission: { assert: async () => undefined },
    session: {
      get: async () => ({ metadata: { "customOpenCode.workMode": "Automat" } }),
      create: async () => {
        created = true
        return { id: "child" }
      },
    },
  } as unknown as Context

  await CustomTeamRunPlugin.setup(context)
  const teamRun = registered.find((tool) => tool.name === "team_run")
  if (!teamRun) throw new Error("Expected the built-in team_run tool to register")

  await expect(
    teamRun.execute(
      {
        tasks: [
          { id: "one", agent: "frontend", goal: "A", prompt: "A", writeScope: ["src"] },
          { id: "two", agent: "frontend", goal: "B", prompt: "B", writeScope: ["src/ui"] },
        ],
      },
      toolContext(),
    ),
  ).rejects.toThrow("Overlapping write scopes")
  expect(created).toBe(false)
})
