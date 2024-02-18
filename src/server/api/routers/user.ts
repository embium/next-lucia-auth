import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../trpc";

export const userRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().int().default(1),
        perPage: z.number().int().default(12),
      }),
    )
    .query(({ ctx, input }) =>
      ctx.prisma.user.findMany({
        skip: (input.page - 1) * input.perPage,
        take: input.perPage,
        select: {
          id: true,
          email: true,
          avatar: true,
          updatedAt: true,
          createdAt: true,
          role: true,
        },
      }),
    ),
  get: protectedProcedure.query(({ ctx }) => ctx.user),
  deleteMany: protectedProcedure
    .input(
      z.array(
        z.object({
          id: z.string(),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.user.deleteMany({
        where: {
          id: { in: input.map((id) => id.id) },
        },
      });
    }),
});
