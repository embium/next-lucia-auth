import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../trpc";
import { Scrypt, generateId } from "lucia";
import { TRPCError } from "@trpc/server";

export const adminRouter = createTRPCRouter({
  listUsers: protectedProcedure
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
          emailVerified: true,
          avatar: true,
          updatedAt: true,
          createdAt: true,
          role: true,
        },
        orderBy: { createdAt: "asc" },
      }),
    ),
  countUsers: protectedProcedure.query(({ ctx }) => ctx.prisma.user.count()),
  getUser: protectedProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) => {
      return (
        (input &&
          ctx.prisma.user.findUnique({
            where: { id: input },
          })) ??
        ctx.user
      );
    }),
  createUser: protectedProcedure
    .input(
      z.object({
        email: z.string().email("Please enter a valid email"),
        password: z.string().min(1, "Please provide your password.").max(255),
        avatar: z.string().max(255).nullish(),
        emailVerified: z.boolean(),
        role: z.enum(["ADMIN", "USER"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (user) {
        throw new TRPCError({
          message: "User already exists",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      const userId = generateId(21);
      const hashedPassword = await new Scrypt().hash(input.password);
      await ctx.prisma.user.create({
        data: {
          id: userId,
          email: input.email,
          hashedPassword,
          avatar: input.avatar,
          emailVerified: input.emailVerified,
          role: input.role,
        },
      });
    }),
  updateUser: protectedProcedure
    .input(
      z.object({
        email: z.string().email("Please enter a valid email"),
        password: z
          .string()
          .min(8, "Password is too short. Minimum 8 characters required.")
          .max(255)
          .nullish(),
        avatar: z.string().max(255).nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        throw new TRPCError({
          message: "User doesn't exist",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      await ctx.prisma.user.update({
        where: { email: input.email },
        data: {
          email: input.email,
          hashedPassword:
            input.password && (await new Scrypt().hash(input.password)),
          avatar: input.avatar,
        },
      });
    }),
  deleteManyUsers: protectedProcedure
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
  listPost: protectedProcedure
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
  getPost: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.post.findFirst({
        where: { id: input },
        include: { user: { select: { email: true } } },
      });
    }),
  postsCount: protectedProcedure.query(({ ctx }) => ctx.prisma.post.count({})),
  createPost: protectedProcedure
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

  updatePost: protectedProcedure
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

  deletePost: protectedProcedure
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

  deleteManyPosts: protectedProcedure
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
});
