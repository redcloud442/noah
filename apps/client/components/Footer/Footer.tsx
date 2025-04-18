import { siteConfig } from "@/components/config/site";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export const Footer = () => {
  return (
    <footer className="bg-zinc-950 text-white py-10">
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
            <form className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 rounded bg-white text-black w-64"
              />
              <Button
                type="submit"
                className="px-6 py-2 bg-white text-black rounded hover:bg-gray-200 font-medium"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* 📬 Subscribe Section */}

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
