import { siteConfig } from "@/components/config/site";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

export const Footer = () => {
  return (
    <footer className="bg-zinc-950 text-white py-10 ">
      <div className="container mx-auto flex flex-col items-center justify-between space-y-8 md:flex-row md:space-y-0 px-6">
        {/* Brand Section */}
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold">Noire</h1>
          <p className="mt-2 text-sm text-white/90">
            Elevate your style with Noire – where luxury meets fashion.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:space-x-8 text-center">
          <Link href="/about" className="hover:text-gray-300">
            About Us
          </Link>
          <Link href="/contact" className="hover:text-gray-300">
            Contact
          </Link>
          <Link href="/privacy" className="hover:text-gray-300">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-gray-300">
            Terms of Service
          </Link>
        </div>

        {/* Social Media Icons */}
        <div className="flex space-x-4">
          <Link
            href={siteConfig.links.twitter}
            target="_blank"
            rel="noreferrer"
          >
            <FaTwitter className="w-6 h-6 hover:text-gray-400" />
          </Link>
          <Link
            href={siteConfig.links.facebook}
            target="_blank"
            rel="noreferrer"
          >
            <FaFacebook className="w-6 h-6 hover:text-gray-400" />
          </Link>
          <Link
            href={siteConfig.links.instagram}
            target="_blank"
            rel="noreferrer"
          >
            <FaInstagram className="w-6 h-6 hover:text-gray-400" />
          </Link>
        </div>
      </div>

      {/* Bottom Section */}
      <div className=" mt-6 pt-4 text-center text-sm text-white/90">
        © {new Date().getFullYear()} Noire. All Rights Reserved.
      </div>
    </footer>
  );
};
