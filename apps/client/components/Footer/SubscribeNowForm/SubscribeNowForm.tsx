"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { newsLetterService } from "@/services/newsletter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

export type newsletterType = z.infer<typeof schema>;

const SubscribeNowForm = () => {
  const { register, handleSubmit, reset } = useForm<newsletterType>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (submittedData: newsletterType) => {
    try {
      await newsLetterService.subscribe(submittedData);
      reset();
      toast.success("Subscribed to newsletter");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to subscribe to newsletter");
      }
    }
  };

  return (
    <form
      className="flex flex-col sm:flex-row items-center justify-center sm:items-start sm:justify-start gap-3"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Input
        type="email"
        placeholder="Enter your email"
        className="px-4 py-2 rounded bg-white text-black w-64"
        {...register("email")}
      />
      <Button
        type="submit"
        className="px-6 py-2 bg-white text-black rounded hover:bg-gray-200 font-medium"
      >
        Subscribe
      </Button>
    </form>
  );
};

export default SubscribeNowForm;
