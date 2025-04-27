"use client";

import { productService } from "@/services/product";
import { createClient } from "@/utils/supabase/client";
import { ProductVariantTypeShop } from "@/utils/types";
import { product_category_table, team_table } from "@prisma/client";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
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
type Props = {
  variants: ProductVariantTypeShop[];
};

type FormType = {
  search: string;
  price: string;
  category: string;
  sort: string;
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

const ShopPage = ({ variants: initialVariants }: Props) => {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const REFERRAL_CODE = searchParams.get("REFERRAL_CODE") as string;
  const cache = useRef<Map<string, ProductVariantTypeShop[]>>(new Map());

  const [variants, setVariants] =
    useState<ProductVariantTypeShop[]>(initialVariants);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activePage, setActivePage] = useState(2); // Skip value
  const loaderRef = useRef(null);

  const [categories, setCategories] = useState<product_category_table[]>([]);
  const [branches, setBranches] = useState<team_table[]>([]);
  const { register, handleSubmit, control, getValues } = useForm<FormType>({
    defaultValues: {
      branch: "16dcbf9a-1904-43f7-a98a-060f6903661d",
    },
  });

  const handleFetchProduct = async () => {
    try {
      setIsLoading(true);
      const { search, category, sort, branch } = getValues();
      const cacheKey = `${search || ""}-${category || ""}-${sort || ""}-${branch || ""}-${activePage}`;

      if (cache.current.has(cacheKey)) {
        setVariants((prev) => [...prev, ...cache.current.get(cacheKey)!]);
      } else {
        const result = await productService.publicProduct({
          take: 15,
          skip: activePage,
          search,
          category,
          sort,
          branch,
        });

        cache.current.set(cacheKey, result.data);
        setVariants((prev) => [...prev, ...result.data]);
        setHasMore(result.hasMore ?? result.data.length === 15);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (params: FormType) => {
    try {
      const { search, category, sort, branch } = params;
      const cacheKey = `${search || ""}-${category || ""}-${sort || ""}-${branch || ""}-${activePage}`;

      setActivePage(1);
      setVariants([]);
      setHasMore(true);

      if (cache.current.has(cacheKey)) {
        setVariants(cache.current.get(cacheKey)!);
        return;
      }

      const result = await productService.publicProduct({
        take: 15,
        skip: activePage,
        search,
        category,
        sort,
        branch,
      });

      cache.current.set(cacheKey, result.data);
      setVariants(result.data);
      setHasMore(result.hasMore ?? result.data.length === 15);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .schema("product_schema")
        .from("product_category_table")
        .select("*");

      if (error) toast.error(error.message);
      else setCategories(data || []);

      const { data: branchData, error: branchError } = await supabase
        .schema("team_schema")
        .from("team_table")
        .select("*");

      if (branchError) toast.error(branchError.message);
      else setBranches(branchData || []);
    };

    fetchCategories();
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setActivePage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [hasMore]);

  // Fetch products on activePage change
  useEffect(() => {
    handleFetchProduct();
  }, [activePage]);

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
              <Select onValueChange={field.onChange} {...field}>
                <SelectTrigger className="w-[150px] text-sm h-8 px-2 py-1">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.product_category_id}
                      value={category.product_category_id}
                      className="text-sm"
                    >
                      {category.product_category_name}
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
                  {branches.map((branch) => (
                    <SelectItem
                      key={branch.team_id}
                      value={branch.team_id}
                      className="text-sm"
                    >
                      {branch.team_name}
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
              <Select onValueChange={field.onChange} {...field}>
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
          {variants.map((item) => (
            <HoverVariantTypeCard
              key={item.product_variant_id}
              variant={item}
              product={item.product_variant_product}
              currentDate={new Date()}
              referralCode={REFERRAL_CODE}
            />
          ))}
        </div>

        {/* Loader div for IntersectionObserver */}
        {hasMore && isLoading && (
          <div
            ref={loaderRef}
            className="h-10 w-full flex justify-center items-center"
          >
            <p className="text-sm">Loading ...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
