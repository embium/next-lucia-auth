import { api } from "@/trpc/server";
import PostsTable from "../_components/posts-table";
import { z } from "zod";

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

export default async function Users({ searchParams }: Props) {
  const { skip, limit } = schmea.parse(searchParams);

  const defaultLimit = limit ?? 100;
  const defaultSkip = skip ?? 0;

  const posts = await api.post.list.query({
    skip: defaultSkip,
    limit: defaultLimit,
  });

  const totalUsers = await api.admin.postsCount.query();
  const total = Number(totalUsers);

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
    <>
      <PostsTable posts={posts} />
      <Pagination className="mt-6">
        <PaginationContent>
          {canPageBackwards && (
            <PaginationItem>
              <PaginationPrevious
                href={`?skip=${Math.max(defaultSkip - defaultLimit, 0)}`}
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
                <PaginationLink href={`?skip=${pageSkip}`} key={pageNumber}>
                  {pageNumber}
                </PaginationLink>
              );
            })}
          </PaginationItem>

          {canPageForwards && (
            <PaginationItem>
              <PaginationNext href={`?skip=${defaultSkip + defaultLimit}`} />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </>
  );
}
