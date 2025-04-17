import { Button } from "@/components/ui/button";
import Link from "next/link";

const ResellerSection = () => {
  return (
    <div className="flex items-center justify-center w-full h-[600px] bg-zinc-950 px-4">
      {/* Left Section with Image */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl font-bold text-white mb-4">Join Now</h1>
        <p className="text-lg text-white max-w-md">
          Be part of our growing reseller community today and start earning with
          Noire.
        </p>
      </div>

      {/* Vertical Divider */}
      <div className="h-[80%] w-[2px] bg-white mx-6"></div>

      {/* Right Section */}
      <div className="flex-1 flex flex-col items-center justify-end text-center px-6">
        <h1 className="text-4xl font-bold text-white mb-4">Be a Reseller</h1>
        <p className="text-lg text-white max-w-md mb-6">
          Enjoy exclusive perks, early product access, and wholesale pricing.
          Join our reseller network now!
        </p>

        {/* Login Button */}
        <Link href="/login">
          <Button size="lg" variant="secondary">
            Login to Join
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ResellerSection;
