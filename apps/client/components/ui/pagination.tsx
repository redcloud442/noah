import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

type PaginationProps = {
  activePage: number;
  handleChangePage: (page: number) => void;
  pageCount: number;
};

export const Pagination = ({
  activePage,
  handleChangePage,
  pageCount,
}: PaginationProps) => {
  return (
    <div className="flex items-center justify-end gap-x-4 py-4">
      {activePage > 1 && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleChangePage(activePage - 1)}
          disabled={activePage <= 1}
        >
          <ChevronLeft />
        </Button>
      )}

      <div className="flex space-x-2">
        {(() => {
          const maxVisiblePages = 3;
          const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
          let displayedPages = [];

          if (pageCount <= maxVisiblePages) {
            // Show all pages if there are 3 or fewer
            displayedPages = pages;
          } else {
            if (activePage <= 2) {
              // Show the first 3 pages and the last page
              displayedPages = [1, 2, 3, "...", pageCount];
            } else if (activePage >= pageCount - 1) {
              // Show the first page and the last 3 pages
              displayedPages = [
                1,
                "...",
                pageCount - 2,
                pageCount - 1,
                pageCount,
              ];
            } else {
              displayedPages = [
                activePage - 1,
                activePage,
                activePage + 1,
                "...",
                pageCount,
              ];
            }
          }

          return displayedPages.map((page, index) =>
            typeof page === "number" ? (
              <Button
                key={page}
                variant={activePage === page ? "secondary" : "outline"}
                size="sm"
                onClick={() => handleChangePage(page)}
              >
                {page}
              </Button>
            ) : (
              <span key={`ellipsis-${index}`} className="px-2 py-1">
                {page}
              </span>
            )
          );
        })()}
      </div>
      {activePage < pageCount && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleChangePage(activePage + 1)}
          disabled={activePage >= pageCount}
        >
          <ChevronRight />
        </Button>
      )}
    </div>
  );
};
