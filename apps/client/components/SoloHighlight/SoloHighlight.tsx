import Image from "next/image";

const SoloHighlight = () => {
  return (
    <div className="relative flex justify-center items-center w-full bg-white">
      <div className="w-full h-[300px] sm:h-[600px] lg:h-[1500px] overflow-hidden m-20 px-6">
        <Image
          src="/assets/highlight/noire-10172.jpg"
          alt="Hero Image"
          width={1700}
          height={1200}
          quality={80}
          className="object-cover -translate-y-10 sm:-translate-y-40 shadow-lg"
        />
      </div>
    </div>
  );
};

export default SoloHighlight;
