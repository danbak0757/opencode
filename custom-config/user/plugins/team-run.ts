import path from "node:path"
import { Plugin } from "@opencode/plugin"

const TOOL_NAME = "team_run"
const TOOL_DESCRIPTION = [
  "Run a batch of independent subagent tasks concurrently and wait for every result.",
  "Use only when each task has a distinct deliverable and non-overlapping writeScope.",
  "Do not put dependent tasks in the same batch; call this tool again after reviewing the prior batch.",
].join(" ")

interface TeamTask {
  id: string
  agent: string
  goal: string
  prompt: string
  writeScope: string[]
}

interface TeamRunInput {
  tasks: TeamTask[]
}

interface TaskResult {
  id: string
  agent: string
  sessionID?: string
  status: "completed" | "failed"
  report: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function parseInput(value: unknown, workspace: string): TeamRunInput {
  if (!isRecord(value) || !Array.isArray(value.tasks) || value.tasks.length === 0) {
    throw new Error("Provide at least one task in the tasks array.")
  }

  const tasks = value.tasks.map((item, index): TeamTask => {
    if (!isRecord(item)) throw new Error(`Task ${index + 1} must be an object.`)
    const { id, agent, goal, prompt, writeScope } = item
    if (typeof id !== "string" || id.trim() === "") throw new Error(`Task ${index + 1} needs a non-empty id.`)
    if (typeof agent !== "string" || agent.trim() === "") throw new Error(`Task ${id} needs an agent id.`)
    if (typeof goal !== "string" || goal.trim() === "") throw new Error(`Task ${id} needs a goal.`)
    if (typeof prompt !== "string" || prompt.trim() === "") throw new Error(`Task ${id} needs a prompt.`)
    if (!Array.isArray(writeScope)) {
      throw new Error(`Task ${id} needs writeScope as an array of non-empty paths; use [] for read-only work.`)
    }
    const validWriteScope = writeScope.filter((path): path is string => typeof path === "string" && path.trim() !== "")
    if (validWriteScope.length !== writeScope.length) {
      throw new Error(`Task ${id} needs writeScope as an array of non-empty paths; use [] for read-only work.`)
    }
    return { id, agent, goal, prompt, writeScope: validWriteScope }
  })

  const ids = new Set<string>()
  for (const task of tasks) {
    if (ids.has(task.id)) throw new Error(`Task id must be unique: ${task.id}`)
    ids.add(task.id)
  }

  const root = path.resolve(workspace)
  const ownedPaths: Array<{ taskID: string; path: string }> = []
  for (const task of tasks) {
    for (const rawPath of task.writeScope) {
      if (path.isAbsolute(rawPath)) throw new Error(`writeScope must be workspace-relative: ${rawPath}`)
      const normalized = path.resolve(root, rawPath)
      const relative = path.relative(root, normalized)
      if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
        throw new Error(`writeScope cannot escape the current workspace: ${rawPath}`)
      }
      const normalizedPath = (relative === "" ? "." : relative).replaceAll("\\", "/").toLowerCase()
      const overlap = ownedPaths.find(({ path: existing }) =>
        normalizedPath === existing || existing === "." || normalizedPath === "." ||
        normalizedPath.startsWith(`${existing}/`) || existing.startsWith(`${normalizedPath}/`),
      )
      if (overlap) {
        throw new Error(`Overlapping write scopes for tasks ${overlap.taskID} and ${task.id}: ${rawPath}`)
      }
      ownedPaths.push({ taskID: task.id, path: normalizedPath })
    }
  }

  return { tasks }
}

function reportFromMessages(messages: unknown): string {
  if (!Array.isArray(messages)) throw new Error("No readable session messages were returned.")
  const idle = [...messages].reverse().find((message) => isRecord(message) && message.type === "idle")
  if (!isRecord(idle)) throw new Error("Subagent session did not return a terminal idle record.")
  if (idle.outcome !== "succeeded") {
    throw new Error(`Subagent session ended with outcome: ${String(idle.outcome)}`)
  }
  const assistantMessages = messages.filter(
    (message): message is { type: "assistant"; content: Array<{ type: string; text?: string }>; finish?: string; error?: unknown } =>
      isRecord(message) && message.type === "assistant" && Array.isArray(message.content),
  )
  const finalMessage = assistantMessages.at(-1)
  if (!finalMessage) throw new Error("No assistant report was returned.")
  const text = finalMessage.content.filter((part) => part.type === "text" && typeof part.text === "string").map((part) => part.text).join("\n")
  if (finalMessage.error) throw new Error(`Subagent ended with an error: ${text || "no error details"}`)
  if (finalMessage.finish !== "stop") throw new Error(`Subagent did not finish with a final response (finish: ${String(finalMessage.finish)}).`)
  if (!text.trim()) throw new Error("Subagent finished without a text report.")
  return text.trim()
}

function taskPrompt(task: TeamTask): string {
  const scope = task.writeScope.length > 0 ? task.writeScope.join("\n- ") : "Read-only; do not modify files."
  return [
    "You are executing one independent workstream for the coordinating agent. Do not address the end user; return a concise handoff report to the coordinator.",
    `Task ID: ${task.id}`,
    `Goal: ${task.goal}`,
    `Write ownership: ${scope}`,
    "Do not modify files outside your write ownership. Do not delegate further. If blocked, return the exact blocker and any partial findings.",
    "Return these headings: Status; Actions; Result; Evidence/sources; Assumptions/unknowns; Changed files; Verification; Risks/blockers; Next step.",
    "Work request:",
    task.prompt,
  ].join("\n\n")
}

export default Plugin.define({
  id: "custom-open-code-team-run",
  async setup(ctx) {
    await ctx.tool.transform((editor) => {
      editor.add({
        name: TOOL_NAME,
        description: TOOL_DESCRIPTION,
        input: {
          type: "object",
          properties: {
            tasks: {
              type: "array",
              minItems: 1,
              description: "Independent tasks to execute concurrently. Dependencies belong in a later batch.",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", minLength: 1, description: "Unique task identifier for this batch." },
                  agent: { type: "string", minLength: 1, description: "Configured subagent ID that owns this workstream." },
                  goal: { type: "string", minLength: 1, description: "Single, verifiable deliverable." },
                  prompt: { type: "string", minLength: 1, description: "Complete task instructions and relevant context." },
                  writeScope: {
                    type: "array",
                    items: { type: "string", minLength: 1 },
                    description: "Exact files/directories this task may edit; use [] for read-only tasks. Scopes must not overlap.",
                  },
                },
                required: ["id", "agent", "goal", "prompt", "writeScope"],
                additionalProperties: false,
              },
            },
          },
          required: ["tasks"],
          additionalProperties: false,
        },
        execute: async (rawInput, toolContext) => {
          const input = parseInput(rawInput, ctx.location.directory)
          const agents = (await ctx.agent.list()).data
          const owner = agents.find((agent) => agent.id === toolContext.agent)
          if (!owner || owner.mode !== "primary") {
            throw new Error("team_run is restricted to primary coordinator agents.")
          }
          const parentSession = await ctx.session.get({ sessionID: toolContext.sessionID })
          const workMode = parentSession.metadata?.["customOpenCode.workMode"] ?? "Automation"
          if (workMode !== "Automat" && workMode !== "Automation" && input.tasks.some((task) => task.writeScope.length > 0)) {
            throw new Error(`Write scopes are not allowed in ${String(workMode)} mode; use read-only tasks with writeScope: [].`)
          }

          for (const task of input.tasks) {
            const agent = agents.find((candidate) => candidate.id === task.agent)
            if (!agent || agent.mode !== "subagent") {
              throw new Error(`Task ${task.id} references an unknown or non-subagent agent: ${task.agent}`)
            }
            await ctx.permission.assert({
              sessionID: toolContext.sessionID,
              agent: toolContext.agent,
              action: "subagent",
              resources: [agent.id],
              save: [agent.id],
              source: { type: "tool", messageID: toolContext.messageID, id: toolContext.id },
            })
          }

          const runTask = async (task: TeamTask): Promise<TaskResult> => {
            let sessionID: string | undefined
            try {
              if (toolContext.signal.aborted) throw new Error("Batch was cancelled before task start.")
              const child = await ctx.session.create({
                parentID: toolContext.sessionID,
                title: `${task.id}: ${task.goal}`,
                agent: task.agent,
                metadata: {
                  ...parentSession.metadata,
                  "customOpenCode.workMode": workMode,
                },
                permissions: parentSession.permissions,
              })
              sessionID = child.id
              await ctx.session.prompt({ sessionID, text: taskPrompt(task) })
              await ctx.session.wait({ sessionID })
              const messages = await ctx.session.context({ sessionID })
              return { id: task.id, agent: task.agent, sessionID, status: "completed", report: reportFromMessages(messages) }
            } catch (error) {
              const detail = error instanceof Error ? error.message : String(error)
              return { id: task.id, agent: task.agent, ...(sessionID ? { sessionID } : {}), status: "failed", report: detail }
            }
          }

          const results = await Promise.all(input.tasks.map(runTask))
          const output = results.map((result) => [
            `## ${result.id} — ${result.status}`,
            `Agent: ${result.agent}`,
            ...(result.sessionID ? [`Session: ${result.sessionID}`] : []),
            result.report,
          ].join("\n")).join("\n\n---\n\n")
          return { content: [{ type: "text", text: output }] }
        },
      })
    })
  },
})
