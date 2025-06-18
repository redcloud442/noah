"use client";
import useCollectionProductStore from "@/lib/useCollectionProductStore";
import { ChevronRight, ShoppingBag, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const EnhancedHighlight = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { collections } = useCollectionProductStore();
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const highlights = [
    {
      title: collections[0]?.product_category_name,
      description: collections[0]?.product_category_description,
      image: collections[0]?.product_category_image,
      accent: "from-zinc-950 to-zinc-900",
      slug: collections[0]?.product_category_slug,
      newPieces: 3,
    },
    {
      title: collections[1]?.product_category_name,
      description: collections[1]?.product_category_description,
      image: collections[1]?.product_category_image,
      accent: "from-zinc-950 to-zinc-900",
      slug: collections[1]?.product_category_slug,
      newPieces: 5,
    },
    {
      title: collections[2]?.product_category_name,
      description: collections[2]?.product_category_description,
      image: collections[2]?.product_category_image,
      accent: "from-zinc-950 to-zinc-900",
      slug: collections[2]?.product_category_slug,
      newPieces: 2,
    },
  ];

  return (
    <div className="relative w-full bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,#000_1px,transparent_1px)] bg-[length:60px_60px]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content Side */}
          <div
            className={`space-y-8 transform transition-all duration-1000 ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"}`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium">
              <Star className="w-4 h-4 fill-current" />
              Featured Collection
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              <div
                className={`bg-gradient-to-r ${highlights[currentSlide].accent} bg-clip-text text-transparent transition-all duration-500`}
              ></div>

              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                {highlights[currentSlide].title}
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                {highlights[currentSlide].description}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 py-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {highlights[currentSlide].newPieces}+
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">
                  New Pieces
                </div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">5★</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">
                  Customer Rating
                </div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">24h</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">
                  Fast Shipping
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => router.push("/collections")}
                className="group bg-black text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 hover:gap-4"
              >
                Shop Collection
                <ChevronRight className="w-5 h-5 transition-all duration-300" />
              </button>
            </div>

            {/* Slide Indicators */}
            <div className="flex items-center gap-3 pt-8">
              {collections &&
                highlights.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? "bg-gray-900 w-8"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
            </div>
          </div>

          {/* Image Side */}
          <div
            className={`relative transform transition-all duration-1000 delay-300 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`}
          >
            <div className="relative">
              {/* Main Image Container */}
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                {highlights[currentSlide].image && (
                  <Image
                    src={highlights[currentSlide].image || ""}
                    alt={highlights[currentSlide].title || ""}
                    width={1000}
                    height={1000}
                    className="w-full h-full object-cover object-top transition-all duration-700 hover:scale-105"
                  />
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

                {/* Floating Action */}
                <div className="absolute top-6 right-6">
                  <button className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all duration-300 hover:scale-110">
                    <ShoppingBag className="w-5 h-5 text-gray-900" />
                  </button>
                </div>
              </div>

              {/* Decorative Elements */}
              <div
                className={`absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br ${highlights[currentSlide].accent} rounded-full opacity-20 transition-all duration-500`}
              ></div>
              <div
                className={`absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br ${highlights[currentSlide].accent} rounded-full opacity-10 transition-all duration-500`}
              ></div>

              {/* Feature Tag */}
              <div className="absolute -bottom-4 left-8 bg-white rounded-2xl px-6 py-4 shadow-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-gray-900">In Stock</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedHighlight;
