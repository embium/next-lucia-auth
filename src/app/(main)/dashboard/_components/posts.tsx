"use client";

import * as React from "react";
import { NewPost } from "./new-post";
import { PostCard } from "./post-card";

interface PostsProps {
  posts:
    | {
        id: string;
        userId: string;
        title: string;
        excerpt: string;
        content: string;
        status: string;
        tags: string | null;
        createdAt: Date;
        updatedAt: Date | null;
      }[]
    | undefined;
}

export function Posts({ posts }: PostsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <NewPost />
      {posts?.map((post) => <PostCard key={post.id} post={post} />)}
    </div>
  );
}
