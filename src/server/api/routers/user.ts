import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../trpc";
import { Scrypt, generateId } from "lucia";
import { TRPCError } from "@trpc/server";
import { generateEmailVerificationCode } from "@/lib/auth/actions";
import { sendEmail } from "@/server/send-mail";
import { renderVerificationCodeEmail } from "@/lib/email-templates/email-verification";

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
      const user = await ctx.prisma.user.findFirst({
        where: { email: input.email },
        select: { email: true },
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
        password: z
          .string()
          .min(8, "Password is too short. Minimum 8 characters required.")
          .max(255),
        avatar: z.string().max(255).nullish(),
      }),
    )
    .output(z.object({ message: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: ctx.user.email },
      });

      if (!user) {
        throw new TRPCError({
          message: "User doesn't exist",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      if (input.email !== ctx.user.email) {
        const verificationCode = await generateEmailVerificationCode(
          user.id,
          input.email,
        );

        await sendEmail({
          to: input.email,
          subject: "Verify your account",
          html: renderVerificationCodeEmail({ code: verificationCode }),
        });

        await ctx.prisma.user.update({
          where: { email: user.email },
          data: {
            email: input.email,
            hashedPassword:
              input.password && (await new Scrypt().hash(input.password)),
            avatar: input.avatar,
            emailVerified: false,
          },
        });

        return { message: "Email verification sent" };
      }

      await ctx.prisma.user.update({
        where: { email: user.email },
        data: {
          email: input.email,
          hashedPassword:
            input.password && (await new Scrypt().hash(input.password)),
          avatar: input.avatar,
        },
      });

      return { message: "User updated" };
    }),
  changeEmail: protectedProcedure
    .input(
      z.object({
        email: z.string().email("Please enter a valid email"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: ctx.user.email },
      });

      if (!user) {
        throw new TRPCError({
          message: "User doesn't exist",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      if (input.email !== ctx.user.email) {
        const verificationCode = await generateEmailVerificationCode(
          user.id,
          input.email,
        );

        await sendEmail({
          to: input.email,
          subject: "Verify your account",
          html: renderVerificationCodeEmail({ code: verificationCode }),
        });

        await ctx.prisma.user.update({
          where: { email: user.email },
          data: {
            email: input.email,
            emailVerified: false,
          },
        });

        return { message: "Email verification sent" };
      }

      return { message: "Email unchanged" };
    }),
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(8).max(255),
        newPassword: z
          .string()
          .min(8, "Password is too short. Minimum 8 characters required.")
          .max(255),
        confirmNewPassword: z.string().min(8).max(255),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: ctx.user.email },
      });

      if (!user) {
        throw new TRPCError({
          message: "User doesn't exist",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      if (input.newPassword !== input.confirmNewPassword) {
        throw new TRPCError({
          message: "Passwords do not match",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      const validPassword = await new Scrypt().verify(
        user.hashedPassword,
        input.currentPassword,
      );

      if (!validPassword) {
        throw new TRPCError({
          message: "Incorrect password",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      const hashedPassword = await new Scrypt().hash(input.newPassword);
      await ctx.prisma.user.update({
        where: { email: user.email },
        data: {
          hashedPassword,
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
