"use client";

import Image from "next/image";

const SoloHighlight = () => {
  return (
    <div className="relative flex justify-center items-center w-full bg-white border-t border-gray-200">
      <div className="relative w-full h-[500px] m-5 lg:h-[2400px] px-4 md:m-20">
        <Image
          src="/assets/highlight/noire-10172.jpg"
          alt="Highlight"
          fill
          priority
          quality={80}
          className="object-cover object-top rounded shadow-lg"
          sizes="(max-width: 768px) 100vw, 80vw"
        />
      </div>
    </div>
  );
};

export default SoloHighlight;
