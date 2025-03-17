"use client";

import { useCollectionQuery } from "@/query/collectionQuery";
import { PlusIcon, RefreshCcwIcon, SearchIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { FloatingLabelInput } from "../ui/floating-input";
import { Pagination } from "../ui/pagination";
import { Skeleton } from "../ui/skeleton";
import ProductCollection from "./ProductCollection";

type FormData = {
  search?: string;
};

type Props = {
  initialData: {
    product_category_id: string;
    product_category_name: string;
    product_category_description: string;
  }[];
};

const ProductCategoryTable = ({ initialData }: Props) => {
  const [activePage, setActivePage] = useState(1);
  const { register, handleSubmit, reset, getValues } = useForm<FormData>();

  const search = getValues("search");

  const { data, isLoading, refetch } = useCollectionQuery(
    15,
    activePage,
    initialData,
    search
  );

  // On submit handler
  const onSubmit = useCallback(
    (data: FormData) => {
      if (data.search) {
        setActivePage(1);
        refetch({
          throwOnError: true,
          cancelRefetch: true,
        });
      } else {
        setActivePage(1);
        refetch();
      }
    },
    [refetch]
  );

  const handleRefresh = useCallback(() => {
    setActivePage(1);
    reset();
    refetch();
  }, [reset, refetch]);

  const handleChangePage = useCallback(
    (page: number) => {
      if (page !== activePage) {
        setActivePage(page);
        refetch({
          throwOnError: true,
          cancelRefetch: true,
        });
      }
    },
    [activePage, refetch]
  );

  const collections = data?.collections || [];
  const count = Math.ceil((data?.count || 0) / 15);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <form className="flex w-full gap-2" onSubmit={handleSubmit(onSubmit)}>
          <FloatingLabelInput
            label="Search"
            className="w-full max-w-xl"
            {...register("search")}
          />

          <Button
            type="submit"
            size="icon"
            variant="outline"
            disabled={isLoading}
          >
            <SearchIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCcwIcon className="w-4 h-4" />
          </Button>
        </form>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">
              <PlusIcon className="w-4 h-4" />
              Create Product Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4 w-full">
          <Skeleton className="w-full h-32" />
          <Skeleton className="w-full max-w-2xl h-32" />
          <Skeleton className="w-full max-w-sm h-32" />
        </div>
      ) : (
        <ProductCollection collections={collections} />
      )}

      <Pagination
        activePage={activePage}
        handleChangePage={handleChangePage}
        pageCount={count}
      />
    </div>
  );
};

export default ProductCategoryTable;
