import { expect, test } from "bun:test"
import { Agent } from "@opencode/core/agent"
import { Model } from "@opencode/schema/model"
import { Session } from "@opencode/schema/session"
import type { SessionContext } from "@opencode/plugin/promise/session"
import CustomWorkModePlugin from "@opencode/core/plugin/custom/work-mode"
import { CustomInstructions } from "@opencode/core/plugin/custom-agents"

type ContextHook = (event: SessionContext) => void | Promise<void>

test("injects shared rules and the selected mode without duplicating existing instructions", async () => {
  let workMode = "Diagnostyka"
  let contextHook: ContextHook | undefined
  const pluginContext = {
    session: {
      get: async () => ({ metadata: { "customOpenCode.workMode": workMode } }),
      hook: async (
        name: string,
        callback: ContextHook,
      ) => {
        if (name === "context") contextHook = callback
        return { dispose: async () => undefined }
      },
    },
  } as unknown as Parameters<typeof CustomWorkModePlugin.setup>[0]

  await CustomWorkModePlugin.setup(pluginContext)
  if (!contextHook) throw new Error("Expected the built-in work-mode context hook to register")

  const event: SessionContext = {
    sessionID: Session.ID.make("ses_custom_work_mode"),
    agent: Agent.ID.make("01-koordynator-główny"),
    model: Model.Ref.parse("openai/gpt-4o"),
    system: [],
    messages: [],
    options: {},
    tools: {},
  }

  await contextHook(event)
  const diagnostics = event.system.filter((part) => part.type === "text").map((part) => part.text).join("\n")
  expect(diagnostics).toContain("SYSTEM MODE — DIAGNOSTICS")
  expect(diagnostics).toContain("# Global Agent Rules")
  expect(diagnostics).toContain("# Interaktywny protokół pytań")
  expect(diagnostics).toContain("# Wspólny protokół współpracy agentów")
  expect(diagnostics).toContain("# 04 — Wyszukiwanie rozwiązań, pakiety i licencje")

  workMode = "Planowanie"
  event.system = [{ type: "text", text: CustomInstructions.coordination }]
  await contextHook(event)
  const planning = event.system.filter((part) => part.type === "text").map((part) => part.text).join("\n")
  expect(planning).toContain("SYSTEM MODE — PLANNING")
  expect(event.system.filter((part) => part.type === "text" && part.text === CustomInstructions.coordination)).toHaveLength(1)

  workMode = "Automat"
  event.system = []
  await contextHook(event)
  const automated = event.system.find((part) => part.type === "text" && part.text.includes("SYSTEM MODE — AUTOMATION"))
  if (!automated || automated.type !== "text") throw new Error("Expected the Automate mode instructions")
  event.system = [automated]
  await contextHook(event)
  expect(event.system.filter((part) => part.type === "text" && part.text.includes("SYSTEM MODE — AUTOMATION"))).toHaveLength(1)

  event.system = [{ type: "text", text: "SYSTEM MODE — stale DIAGNOSTICS instruction" }]
  await contextHook(event)
  expect(
    event.system.some((part) => part.type === "text" && part.text.includes("SYSTEM MODE — AUTOMATION (domyślny)")),
  ).toBe(true)
})
