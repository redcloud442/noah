"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

const ModernClothingEcommerce = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroImages = [
    "/assets/noire-10162.PNG",
    "/assets/highlight/noire-10065.jpg",
    "/assets/highlight/noire-10172.jpg",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroImages.length) % heroImages.length
    );
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 flex">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={image}
                alt={`Hero ${index + 1}`}
                width={1920}
                height={1080}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
            </div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-20 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
                Redefine
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                  Your Style
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-lg">
                Discover the latest collection of premium noir fashion that
                speaks to your sophisticated taste.
              </p>
              <div className="flex space-x-4">
                <Button className="bg-white text-black sm:text-sm md:text-base px-8 py-4 rounded-none font-semibold hover:bg-gray-200 transition-colors">
                  Shop Collection
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 z-30 bg-white/10 backdrop-blur-sm p-3 rounded-full hover:bg-white/20 transition-colors sm:block hidden"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 z-30 bg-white/10 backdrop-blur-sm p-3 rounded-full hover:bg-white/20 transition-colors sm:block hidden"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default ModernClothingEcommerce;
