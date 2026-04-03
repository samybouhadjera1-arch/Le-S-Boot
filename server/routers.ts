import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  chat: router({
    ask: publicProcedure
      .input(z.object({ message: z.string().min(1) }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "Tu es Le S Boot, un assistant IA intelligent et utile. Tu réponds en français de manière claire, concise et amicale. Tu peux répondre à n'importe quelle question sur n'importe quel sujet. Sois toujours courtois et informatif.",
              },
              {
                role: "user",
                content: input.message,
              },
            ],
          });

          const answer = response.choices[0]?.message?.content || "Désolé, je n'ai pas pu générer une réponse.";

          return {
            answer: typeof answer === "string" ? answer : JSON.stringify(answer),
          };
        } catch (error) {
          console.error("LLM Error:", error);
          throw new Error("Impossible de traiter votre demande. Veuillez réessayer.");
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
