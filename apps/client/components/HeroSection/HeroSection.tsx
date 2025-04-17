"use client";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

const HeroSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [api, setApi] = useState<CarouselApi | null>(null);
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

  const images = [
    "/assets/noire-10162.PNG",
    "/assets/highlight/noire-10065.jpg",
    "/assets/highlight/noire-10172.jpg",
  ];

  useEffect(() => {
    if (!api) return;

    setActiveSlide(api.selectedScrollSnap());

    api.on("select", () => {
      setActiveSlide(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="relative w-full mx-auto sm:min-h-screen sm:h-[120vh] overflow-hidden">
      <Carousel
        className="w-full min-h-screen h-full"
        plugins={[plugin.current]}
        setApi={setApi}
      >
        <CarouselContent className="flex [&>div]:w-full">
          {images.map((image, index) => (
            <CarouselItem
              className="relative min-h-screen h-[120vh] w-full"
              key={index}
            >
              <Image
                src={image}
                alt="Hero"
                className=" object-cover object-top min-h-screen h-[120vh]"
                priority={index === activeSlide}
                fill
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Black Tint Overlay */}
      <div className="absolute inset-0 bg-black opacity-50 z-10" />

      {/* Text Content */}
      <div className="absolute bottom-56 inset-0 flex items-end justify-center text-white text-2xl sm:text-3xl lg:text-4xl font-bold z-20">
        <div className="flex flex-col items-center text-center gap-4">
          <h1>Discover the latest trends in Noire Fashion</h1>
          <Link href="/collections">
            <Button
              size="lg"
              variant="outline"
              className="w-fit dark:bg-transparent dark:text-white dark:border-white"
            >
              View Collection
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
