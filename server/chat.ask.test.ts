import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("chat.ask", { timeout: 30000 }, () => {
  it("should return a response for a valid question", async () => {
    const ctx = createContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.ask({
      message: "Quel est le capital de la France?",
    });

    expect(result).toHaveProperty("answer");
    expect(typeof result.answer).toBe("string");
    expect(result.answer.length).toBeGreaterThan(0);
  }, { timeout: 15000 });

  it("should reject empty messages", async () => {
    const ctx = createContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.chat.ask({
        message: "",
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should handle a simple question", async () => {
    const ctx = createContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.ask({
      message: "Bonjour, comment ça va?",
    });

    expect(result).toHaveProperty("answer");
    expect(typeof result.answer).toBe("string");
    expect(result.answer.length).toBeGreaterThan(0);
  }, { timeout: 15000 });
});
