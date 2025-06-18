"use client";

import useUserDataStore from "@/lib/userDataStore";
import { productService } from "@/services/product";
import { product_category_table } from "@prisma/client";
import { RefreshCcwIcon, SearchIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Card, CardHeader } from "../ui/card";
import { FloatingLabelInput } from "../ui/floating-input";
import { Pagination } from "../ui/pagination";
import { Skeleton } from "../ui/skeleton";
import CreateProductCategoryModal from "./CreateProductCategory/CreateProductCategoryModal";
import ProductCollection from "./ProductCollection";

type FormData = {
  search?: string;
};

const ProductCategoryTable = () => {
  const [activePage, setActivePage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<{
    collections: product_category_table[];
    count: number;
  } | null>(null);
  const { register, handleSubmit, reset, getValues } = useForm<FormData>();
  const { userData } = useUserDataStore();

  const hadleFetchCollections = async () => {
    try {
      if (!userData?.teamMemberProfile?.team_member_team_id) return;
      setIsLoading(true);
      const { search } = getValues();
      const data = await productService.getCollections({
        take: 15,
        skip: activePage ?? 0,
        search: search ?? "",
        teamId: userData?.teamMemberProfile?.team_member_team_id,
      });
      setData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    hadleFetchCollections();
  }, [activePage, userData?.teamMemberProfile?.team_member_team_id]);

  const handleRefresh = useCallback(() => {
    setActivePage(1);
    reset();
    hadleFetchCollections();
  }, [reset, hadleFetchCollections]);

  const handleChangePage = useCallback((page: number) => {
    setActivePage(page);
  }, []);

  const collections = data?.collections || [];
  const count = Math.ceil((data?.count || 0) / 15);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <form
          className="flex w-full gap-2"
          onSubmit={handleSubmit(hadleFetchCollections)}
        >
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
            {" "}
            <RefreshCcwIcon className="w-4 h-4" />
          </Button>
        </form>
        <CreateProductCategoryModal setCollections={setData} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="shadow-md">
              <CardHeader>
                <Skeleton className="w-full h-48 rounded-md" />
              </CardHeader>
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </Card>
          ))}
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
