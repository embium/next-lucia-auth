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
import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type UserRole } from "@prisma/client";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Please provide your password.").max(255),
  avatar: z.string().max(255).nullish(),
  emailVerified: z.boolean(),
  role: z.enum(["ADMIN", "USER"]),
});

export const NewUser = () => {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const createUser = api.user.create.useMutation();
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      avatar: "",
      emailVerified: false,
      role: "USER" as UserRole,
    },
    resolver: zodResolver(schema),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await createUser.mutateAsync(
      { ...values },
      {
        onSuccess: () => {
          toast.success("User created");
          router.push("/admin");
          location.reload();
        },
        onError: () => {
          toast.error("Failed to create user");
        },
      },
    );
  });

  return (
    <>
      <div className="flex items-center gap-2">
        <LoadingButton
          disabled={!form.formState.isDirty}
          loading={createUser.isLoading}
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
          <FormField
            control={form.control}
            name="emailVerified"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Email Verified</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-[200px] justify-between",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? "True" : "False"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandGroup>
                        <CommandItem
                          value={"true"}
                          onSelect={() => {
                            form.setValue("emailVerified", true);
                          }}
                        >
                          True
                          <CheckIcon
                            className={cn(
                              "ml-auto h-4 w-4",
                              field.value === true
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                        </CommandItem>
                        <CommandItem
                          value={"false"}
                          onSelect={() => {
                            form.setValue("emailVerified", false);
                          }}
                        >
                          False
                          <CheckIcon
                            className={cn(
                              "ml-auto h-4 w-4",
                              field.value === false
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                        </CommandItem>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Role</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-[200px] justify-between",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value === "ADMIN" ? "Admin" : "User"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandGroup>
                        <CommandItem
                          value={"User"}
                          onSelect={() => {
                            form.setValue("role", "USER");
                          }}
                        >
                          User
                          <CheckIcon
                            className={cn(
                              "ml-auto h-4 w-4",
                              field.value === "USER"
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                        </CommandItem>
                        <CommandItem
                          value={"Admin"}
                          onSelect={() => {
                            form.setValue("role", "ADMIN");
                          }}
                        >
                          Admin
                          <CheckIcon
                            className={cn(
                              "ml-auto h-4 w-4",
                              field.value === "ADMIN"
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                        </CommandItem>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </>
  );
};
