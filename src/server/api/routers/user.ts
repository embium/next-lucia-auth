import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../trpc";

export const userRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        skip: z.number().int().default(1),
        limit: z.number().int().default(100),
      }),
    )
    .query(({ ctx, input }) =>
      ctx.prisma.user.findMany({
        skip: input.skip,
        take: input.limit,
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
  count: protectedProcedure.query(({ ctx }) => ctx.prisma.user.count()),
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
