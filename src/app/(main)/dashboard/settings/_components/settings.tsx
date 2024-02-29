"use client";

import { useRef, useState } from "react";
import { set, z } from "zod";
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
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password is too short. Minimum 8 characters required.")
    .max(255)
    .nullish(),
  avatar: z.string().max(255).nullish(),
});

export const SettingsForm = ({
  user,
}: {
  user: Omit<User, "hashedPassword" | "role" | "emailVerified">;
}) => {
  const router = useRouter();
  const [disabled, setDisabled] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);
  const updateUser = api.user.edit.useMutation();
  const form = useForm({
    defaultValues: {
      email: user.email,
      password: undefined,
      avatar: user.avatar ?? "",
    },
    resolver: zodResolver(schema),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateUser.mutateAsync(
        { ...values },
        {
          onSuccess: () => {
            toast.success("Settings updated");
            router.refresh();
            setDisabled(true);
          },
        },
      );
    } catch (err) {
      toast.error("Failed to update settings");
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
        href="/admin"
        className="mb-3 flex items-center gap-2 text-sm text-muted-foreground hover:underline"
      >
        <ArrowLeftIcon className="h-5 w-5" /> back to admin
      </Link>
      <div className="flex items-center gap-2">
        <LoadingButton
          disabled={!form.formState.isDirty || disabled}
          loading={updateUser.isLoading}
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="avatar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Avatar</FormLabel>
                <FormControl>
                  <Input {...field} />
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
