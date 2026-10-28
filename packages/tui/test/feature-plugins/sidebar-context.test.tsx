/** @jsxImportSource @opentui/solid */
import { expect, test } from "bun:test"
import { RGBA } from "@opentui/core"
import { testRender } from "@opentui/solid"
import type { Context } from "@opencode/plugin/tui/context"
import { SidebarContext } from "../../src/feature-plugins/sidebar/context"

function context(options?: {
  cost?: number
  usage?: { input: number; output: number; reasoning: number; cache: { read: number; write: number } }
}) {
  const color = RGBA.fromInts(200, 200, 200)
  return {
    theme: { text: { base: color, muted: color } },
    data: {
      session: {
        get: () => ({ location: { directory: "/workspace" } }),
        cost: () => options?.cost ?? 0,
        message: {
          list: () =>
            options?.usage
              ? [
                  {
                    id: "message",
                    type: "assistant",
                    model: { providerID: "provider", id: "model" },
                    tokens: options.usage,
                  },
                ]
              : [],
        },
      },
      location: {
        model: { list: () => [] },
      },
    },
  } as unknown as Context
}

test("sidebar omits context before usage is available", async () => {
  const app = await testRender(() => <SidebarContext context={context()} sessionID="session" />, {
    width: 42,
    height: 8,
  })

  try {
    await app.renderOnce()
    expect(app.captureCharFrame()).not.toContain("Context")
    expect(app.captureCharFrame()).not.toContain("Not measured")
  } finally {
    app.renderer.destroy()
  }
})

test("sidebar shows session and last-response token usage in aligned sections", async () => {
  const app = await testRender(
    () => (
      <SidebarContext
        context={
          context({
            usage: { input: 100, output: 20, reasoning: 30, cache: { read: 40, write: 10 } },
          })
        }
        sessionID="session"
      />
    ),
    {
      width: 42,
      height: 16,
    },
  )

  try {
    await app.renderOnce()
    const frame = app.captureCharFrame()
    expect(frame).toContain("Sesja")
    expect(frame).toContain("Tokens")
    expect(frame).toContain("200 tokens")
    expect(frame).toContain("Ostatnia odpowiedź")
    expect(frame).toContain("Wejściowe")
    expect(frame).toContain("100")
    expect(frame).toContain("Wyjściowe")
    expect(frame).toContain("20")
    expect(frame).toContain("Myślenie")
    expect(frame).toContain("30")
    expect(frame).toContain("Cache")
    expect(frame).toContain("50")
    expect(frame).toContain("Łącznie")
    const lines = frame.split("\n")
    const tokensLine = lines.findIndex((line) => line.includes("Tokens"))
    expect(lines[tokensLine + 1]?.trim()).toBe("")
    expect(lines[tokensLine + 2]).toContain("Ostatnia odpowiedź")
  } finally {
    app.renderer.destroy()
  }
})

test("sidebar can collapse session and last-response sections independently", async () => {
  const app = await testRender(
    () => <SidebarContext context={context({ usage: { input: 100, output: 20, reasoning: 30, cache: { read: 40, write: 10 } } })} sessionID="session" />,
    { width: 42, height: 16 },
  )

  try {
    await app.renderOnce()
    const sessionToggle = app.renderer.root.findDescendantById("sidebar.context.session.toggle")!
    await app.mockMouse.click(sessionToggle.x, sessionToggle.y)
    await app.renderOnce()
    expect(app.captureCharFrame()).toContain("Ostatnia odpowiedź")
    expect(app.captureCharFrame()).not.toContain("Tokens")

    const answerToggle = app.renderer.root.findDescendantById("sidebar.context.answer.toggle")!
    await app.mockMouse.click(answerToggle.x, answerToggle.y)
    await app.renderOnce()
    expect(app.captureCharFrame()).not.toContain("Wejściowe")
  } finally {
    app.renderer.destroy()
  }
})
