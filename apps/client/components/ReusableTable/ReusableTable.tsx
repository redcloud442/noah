import {
  ColumnDef,
  flexRender,
  Table as ReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import TableLoading from "./TableLoading";

type Props<T> = {
  table: ReactTable<T>;
  columns: ColumnDef<T>[];
  activePage: number;
  totalCount: number;
  isFetchingList: boolean;
  setActivePage: Dispatch<SetStateAction<number>>;
  pageCount: number;
};

const ReusableTable = <T extends object>({
  table,
  columns,
  activePage,
  totalCount,
  isFetchingList,
  setActivePage,
  pageCount,
}: Props<T>) => {
  return (
    <>
      <ScrollArea className="relative w-full overflow-x-auto rounded-md border border-gray-200 dark:border-zinc-700">
        {isFetchingList && <TableLoading />}
        <Table className="relative min-w-full table-auto border-separate border-spacing-0 bg-white dark:bg-zinc-900 text-black dark:text-zinc-100">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-gray-100 dark:bg-zinc-300 border-b border-gray-200 dark:border-zinc-700"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="py-3 px-4 text-center text-sm font-semibold border-r border-gray-200 dark:border-zinc-200 text-black dark:text-black"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getExpandedRowModel().rows.length ? (
              table.getExpandedRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="transition-all duration-300 hover:bg-gray-100 dark:hover:bg-zinc-700"
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="py-3 px-4 text-sm border-b border-r border-gray-100 dark:border-zinc-700"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-40 text-center text-sm text-zinc-500 dark:text-zinc-400"
                >
                  No data found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          <tfoot>
            <TableRow>
              <TableCell colSpan={columns.length} className="px-0">
                <div className="flex justify-between items-center py-2 px-4 bg-zinc-50 dark:bg-zinc-800 border-t border-gray-200 dark:border-zinc-700">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Showing {Math.min(activePage * 10, totalCount)} of{" "}
                    {totalCount} entries
                  </span>
                </div>
              </TableCell>
            </TableRow>
          </tfoot>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <Separator className="my-4 dark:bg-zinc-700" />

      <div className="flex items-center justify-between flex-wrap gap-4 py-2">
        <div className="flex items-center gap-2">
          {activePage > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActivePage((prev) => Math.max(prev - 1, 1))}
              className="rounded-md border border-gray-300 dark:border-zinc-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}

          <div className="flex space-x-1">
            {(() => {
              const maxVisiblePages = 3;
              const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
              let displayedPages = [];

              if (pageCount <= maxVisiblePages) {
                displayedPages = pages;
              } else {
                if (activePage <= 2) {
                  displayedPages = [1, 2, 3, "...", pageCount];
                } else if (activePage >= pageCount - 1) {
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
                    variant={activePage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActivePage(page)}
                    className={`rounded-md px-3 py-1 text-sm font-medium transition-all ${
                      activePage === page
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-700 dark:text-zinc-300 border border-gray-300 dark:border-zinc-600"
                    }`}
                  >
                    {page}
                  </Button>
                ) : (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 py-1 text-zinc-500 dark:text-zinc-400"
                  >
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
              onClick={() =>
                setActivePage((prev) => Math.min(prev + 1, pageCount))
              }
              className="rounded-md border border-gray-300 dark:border-zinc-600"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          Page {activePage} of {pageCount}
        </span>
      </div>
    </>
  );
};

export default ReusableTable;
