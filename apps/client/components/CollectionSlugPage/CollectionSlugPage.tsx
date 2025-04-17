"use client";

import useUserDataStore from "@/lib/userDataStore";
import { productService } from "@/services/product";
import {
  product_table,
  product_variant_table,
  variant_sample_image_table,
  variant_size_table,
} from "@prisma/client";
import { PlusIcon } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import ButtonVariant from "../ui/button-variant";
import { Card, CardHeader } from "../ui/card";
import CollectionContent from "./CollectionContent";

type Props = {
  products: (product_table & {
    product_variants: (product_variant_table & {
      variant_sample_images: variant_sample_image_table[];
      variant_sizes: variant_size_table[];
    })[];
  })[];
  collectionSlug: string;
};

const CollectionSlugPage = ({
  products: initialProducts,
  collectionSlug,
}: Props) => {
  const { teamName } = useParams();
  const { userData } = useUserDataStore();

  const router = useRouter();
  const observerRef = useRef<HTMLDivElement | null>(null);

  const [products, setProducts] = useState<Props["products"]>(initialProducts);
  const [activePage, setActivePage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const getFirstImage = (product: Props["products"][number]) => {
    return (
      product.product_variants?.[0]?.variant_sample_images?.[0]
        ?.variant_sample_image_image_url || null
    );
  };

  const fetchProductCollections = async () => {
    try {
      if (
        (!userData?.teamMemberProfile.team_member_team_id &&
          activePage === 1) ||
        !hasMore
      ) {
        return;
      }

      const { data, hasMore: more } = await productService.getProductCollection(
        {
          collectionSlug,
          take: 15,
          skip: activePage,
          search: "",
          teamId: userData?.teamMemberProfile.team_member_team_id,
        }
      );

      if (!more || data.length === 0) {
        setHasMore(false);
        return;
      }

      setProducts((prev) => [...prev, ...data]);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error("Error fetching products");
      }
    }
  };

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setActivePage((prev) => prev + 1);
        }
      },
      {
        rootMargin: "600px",
      }
    );

    if (observerRef.current) observer.observe(observerRef.current);

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [hasMore]);

  useEffect(() => {
    if (activePage > 1) fetchProductCollections();
  }, [activePage, userData]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold capitalize">
          {collectionSlug.replace(/-/g, " ")}
        </h1>
        <ButtonVariant
          variant="default"
          type="link"
          href={`/${teamName}/admin/product/create`}
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Product
        </ButtonVariant>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const imageUrl = getFirstImage(product);

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
                    (size) => size.variant_size_quantity === 0
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
      {hasMore && <div ref={observerRef} className="h-10" />}
    </div>
  );
};

export default CollectionSlugPage;
