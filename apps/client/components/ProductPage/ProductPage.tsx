"use client";

import useUserDataStore from "@/lib/userDataStore";
import { productService } from "@/services/product";
import { VariantProductType } from "@/utils/types";
import { product_category_table } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCcwIcon, SearchIcon } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
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
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";

type FormData = {
  search?: string;
  product_category_id?: string;
};

const ProductPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { teamName } = useParams();

  const [activePage, setActivePage] = useState(1);
  const { register, handleSubmit, reset, getValues, control } =
    useForm<FormData>();

  const [formValues, setFormValues] = useState<FormData>({
    search: "",
    product_category_id: "",
  });

  const queryKey = [
    "products",
    formValues.search,
    formValues.product_category_id,
    activePage,
  ];
  const { userData } = useUserDataStore();

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productService.getProductCategories(),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 10,
  });

  const {
    data: productsData,
    isLoading: isProductsLoading,
    refetch: refetchProducts,
  } = useQuery({
    queryKey,
    queryFn: () => {
      const { search, product_category_id } = getValues();
      return productService.getProducts({
        take: 15,
        skip: activePage,
        search,
        teamId: userData?.teamMemberProfile?.team_member_team_id,
        category: product_category_id,
      });
    },
    enabled: !!userData?.teamMemberProfile?.team_member_team_id,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const onSubmit = async (data: FormData) => {
    setActivePage(1);
    setFormValues(data);
  };

  const handleRefresh = useCallback(() => {
    setActivePage(1);
    reset();
    refetchProducts();
  }, [reset]);

  const handleChangePage = (page: number) => {
    setActivePage(page);
  };

  const { mutate: setFeaturedProduct, isPending: isFeaturedLoading } =
    useMutation({
      mutationFn: (productId: string) =>
        productService.setFeaturedProduct({ productId }),

      onMutate: (productId: string) => {
        queryClient.cancelQueries({
          queryKey,
        });

        const previousData = queryClient.getQueryData(queryKey);

        queryClient.setQueryData(
          queryKey,
          (old: { data: VariantProductType[]; count: number }) => ({
            ...old,
            data: old.data.map((product: VariantProductType) =>
              product.product_variant_id === productId
                ? { ...product, product_variant_is_featured: true }
                : product
            ),
          })
        );

        return { previousData };
      },
      onSuccess: () => {
        toast.success("Product set as featured");
      },
      onError: (error) => {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Error setting featured");
        }
      },
    });

  const pageCount = Math.ceil((productsData?.count || 0) / 15);

  return (
    <div className="flex flex-col gap-4 px-4">
      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Product List
        </h1>
        <p className="text-muted-foreground">
          View and manage all products in the system. You can search for
          products by name, category, or price.
        </p>
      </div>

      <Separator className="my-2" />

      <div className="flex flex-wrap items-center gap-4">
        <form
          className="flex flex-wrap w-full gap-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FloatingLabelInput
            label="Search"
            className="w-full max-w-4xl sm:max-w-2xl"
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
                  {categoriesData?.map((category: product_category_table) => (
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

          <Button type="submit" variant="outline" disabled={isProductsLoading}>
            <SearchIcon className="w-4 h-4" /> Search
          </Button>
          <Button
            variant="secondary"
            onClick={handleRefresh}
            disabled={isProductsLoading}
          >
            {" "}
            <RefreshCcwIcon className="w-4 h-4" />
          </Button>
        </form>
        <Button
          variant="secondary"
          onClick={() => router.push(`/${teamName}/admin/product/create`)}
        >
          + Add Product
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isProductsLoading
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
          : productsData?.data.map((product: VariantProductType) => (
              <Card
                key={product.product_variant_id}
                className="relative group shadow-md hover:shadow-xl transition"
              >
                {/* Hover Buttons */}
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md">
                  <div
                    className="flex flex-wrap justify-center gap-2"
                    onClick={(e) => e.stopPropagation()} // prevent router push
                  >
                    {!product.product_variant_is_featured && (
                      <Button
                        onClick={() =>
                          setFeaturedProduct(product.product_variant_id)
                        }
                        disabled={isFeaturedLoading}
                        variant="secondary"
                        className="px-3 py-1 bg-yellow-500 text-sm rounded-md shadow hover:bg-yellow-600"
                      >
                        Set Featured
                      </Button>
                    )}

                    <Button
                      variant="secondary"
                      onClick={() =>
                        router.push(
                          `/${teamName}/admin/product/${product.product_variant_product.product_slug}/edit`
                        )
                      }
                      className="px-3 py-1  text-sm rounded-md shadow"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() =>
                        router.push(
                          `/${teamName}/admin/product/${product.product_variant_slug}`
                        )
                      }
                      className="px-3 py-1 bg-white text-sm rounded-md shadow hover:bg-gray-100"
                    >
                      View Details
                    </Button>
                  </div>
                </div>

                <CardHeader className="relative">
                  <div className="absolute top-2 right-2 z-50 flex flex-col items-end gap-1">
                    {product.product_variant_is_featured && (
                      <Badge className="bg-blue-500 text-white">Featured</Badge>
                    )}

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
                        width={500}
                        height={500}
                        quality={80}
                        className="w-[500px] h-[500px] object-cover transition-opacity duration-300 rounded-md"
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
        pageCount={pageCount}
      />
    </div>
  );
};

export default ProductPage;
