"use client";

import * as React from "react";
import { NewPost } from "./new-post";
import { PostCard } from "./post-card";

interface PostsProps {
  posts:
    | {
        status: string;
        id: string;
        createdAt: Date;
        title: string;
        excerpt: string;
      }[]
    | undefined;
}

export function Posts({ posts }: PostsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <NewPost isEligible={true} />
      {posts?.map((post) => <PostCard key={post.id} post={post} />)}
    </div>
  );
}
