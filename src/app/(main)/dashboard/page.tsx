import { api } from "@/trpc/server";
import * as React from "react";
import { z } from "zod";
import { Posts } from "./_components/posts";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

const schmea = z.object({
  skip: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

export default async function DashboardPage({ searchParams }: Props) {
  const { skip, limit } = schmea.parse(searchParams);

  /**
   * Passing multiple promises to `Promise.all` to fetch data in parallel to prevent waterfall requests.
   * Passing promises to the `Posts` component to make them hot promises (they can run without being awaited) to prevent waterfall requests.
   * @see https://www.youtube.com/shorts/A7GGjutZxrs
   * @see https://nextjs.org/docs/app/building-your-application/data-fetching/patterns#parallel-data-fetching
   */
  const defaultLimit = limit ?? 11;
  const defaultSkip = skip ?? 0;

  const posts = await api.post.myPosts.query({
    skip: defaultSkip,
    limit: defaultLimit,
  });

  const totalPosts = await api.post.myPostsCount.query();

  const total = Number(totalPosts);

  const totalPages = Math.ceil(total / defaultLimit);
  const currentPage = Math.floor(defaultSkip / defaultLimit) + 1;
  const maxPages = 7;
  const halfMaxPages = Math.floor(maxPages / 2);

  const pageNumbers = [] as Array<number>;
  if (totalPages <= maxPages) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    let startPage = currentPage - halfMaxPages;
    let endPage = currentPage + halfMaxPages;

    if (startPage < 1) {
      endPage += Math.abs(startPage) + 1;
      startPage = 1;
    }

    if (endPage > totalPages) {
      startPage -= endPage - totalPages;
      endPage = totalPages;
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
  }

  const canPageBackwards = defaultSkip > 0;
  const canPageForwards = defaultSkip + defaultLimit < total;

  return (
    <div className="py-10 md:py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold md:text-4xl">Posts</h1>
        <p className="text-sm text-muted-foreground">Manage your posts here</p>
      </div>
      <Posts posts={posts} />
      <Pagination className="mt-6">
        <PaginationContent>
          {canPageBackwards && (
            <PaginationItem>
              <PaginationPrevious
                href={`/dashboard/?skip=${Math.max(
                  defaultSkip - defaultLimit,
                  0,
                )}`}
              />
            </PaginationItem>
          )}

          <PaginationItem>
            {pageNumbers.map((pageNumber) => {
              const pageSkip = (pageNumber - 1) * defaultLimit;
              const isCurrentPage = currentPage === pageNumber;
              if (isCurrentPage)
                return (
                  <PaginationLink key={pageNumber}>{pageNumber}</PaginationLink>
                );
              return (
                <PaginationLink
                  href={`/dashboard/?skip=${pageSkip}`}
                  key={pageNumber}
                >
                  {pageNumber}
                </PaginationLink>
              );
            })}
          </PaginationItem>

          {canPageForwards && (
            <PaginationItem>
              <PaginationNext
                href={`/dashboard/?skip=${defaultSkip + defaultLimit}`}
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
}
