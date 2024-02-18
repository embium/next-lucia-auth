"use client";

import * as React from "react";
import { NewPost } from "./new-post";
import { PostCard } from "./post-card";
import { type Post } from "@prisma/client";

interface PostsProps {
  posts: Post[];
}

export function Posts({ posts }: PostsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <NewPost />
      {posts?.map((post) => <PostCard key={post.id} post={post} />)}
    </div>
  );
}
