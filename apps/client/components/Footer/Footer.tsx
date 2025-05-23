import { siteConfig } from "@/components/config/site";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";
import SubscribeNowForm from "./SubscribeNowForm/SubscribeNowForm";

export const Footer = () => {
  return (
    <footer className="bg-zinc-950 text-white py-10 relative">
      <div className="container mx-auto flex flex-col items-center justify-between space-y-8 md:flex-row md:space-y-0 px-6">
        {/* Brand Section */}
        <div className="flex flex-col space-y-4 text-center">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold">Noir</h1>
            <p className="mt-2 text-sm text-white/90">
              Elevate your style with Noir – where luxury meets fashion.
            </p>
          </div>

          <div className="text-center md:text-left">
            <p className="text-lg font-semibold mb-2">Subscribe Now</p>
            <p className="text-sm text-white/80 mb-4">
              Get the latest updates, promotions, and trends directly to your
              inbox.
            </p>
            <SubscribeNowForm />
          </div>
        </div>

        {/* 📬 Subscribe Section */}

        {/* Navigation Links */}
        <div className="flex flex-col justify-end space-y-4 text-center sm:text-start">
          <Link href="/about" className="hover:text-gray-300">
            About Us
          </Link>
          <Link href="/contact" className="hover:text-gray-300">
            Contact
          </Link>

          <Link href="/policy/terms-of-service" className="hover:text-gray-300">
            Terms of Service
          </Link>
          <Link href="/policy/returns" className="hover:text-gray-300">
            Returns Policy
          </Link>
        </div>

        {/* Social Media Icons */}
        <div className="flex space-x-4">
          <Link href={siteConfig.links.tiktok} target="_blank" rel="noreferrer">
            <FaTiktok className="w-6 h-6 hover:text-gray-400" />
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
      <div className="mt-6 pt-4 text-center text-sm text-white/90">
        © {new Date().getFullYear()} Noir. All Rights Reserved.
      </div>
    </footer>
  );
};
