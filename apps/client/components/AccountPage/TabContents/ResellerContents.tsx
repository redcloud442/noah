import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const ResellerContents = () => {
  const handleRequestClick = () => {
    // TODO: Open modal or trigger request logic
    alert("Reseller request sent!");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto text-center space-y-6">
      <div className="flex flex-col items-center gap-3">
        <Sparkles className="w-12 h-12 text-yellow-400 animate-pulse" />
        <h2 className="text-2xl font-bold text-primary text-yellow-500">
          Become a NOAH Reseller
        </h2>
        <p className="text-muted-foreground max-w-md">
          Join our growing community of resellers and unlock exclusive rewards,
          higher commissions, and early access to limited offers.
        </p>
      </div>

      <Button
        className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold text-lg px-6 py-3"
        onClick={handleRequestClick}
      >
        Request to Become a Reseller
      </Button>
    </div>
  );
};

export default ResellerContents;
