import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../trpc";
import { Scrypt, generateId } from "lucia";
import { TRPCError } from "@trpc/server";

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
          emailVerified: true,
          avatar: true,
          updatedAt: true,
          createdAt: true,
          role: true,
        },
        orderBy: { createdAt: "asc" },
      }),
    ),
  count: protectedProcedure.query(({ ctx }) => ctx.prisma.user.count()),
  get: protectedProcedure
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
  create: protectedProcedure
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
  edit: protectedProcedure
    .input(
      z.object({
        email: z.string().email("Please enter a valid email"),
        password: z.string()
          .min(8, "Password is too short. Minimum 8 characters required.")
          .max(255).nullish(),
        avatar: z.string().max(255).nullish(),
        emailVerified: z.boolean(),
        role: z.enum(["ADMIN", "USER"]),
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
      console.log(input.password && (await new Scrypt().hash(input.password)));
      await ctx.prisma.user.update({
        where: { email: input.email },
        data: {
          email: input.email,
          emailVerified: input.emailVerified,
          hashedPassword:
            input.password && (await new Scrypt().hash(input.password)),
          avatar: input.avatar,
          role: input.role,
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
