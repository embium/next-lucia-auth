import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../trpc";
import { Scrypt, generateId } from "lucia";

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
        orderBy: { createdAt: "asc" },
      }),
    ),
  count: protectedProcedure.query(({ ctx }) => ctx.prisma.user.count()),
  get: protectedProcedure.query(({ ctx }) => ctx.user),
  create: protectedProcedure
    .input(
      z.object({
        email: z.string().email("Please enter a valid email"),
        password: z.string().min(1, "Please provide your password.").max(255),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = generateId(21);
      const hashedPassword = await new Scrypt().hash(input.password);
      await ctx.prisma.user.create({
        data: {
          id: userId,
          email: input.email,
          hashedPassword: input.password,
        },
      });
    }),
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
