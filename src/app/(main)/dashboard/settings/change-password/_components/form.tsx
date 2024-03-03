"use client";

import { useRef, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { LoadingButton } from "@/components/loading-button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeftIcon } from "lucide-react";

import { type User } from "@prisma/client";
import Link from "next/link";

const schema = z.object({
  currentPassword: z
    .string()
    .min(8, "Password is too short. Minimum 8 characters required.")
    .max(255),
  newPassword: z
    .string()
    .min(8, "Password is too short. Minimum 8 characters required.")
    .max(255),
  confirmNewPassword: z
    .string()
    .min(8, "Password is too short. Minimum 8 characters required.")
    .max(255),
});

export const ChangePasswordForm = ({
  user,
}: {
  user: Omit<User, "hashedPassword" | "role" | "emailVerified" | "avatar">;
}) => {
  const router = useRouter();
  const [disabled, setDisabled] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);
  const changeEmail = api.user.changePassword.useMutation();
  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    resolver: zodResolver(schema),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await changeEmail.mutateAsync(
        { ...values },
        {
          onSuccess: () => {
            toast.success("Password updated");
            router.refresh();
            setDisabled(true);
          },
        },
      );
    } catch (err: any) {
      toast.error(err.message);
    }
  });

  form.watch((data) => {
    if (!!data) {
      setDisabled(false);
    }
  });

  return (
    <>
      <Link
        href="/dashboard/settings"
        className="mb-3 flex items-center gap-2 text-sm text-muted-foreground hover:underline"
      >
        <ArrowLeftIcon className="h-5 w-5" /> back to settings
      </Link>
      <div className="flex items-center gap-2">
        <LoadingButton
          disabled={!form.formState.isDirty || disabled}
          loading={changeEmail.isLoading}
          onClick={() => formRef.current?.requestSubmit()}
          className="ml-auto"
        >
          Save
        </LoadingButton>
      </div>
      <div className="h-6"></div>
      <Form {...form}>
        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="block max-w-screen-md space-y-4"
        >
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmNewPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </>
  );
};
