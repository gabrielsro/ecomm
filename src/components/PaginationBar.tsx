"use client";

import { useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { cn } from "@/lib/utils";

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
}

export default function PaginationBar({
  currentPage,
  totalPages,
}: PaginationBarProps) {
  const searchParams = useSearchParams();

  function makeNewLink(page: number): string {
    //Copy the original searchparams:
    const newSearchParams = new URLSearchParams(searchParams);
    //Only change the page param:
    newSearchParams.set("page", page.toString());
    return `?${newSearchParams.toString()}`;
  }

  if (totalPages <= 1) {
    return null;
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={makeNewLink(currentPage - 1)}
            className={cn(
              currentPage === 1 && "pointer-events-none text-muted-foreground",
            )}
          />
        </PaginationItem>
        {Array.from({ length: totalPages }).map((_, i) => {
          //Because array numbers start at 0:
          const pageNumber = i + 1;
          const isEdgePage = pageNumber === 1 || pageNumber === totalPages;
          const isNearCurrentPage = Math.abs(pageNumber - currentPage) <= 2;

          //Only show elipses after the first page and before the last page:
          if (!isEdgePage && !isNearCurrentPage) {
            if (i === 1 || i === totalPages - 2) {
              return (
                <PaginationItem key={i} className="hidden md:block">
                  <PaginationEllipsis className="text-muted-foreground" />
                </PaginationItem>
              );
            }
            return null;
          }

          //If page reached this point, it means its not an ellipsis and its either a nearby, edge or current page, so it must be rendered:
          return (
            <PaginationItem
              key={i}
              className={cn(
                "hidden md:block",
                pageNumber === currentPage && "pointer-events-none block",
              )}
            >
              <PaginationLink
                href={makeNewLink(pageNumber)}
                isActive={pageNumber === currentPage}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        <PaginationItem>
          <PaginationNext
            href={makeNewLink(currentPage + 1)}
            className={cn(
              currentPage >= totalPages &&
                "pointer-events-none text-muted-foreground",
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
