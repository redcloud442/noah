"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { userService } from "@/services/user";
import { useState } from "react";
import { toast } from "sonner";

type GenerateLoginLinkTabProps = {
  email: string;
};

const GenerateLoginLinkTab = ({ email }: GenerateLoginLinkTabProps) => {
  const [loginLink, setLoginLink] = useState("");
  const [loading, setLoading] = useState(false);

  const generateLink = async () => {
    setLoading(true);

    try {
      const link = await userService.generateLoginLink({
        email: email,
      });

      setLoginLink(link.link);

      await navigator.clipboard.writeText(link.link);
      toast.success("Login link copied to clipboard!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate or copy login link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={generateLink} disabled={loading} className="w-full">
        {loading ? "Generating..." : "Generate Sign-In Link"}
      </Button>

      {loginLink && (
        <div className="space-y-2">
          <Input readOnly value={loginLink} />
          <p className="text-sm text-muted-foreground">
            Link copied to clipboard
          </p>
        </div>
      )}
    </div>
  );
};

export default GenerateLoginLinkTab;
