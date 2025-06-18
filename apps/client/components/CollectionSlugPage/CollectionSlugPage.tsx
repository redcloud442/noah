"use client";

import useUserDataStore from "@/lib/userDataStore";
import { productService } from "@/services/product";
import { variant_size_table } from "@prisma/client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import ButtonVariant from "../ui/button-variant";
import { Card, CardHeader } from "../ui/card";
import { Separator } from "../ui/separator";
import CollectionContent from "./CollectionContent";

type Props = {
  collectionSlug: string;
};

const CollectionSlugPage = ({ collectionSlug }: Props) => {
  const { teamName } = useParams();
  const { userData } = useUserDataStore();

  const router = useRouter();

  const { data, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["product-collection", collectionSlug],
    queryFn: ({ pageParam = 1 }) =>
      productService.getProductCollection({
        collectionSlug,
        take: 15,
        skip: pageParam,
        search: "",
        teamId: userData?.teamMemberProfile.team_member_team_id,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.skip + 15 : undefined,
    enabled: !!userData?.teamMemberProfile.team_member_team_id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const handleFetch = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-1 pb-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground uppercase">
            {collectionSlug.replace(/-/g, " ")}
          </h1>
          <p className="text-muted-foreground">
            View and manage all products in the{" "}
            {collectionSlug.replace(/-/g, " ")}.
          </p>
        </div>
        <ButtonVariant
          variant="default"
          type="link"
          href={`/${teamName}/admin/product/create`}
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Product
        </ButtonVariant>
      </div>

      <Separator className="my-6" />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {data?.pages
          .flatMap((page) => page.data)
          .map((product) => {
            const imageUrl =
              product.product_variants?.[0]?.variant_sample_images?.[0]
                ?.variant_sample_image_image_url || null;

            return (
              <Card
                key={product.product_id}
                className="shadow-md hover:shadow-xl transition cursor-pointer"
                onClick={() => {
                  router.push(
                    `/${teamName}/admin/product/${product.product_slug}`
                  );
                }}
              >
                <CardHeader className="relative">
                  <div className="absolute top-2 right-2 z-50 flex flex-col items-end gap-1">
                    {product.product_created_at &&
                      new Date().getTime() -
                        new Date(product.product_created_at).getTime() <
                        7 * 24 * 60 * 60 * 1000 && (
                        <Badge className="bg-green-500 text-white">NEW!</Badge>
                      )}
                    {product.product_variants?.[0]?.variant_sizes.some(
                      (size: variant_size_table) =>
                        size.variant_size_quantity === 0
                    ) && (
                      <Badge className="bg-gray-500 text-white">SOLD OUT</Badge>
                    )}
                  </div>

                  <div className="relative w-full bg-gray-200 rounded-md overflow-hidden">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product.product_name}
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

                <CollectionContent product={product} />
              </Card>
            );
          })}
      </div>

      {/* Sentinel for infinite scroll */}
      {hasNextPage && <Button onClick={handleFetch}>Load more</Button>}
    </div>
  );
};

export default CollectionSlugPage;
