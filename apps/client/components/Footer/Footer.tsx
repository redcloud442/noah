import { siteConfig } from "@/components/config/site";
import { newsLetterService } from "@/services/newsletter";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { newsletterType } from "./SubscribeNowForm/SubscribeNowForm";

export const newsletterSchema = z.object({
  email: z.string().email(),
});

export const Footer = () => {
  const [isDisabled, setIsDisabled] = useState(false);

  const { register, handleSubmit } = useForm<newsletterType>({
    resolver: zodResolver(newsletterSchema),
  });

  const handleSubscribe = async (data: newsletterType) => {
    try {
      await newsLetterService.subscribe(data);
      setIsDisabled(true);
      toast.success("Subscribed to newsletter");
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      }
    }
  };

  return (
    <footer className="bg-zinc-950 text-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Noir
                </h1>
                <p className="mt-3 text-lg text-gray-300 max-w-md leading-relaxed">
                  Elevate your style with Noir – where luxury meets fashion.
                  Discover timeless pieces that define elegance.
                </p>
              </div>

              {/* Newsletter Signup */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-xl font-semibold">Stay in Style</h3>
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Where bold meets elegance. NOIR is more than fashion —
                  it&apos;s a statement.
                </p>
                <form
                  className="flex flex-col sm:flex-row gap-3"
                  onSubmit={handleSubmit(handleSubscribe)}
                >
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-white/40 focus:ring-white/20 rounded-xl px-4 py-3"
                    {...register("email")}
                  />
                  <Button
                    disabled={isDisabled}
                    type="submit"
                    className="bg-white text-black hover:bg-gray-100 font-semibold px-8 py-3 rounded-xl transition-all duration-200 hover:scale-105"
                  >
                    Subscribe
                  </Button>
                </form>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-6 sm:text-start text-center">
              <h3 className="text-xl font-semibold text-white">Quick Links</h3>
              <nav className="flex flex-col space-y-4">
                <Link
                  href="https://www.facebook.com/profile.php?id=61576970657707"
                  className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 transform"
                >
                  About Us
                </Link>
                <Link
                  href="https://www.facebook.com/profile.php?id=61576970657707"
                  className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 transform"
                >
                  Contact
                </Link>

                <Link
                  href="/policy/terms-of-service"
                  className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 transform"
                >
                  Terms of Service
                </Link>
              </nav>
            </div>

            {/* Social Media */}
            <div className="space-y-6 sm:text-start text-center">
              <h3 className="text-xl font-semibold text-white">Follow Us On</h3>
              <div className="flex flex-col sm:items-start items-center space-y-4">
                <Link
                  href={siteConfig.links.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-3 text-gray-300 hover:text-white transition-all duration-200 group"
                >
                  <div className="p-3 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors sm:block hidden">
                    <FaInstagram className="w-5 h-5" />
                  </div>
                  <span className="group-hover:translate-x-1 transform transition-transform">
                    Instagram
                  </span>
                </Link>

                <Link
                  href={siteConfig.links.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-3 text-gray-300 hover:text-white transition-all duration-200 group"
                >
                  <div className="p-3 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors sm:block hidden">
                    <FaFacebook className="w-5 h-5" />
                  </div>
                  <span className="group-hover:translate-x-1 transform transition-transform">
                    Facebook
                  </span>
                </Link>

                <Link
                  href={siteConfig.links.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-3 text-gray-300 hover:text-white transition-all duration-200 group"
                >
                  <div className="p-3 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors sm:block hidden">
                    <FaTiktok className="w-5 h-5" />
                  </div>
                  <span className="group-hover:translate-x-1 transform transition-transform">
                    TikTok
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-sm sm:text-start text-center">
                © {new Date().getFullYear()} Noir. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
