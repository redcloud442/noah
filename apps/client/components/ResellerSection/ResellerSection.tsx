import { Button } from "@/components/ui/button";
import Link from "next/link";

const ResellerSection = () => {
  return (
    <section
      className="flex flex-col md:flex-row items-stretch justify-center w-full min-h-[600px] px-4 py-12 bg-zinc-950"
      aria-label="Reseller program information"
    >
      {/* Left Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-8 md:py-0">
        <div className="max-w-lg">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            Join Our Community
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            Be part of our growing reseller community today and start earning
            with Noire. Connect with like-minded entrepreneurs and grow your
            business.
          </p>

          {/* Mobile CTA - shown only on mobile */}
          <div className="mt-6 md:hidden">
            <Link href="/login" className="inline-block">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto hover:scale-105 transition-transform duration-200"
              >
                Get Started Today
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Vertical Divider - Desktop only */}
      <div
        className="hidden md:flex justify-center items-center"
        aria-hidden="true"
      >
        <div className="w-[2px] h-[70%] bg-gradient-to-b from-transparent via-white to-transparent opacity-30" />
      </div>

      {/* Horizontal Divider - Mobile only */}
      <div
        className="md:hidden flex justify-center items-center py-6"
        aria-hidden="true"
      >
        <div className="h-[2px] w-[70%] bg-gradient-to-r from-transparent via-white to-transparent opacity-30" />
      </div>

      {/* Right Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-8 md:py-0">
        <div className="max-w-lg">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            Become a Reseller
          </h2>
          <p className="text-lg text-gray-300 mb-6 leading-relaxed">
            Enjoy exclusive perks, early product access, and wholesale pricing.
            Build your business with our comprehensive reseller support program.
          </p>

          {/* Desktop CTA - hidden on mobile */}
          <div className="hidden md:block">
            <Link href="/login" className="inline-block">
              <Button
                size="lg"
                variant="secondary"
                className="hover:scale-105 transition-transform duration-200 shadow-lg"
              >
                Login to Join
              </Button>
            </Link>
          </div>

          {/* Mobile additional info */}
          <div className="md:hidden mt-4">
            <p className="text-sm text-gray-400">
              Already a member? Login above to access your reseller dashboard.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResellerSection;
