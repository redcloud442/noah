import Image from "next/image";

const HighlightSecond = () => {
  const modelSection = [
    {
      id: 1,

      alt: "Model 1 description",
      image: "/assets/model/noire-10200.jpg",
    },

    {
      id: 2,
      alt: "Model 5 description",
      image: "/assets/model/noire-10313.jpg",
    },
    {
      id: 3,
      alt: "Model 6 description",
      image: "/assets/model/noire-10343.jpg",
    },
  ];

  return (
    <div className="flex flex-wrap justify-center items-center w-full bg-white gap-4 p-4">
      {modelSection.map((item) => (
        <div
          key={item.id}
          className="relative overflow-hidden w-full sm:w-[calc(33.33%-1rem)] h-full group"
        >
          <Image
            src={item.image}
            alt={item.alt}
            width={800}
            height={800}
            className="w-full h-full object-cover"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>

          {/* Text Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <span className="text-white text-lg font-semibold">{item.alt}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HighlightSecond;
