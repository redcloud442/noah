"use client";
import { useRouter } from "next/navigation";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";

const HighlightSection = () => {
  const router = useRouter();
  return (
    <div className="w-full py-10  bg-zinc-950 space-y-10 overflow-hidden">
      <h1 className="text-4xl text-center font-bold"></h1>
      <div className="flex w-full animate-infinite-scroll space-x-16 whitespace-nowrap">
        {[...Array(3)].map((_, i) => (
          <ul
            key={i}
            className="flex items-center space-x-16 text-4xl text-gray-300"
            aria-hidden={i === 1}
          >
            <li
              onClick={() => router.push("https://www.facebook.com/noire.ph")}
              className="flex items-center gap-10 cursor-pointer"
            >
              <FaFacebook size={40} /> Facebook
            </li>
            <li
              onClick={() => router.push("https://www.instagram.com/noire.ph")}
              className="flex items-center gap-10 cursor-pointer"
            >
              <FaInstagram size={40} /> Instagram
            </li>
            <li
              onClick={() => router.push("https://www.tiktok.com/@noire.ph")}
              className="flex items-center gap-10 cursor-pointer"
            >
              <FaTiktok size={40} /> Tiktok
            </li>
          </ul>
        ))}
      </div>
    </div>
  );
};

export default HighlightSection;
