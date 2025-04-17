"use client";

import useUserDataStore from "@/lib/userDataStore";
import { useProductQuery } from "@/query/collectionQuery";
import { createClient } from "@/utils/supabase/client";
import { VariantProductType } from "@/utils/types";
import { product_category_table } from "@prisma/client";
import { RefreshCcwIcon, SearchIcon } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import CollectionVariantContent from "../CollectionSlugPage/CollectionVariantContent";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardHeader } from "../ui/card";
import { FloatingLabelInput } from "../ui/floating-input";
import { Pagination } from "../ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Skeleton } from "../ui/skeleton";

type FormData = {
  search?: string;
  product_category_id?: string;
};

const ProductPage = () => {
  const supabase = createClient();
  const router = useRouter();
  const { teamName } = useParams();

  const [categories, setCategories] = useState<product_category_table[]>([]);
  const [activePage, setActivePage] = useState(1);
  const { register, handleSubmit, reset, getValues, control } =
    useForm<FormData>();
  const { userData } = useUserDataStore();

  const search = getValues("search");
  const category = getValues("product_category_id");

  const { data, isLoading, refetch } = useProductQuery(
    15,
    activePage,
    search,
    userData?.teamMemberProfile?.team_member_team_id,
    category
  );

  const onSubmit = async () => {
    setActivePage(1);
    refetch();
  };

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .schema("product_schema")
          .from("product_category_table")
          .select("*");

        if (error) {
          toast.error(error.message);
        }

        setCategories(data || []);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Error fetching categories");
        }
      }
    };

    fetchCategories();
  }, []);

  const collections = data?.data || [];
  const count = Math.ceil((data?.count || 0) / 15);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <form className="flex w-full gap-2" onSubmit={handleSubmit(onSubmit)}>
          <FloatingLabelInput
            label="Search"
            className="w-full flex-1 max-w-2xl"
            {...register("search")}
          />

          <Controller
            control={control}
            name={`product_category_id`}
            render={({ field }) => (
              <Select onValueChange={field.onChange} {...field}>
                <SelectTrigger className="w-full max-w-sm">
                  <SelectValue placeholder="Select Collections" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.product_category_id}
                      value={category.product_category_id}
                    >
                      {category.product_category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="shadow-md">
                <CardHeader>
                  <Skeleton className="w-full h-48 rounded-md" />
                </CardHeader>
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))
          : collections.map((product: VariantProductType) => (
              <Card
                key={product.product_variant_id}
                className="shadow-md hover:shadow-xl transition cursor-pointer"
                onClick={() =>
                  router.push(
                    `/${teamName}/admin/product/${product.product_variant_slug}`
                  )
                }
              >
                <CardHeader className="relative">
                  <div className="absolute top-2 right-2 z-50 flex flex-col items-end gap-1">
                    {product.product_variant_product?.product_created_at &&
                      new Date().getTime() -
                        new Date(
                          product.product_variant_product?.product_created_at
                        ).getTime() <
                        7 * 24 * 60 * 60 * 1000 && (
                        <Badge className="bg-green-500 text-white">NEW!</Badge>
                      )}
                    {product.variant_sizes.some(
                      (size) => size.variant_size_quantity === 0
                    ) && (
                      <Badge className="bg-gray-500 text-white">SOLD OUT</Badge>
                    )}
                  </div>

                  <div className="relative w-full bg-gray-200 rounded-md overflow-hidden">
                    {product.variant_sample_images?.[0]
                      ?.variant_sample_image_image_url ? (
                      <Image
                        src={
                          product.variant_sample_images?.[0]
                            ?.variant_sample_image_image_url
                        }
                        alt={product.product_variant_product.product_name}
                        width={600}
                        height={400}
                        className="object-cover w-full h-auto"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-64 text-gray-400 text-sm">
                        No Image Available
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CollectionVariantContent product={product} />
              </Card>
            ))}
      </div>

      <Pagination
        activePage={activePage}
        handleChangePage={handleChangePage}
        pageCount={count}
      />
    </div>
  );
};

export default ProductPage;
