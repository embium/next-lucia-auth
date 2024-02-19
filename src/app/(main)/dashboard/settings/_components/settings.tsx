"use client";
import { useRef } from "react";
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
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { LoadingButton } from "@/components/loading-button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeftIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type User, type UserRole } from "@prisma/client";
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
  user: Omit<User, "hashedPassword">;
}) => {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const updateUser = api.admin.updateUser.useMutation();
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
          },
        },
      );
    } catch (err) {
      toast.error("Failed to update settings");
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
          disabled={!form.formState.isDirty}
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
