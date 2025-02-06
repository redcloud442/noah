import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";

const ModelSection = () => {
  const modelSection = [
    { id: 1, alt: "Model 1", image: "/assets/model/QR_59794.jpg" },
    {
      id: 2,
      alt: "Model 2 description",
      image: "/assets/model/noire-10243.jpg",
    },
    {
      id: 3,
      alt: "Model 4 description",
      image: "/assets/model/noire-10278.jpg",
    },
    {
      id: 4,
      alt: "Model 3 description",
      image: "/assets/model/noire-10200.jpg",
    },
    {
      id: 5,
      alt: "Model 5 description",
      image: "/assets/model/noire-10313.jpg",
    },
    {
      id: 6,
      alt: "Model 6 description",
      image: "/assets/model/noire-10343.jpg",
    },
  ];

  // Helper to group images into chunks of 3
  const chunkedSlides = [];
  for (let i = 0; i < modelSection.length; i += 3) {
    chunkedSlides.push(modelSection.slice(i, i + 3));
  }

  return (
    <div className="relative flex justify-center items-center w-full h-[600px] overflow-hidden bg-white border-none">
      <Carousel
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {chunkedSlides.map((group, index) => (
            <CarouselItem key={index} className="flex justify-center gap-10">
              {group.map((item) => (
                <div key={item.id} className="w-[28%] relative overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    width={800}
                    height={800}
                    className="w-full h-full object-cover"
                  />

                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>

                  {/* Text Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="text-white text-lg font-semibold">
                      {item.alt}
                    </span>
                  </div>
                </div>
              ))}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default ModelSection;
