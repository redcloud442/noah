"use client";

import { productService } from "@/services/product";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { HoverVariantTypeCard } from "../CollectionNamePage/CollectionNamePage";
import { Button } from "../ui/button";
import { FloatingLabelInput } from "../ui/floating-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type FormType = {
  search: string | null;
  price: string | null;
  category: string | null;
  sort: string | null;
  branch?: string;
};

const sortOptions = [
  { label: "Price (Low to High)", value: "price_asc" },
  { label: "Price (High to Low)", value: "price_desc" },
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Featured", value: "featured" },
  { label: "Best Seller", value: "best_seller" },
];

const ShopPage = () => {
  const searchParams = useSearchParams();
  const REFERRAL_CODE = searchParams.get("REFERRAL_CODE") as string;

  const { register, handleSubmit, control } = useForm<FormType>({
    defaultValues: {
      branch: "16dcbf9a-1904-43f7-a98a-060f6903661d",
    },
  });

  const [formValues, setFormValues] = useState<FormType>({
    search: null,
    price: null,
    category: null,
    sort: null,
    branch: "16dcbf9a-1904-43f7-a98a-060f6903661d",
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["products", formValues],
      queryFn: ({ pageParam = 1 }) => {
        const { search, category, sort, branch } = formValues;
        return productService.publicProduct({
          take: 15,
          skip: pageParam,
          search,
          category,
          sort,
          branch,
        });
      },
      getNextPageParam: (lastPage, pages) => {
        return lastPage.length > 0 ? pages.length + 1 : undefined;
      },
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 5,
      initialPageParam: 1,
    });

  const onSubmit = async (data: FormType) => {
    setFormValues(data);
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const products = useMemo(() => {
    return data?.pages.flatMap((page) => page.data);
  }, [data]);

  const { data: categoriesOptions } = useQuery({
    queryKey: ["categories-options"],
    queryFn: () => {
      return productService.publicProductOptions();
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  const { categories, teams } = categoriesOptions || {};

  return (
    <div className="min-h-screen w-full mx-auto text-black py-8 mt-24 bg-gray-100">
      <div className="mx-auto px-6">
        <h1 className="text-3xl font-bold mb-6 sm:text-center">Shop</h1>

        {/* Filter Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-10 flex flex-wrap gap-4 justify-start"
        >
          <FloatingLabelInput
            {...register("search")}
            placeholder="Search by product name"
            className="text-sm h-8 px-2 py-1 w-[150px]"
          />

          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <SelectTrigger className="w-[150px] text-sm h-8 px-2 py-1">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem
                      key={category.value || ""}
                      value={category.value}
                      className="text-sm"
                    >
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          <Controller
            control={control}
            name="branch"
            render={({ field }) => (
              <Select onValueChange={field.onChange} {...field}>
                <SelectTrigger className="w-[150px] text-sm h-8 px-2 py-1">
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  {teams?.map((team) => (
                    <SelectItem
                      key={team.value || ""}
                      value={team.value}
                      className="text-sm"
                    >
                      {team.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          <Controller
            control={control}
            name="sort"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <SelectTrigger className="w-[150px] text-sm h-8 px-2 py-1">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-sm"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          <Button
            type="submit"
            variant="secondary"
            className="h-8 px-4 text-sm"
          >
            Apply
          </Button>
        </form>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products &&
            products?.map((item) => (
              <HoverVariantTypeCard
                key={`${item.product_variant_id}-${item.product_id}`}
                variant={item}
                product={item.product_variant_product}
                currentDate={new Date()}
                referralCode={REFERRAL_CODE}
              />
            ))}
        </div>

        {/* Loader div for IntersectionObserver */}
        {hasNextPage && isFetchingNextPage && (
          <div className="h-10 w-full flex justify-center items-center">
            <Button onClick={handleNextPage}>Load more</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
