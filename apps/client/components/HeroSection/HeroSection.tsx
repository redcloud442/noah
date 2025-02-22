import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import Image from "next/image";
import { Button } from "../ui/button";

const HeroSection = () => {
  return (
    <div className="relative w-full mx-auto h-[400px] sm:min-h-screen sm:h-auto overflow-hidden">
      <AspectRatio ratio={16 / 9}>
        <Image
          src="/assets/noire-10162.PNG"
          alt="Hero Image"
          width={4000}
          height={2000}
          quality={80}
          priority
          className=" -translate-y-10 sm:-translate-y-20"
        />
      </AspectRatio>

      {/* Black Tint Overlay */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      <div className="absolute bottom-20 inset-0 flex  items-end justify-center text-white text-2xl sm:text-3xl lg:text-4xl font-bold">
        <div className="flex flex-col items-center gap-4">
          <h1>Discover the latest trends in Noire Fashion</h1>
          <Button
            size="lg"
            variant="outline"
            className="w-fit dark:bg-transparent dark:text-white dark:border-white"
          >
            View Collection
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
