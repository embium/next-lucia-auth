"use client";

import { FilePlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { type RouterOutputs } from "@/trpc/shared";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
interface NewPostProps {
  isEligible: boolean;
}

export const NewPost = ({ isEligible }: NewPostProps) => {
  const router = useRouter();
  const post = api.post.create.useMutation();

  const createPost = () => {
    if (!isEligible) {
      toast.message("You've reached the limit of posts for your current plan", {
        description: "Upgrade to create more posts",
      });
      return;
    }
    post.mutate(
      {
        title: "Untitled Post",
        content: "Write your content here",
        excerpt: "untitled post",
      },
      {
        onSuccess: ({ id }) => {
          toast.success("Post created");
          router.refresh();
          // This is a workaround for a bug in navigation because of router.refresh()
          setTimeout(() => {
            router.push(`/editor/${id}`);
          }, 100);
        },
        onError: () => {
          toast.error("Failed to create post");
        },
      },
    );
  };

  return (
    <Button
      onClick={createPost}
      className="flex h-full cursor-pointer items-center justify-center bg-card p-6 text-muted-foreground transition-colors hover:bg-secondary/10 dark:border-none dark:bg-secondary/30 dark:hover:bg-secondary/50"
    >
      <div className="flex flex-col items-center gap-4">
        <FilePlusIcon className="h-10 w-10" />
        <p className="text-sm">New Post</p>
      </div>
    </Button>
  );
};
