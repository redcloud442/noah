"use client";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import useUserDataStore from "@/lib/userDataStore";
import { userService } from "@/services/user";
import { AxiosError } from "axios";
import { Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

type FormValues = {
  otp: string;
};

const ResellerContents = () => {
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);

  const { userData, setUserData } = useUserDataStore();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>();

  const handleRequestClick = async () => {
    try {
      setIsRequesting(true);
      await userService.resellerRequest();
      toast.success("Reseller request sent!");
      setShowOtpInput(true);
      setHasRequested(true);
      setResendCooldown(60); // cooldown in seconds
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setIsRequesting(false);
    }
  };

  const handleResendClick = async () => {
    try {
      await userService.resellerRequest();
      toast.success("Code resent!");
      setResendCooldown(60);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Something went wrong.");
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      await userService.verifyResellerCode({ otp: data.otp });

      if (!userData?.userProfile) {
        return;
      }

      setUserData({
        userProfile: userData.userProfile,
        teamMemberProfile: {
          ...userData.teamMemberProfile,
          team_member_role: "RESELLER",
        },
      });

      toast.success("OTP Verified Successfully!");
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Something went wrong.");
    }
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  return (
    <>
      {/* ✅ Already a reseller */}
      {userData?.teamMemberProfile.team_member_role === "RESELLER" ? (
        <div className="p-6 max-w-3xl mx-auto text-center space-y-6">
          <div className="flex flex-col items-center gap-3">
            <h2 className="text-xl font-medium text-green-600">
              You are already a verified NOAH Reseller ✅
            </h2>
            <Link
              href="https://reseller.noir-clothing.com/dashboard"
              target="_blank"
            >
              <Button variant="secondary">Proceed to Reseller Dashboard</Button>
            </Link>
          </div>
        </div>
      ) : !userData?.teamMemberProfile.team_member_request_reseller ? (
        // 🔄 Requested but waiting for approval
        <div className="p-6 max-w-3xl mx-auto text-center space-y-6">
          <div className="flex flex-col items-center gap-3">
            <h2 className="text-xl font-medium text-yellow-600">
              You are not yet eligible to become a Noir Reseller
            </h2>
            <p className="text-muted-foreground">
              Once you&apos;re eligible, you will be notified and gain full
              access to the reseller dashboard.
            </p>
          </div>
        </div>
      ) : (
        // 🆕 Initial request + OTP flow
        <div className="p-6 max-w-3xl mx-auto text-center space-y-6">
          <div className="flex flex-col items-center gap-3">
            <Sparkles className="w-12 h-12 text-yellow-400 animate-pulse" />
            <h2 className="text-2xl font-bold text-primary text-yellow-500">
              Become a Noir Reseller
            </h2>
            <p className="text-muted-foreground max-w-md">
              Join our growing community of resellers and unlock exclusive
              rewards, higher commissions, and early access to limited offers.
            </p>
          </div>

          {!hasRequested ? (
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold text-lg px-6 py-3"
              onClick={handleRequestClick}
              disabled={isRequesting}
            >
              {isRequesting ? "Requesting..." : "Request to Become a Reseller"}
            </Button>
          ) : (
            showOtpInput && (
              <div className="space-y-4 flex flex-col items-center">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Controller
                    name="otp"
                    control={control}
                    defaultValue=""
                    rules={{
                      required: "OTP is required",
                      minLength: 6,
                      maxLength: 6,
                    }}
                    render={({ field }) => (
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Verifying
                      </>
                    ) : (
                      "Verify Code"
                    )}
                  </Button>
                </form>

                <Button
                  variant="link"
                  className="text-muted-foreground"
                  onClick={handleResendClick}
                  disabled={resendCooldown > 0}
                >
                  {resendCooldown > 0
                    ? `Resend Code in ${resendCooldown}s`
                    : "Resend Code"}
                </Button>
              </div>
            )
          )}
        </div>
      )}
    </>
  );
};

export default ResellerContents;
