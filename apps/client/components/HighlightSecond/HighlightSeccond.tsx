"use client";

import useFeatureProductStore from "@/lib/featureProductStore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

const HighlightSecond = () => {
  const { featuredProducts } = useFeatureProductStore();

  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  // Animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!featuredProducts || featuredProducts.length === 0) {
    return (
      <div className="w-full bg-white p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-400 mb-4">
            No Featured Products
          </h2>
          <p className="text-gray-500">
            Check back soon for exciting new products!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 to-white py-16 px-4">
      {/* Enhanced Header */}
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <div className="inline-block">
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-black via-zinc-950 to-zinc-900 bg-clip-text text-transparent mb-4">
            Featured Products
          </h2>
          <div
            className={`h-1 bg-gradient-to-r from-transparent via-gray-400 to-transparent transform transition-all duration-1000 delay-300 ${isVisible ? "scale-x-100" : "scale-x-0"}`}
          ></div>
        </div>
        <p
          className={`text-gray-600 mt-6 text-lg max-w-2xl mx-auto transform transition-all duration-1000 delay-500 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          Discover our handpicked selection of premium products, curated just
          for you
        </p>
      </div>

      {/* Enhanced Product Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((item, index) => (
            <div
              key={item.product_variant_id}
              className={`group relative bg-white shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-2 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() =>
                router.push(`/product/${item.product_variant_slug}`)
              }
            >
              {/* Product Image Container */}
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={
                    item.variant_sample_images[0].variant_sample_image_image_url
                  }
                  alt={item.product_variant_color}
                  width={800}
                  height={800}
                  title={item.product_variant_product.product_name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                    {item.product_variant_product.product_name}
                  </h3>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-gray-500 capitalize">
                    {item.product_variant_color}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View All Button */}
      <div className="text-center mt-12">
        <Button
          onClick={() => router.push("/shop")}
          className="px-8 py-4 bg-gradient-to-r from-gray-900 to-gray-700 text-white font-semibold rounded-full hover:from-gray-800 hover:to-gray-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          View All Products
        </Button>
      </div>
    </div>
  );
};

export default HighlightSecond;
