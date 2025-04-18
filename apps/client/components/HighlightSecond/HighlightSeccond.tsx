"use client";

import useFeatureProductStore from "@/lib/featureProductStore";
import Image from "next/image";
import { useRouter } from "next/navigation";

const HighlightSecond = () => {
  const { featuredProducts } = useFeatureProductStore();
  const router = useRouter();

  return (
    <div className="w-full bg-white gap-4 p-4">
      {" "}
      <h1 className="text-4xl font-bold text-center text-black">
        Featured Products
      </h1>
      <div className="flex flex-wrap justify-center items-center w-full gap-4 p-4">
        {featuredProducts.map((item) => (
          <div
            key={item.product_variant_id}
            className="relative overflow-hidden w-full sm:w-[calc(33.33%-1rem)] h-full group cursor-pointer"
            onClick={() => router.push(`/product/${item.product_variant_slug}`)}
          >
            <Image
              src={item.variant_sample_images[0].variant_sample_image_image_url}
              alt={item.product_variant_color}
              width={800}
              height={800}
              className="w-full h-full object-cover"
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>

            {/* Text Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <span className="text-white text-lg font-semibold uppercase">
                {item.product_variant_product.product_name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HighlightSecond;
