import prisma from "@/utils/prisma/prisma";
import Link from "next/link";
import { Suspense } from "react";
import { HoverVariantCard } from "../CollectionNamePage/CollectionNamePage";
import { Button } from "../ui/button";

const ModelSection = async () => {
  const products = await prisma.product_table.findMany({
    orderBy: {
      product_created_at: "desc",
    },
    include: {
      product_variants: {
        where: {
          product_variant_is_deleted: false,
        },
        include: {
          variant_sample_images: true,
          variant_sizes: true,
        },
      },
    },
    take: 15,
  });
  return (
    <div className="flex flex-wrap justify-center items-center w-full bg-white gap-4 p-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Latest Collection
        </h1>

        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Discover our carefully curated selection of premium products, crafted
          with attention to detail and modern aesthetics.
        </p>
      </div>
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Suspense fallback={<div>Loading...</div>}>
          {products.map((item) =>
            item.product_variants.map((variant) => (
              <HoverVariantCard
                key={variant.product_variant_id}
                variant={variant}
                product={item}
                currentDate={new Date()}
              />
            ))
          )}
        </Suspense>
      </div>
      <div className="text-center mt-16 pt-8 border-t border-gray-200">
        <p className="text-gray-600 mb-6">Looking for something specific?</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/shop">
            <Button className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm">
              View All Products
              <svg
                className="ml-2 -mr-1 w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          </Link>
          <Link href="/collections">
            <Button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-black hover:bg-gray-800 transition-colors shadow-sm">
              Browse Collections
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ModelSection;
