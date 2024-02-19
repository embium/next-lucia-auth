import { generateId } from "lucia";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const postRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        skip: z.number().int().default(1),
        limit: z.number().int().default(12),
      }),
    )
    .query(({ ctx, input }) =>
      ctx.prisma.post.findMany({
        skip: input.skip,
        take: input.limit,
      }),
    ),
  get: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const userId = ctx.user.role === "ADMIN" ? undefined : ctx.user.id;
    return await ctx.prisma.post.findFirst({
      where: { id: input, userId: userId },
      include: { user: { select: { email: true } } },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3).max(255),
        excerpt: z.string().min(3).max(255),
        content: z.string().min(3),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const id = generateId(15);

      await ctx.prisma.post.create({
        data: {
          id,
          userId: ctx.user.id,
          title: input.title,
          excerpt: input.excerpt,
          content: input.content,
        },
      });

      return { id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(3).max(255),
        excerpt: z.string().min(3).max(255),
        content: z.string().min(3),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.role === "ADMIN" ? undefined : ctx.user.id;
      await ctx.prisma.post.update({
        where: {
          id: input.id,
          userId,
        },
        data: {
          title: input.title,
          excerpt: input.excerpt,
          content: input.content,
        },
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.post.delete({
        where: {
          id: input.id,
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
      await ctx.prisma.post.deleteMany({
        where: {
          id: { in: input.map((id) => id.id) },
        },
      });
    }),

  myPosts: protectedProcedure
    .input(
      z.object({
        skip: z.number().int().default(1),
        limit: z.number().int().default(12),
      }),
    )
    .query(({ ctx, input }) =>
      ctx.prisma.post.findMany({
        skip: input.skip,
        take: input.limit,
        where: {
          userId: ctx.user.id,
        },
        orderBy: { createdAt: "desc" },
      }),
    ),
  myPostsCount: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.post.count({
      where: {
        userId: ctx.user.id,
      },
    }),
  ),
});
