import { postRouter } from "./routers/post";
import { userRouter } from "./routers/user";
import { adminRouter } from "./routers/admin";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  user: userRouter,
  post: postRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
