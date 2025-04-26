"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userService } from "@/services/user";
import {
  UserChangePasswordFormData,
  userChangePasswordSchema,
} from "@/utils/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type ChangePasswordTabProps = {
  userId: string;
};

const ChangePasswordTab = ({ userId }: ChangePasswordTabProps) => {
  const form = useForm<UserChangePasswordFormData>({
    resolver: zodResolver(userChangePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: UserChangePasswordFormData) => {
    try {
      await userService.changePassword({
        userId: userId,
        password: values.password,
      });
      toast.success("Password changed successfully");
      form.reset();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to change password");
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="password">New Password</Label>
              <FormControl>
                <Input type="password" id="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <FormControl>
                <Input type="password" id="confirmPassword" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          disabled={form.formState.isSubmitting}
          type="submit"
          className="w-full"
        >
          {form.formState.isSubmitting
            ? "Changing Password..."
            : "Change Password"}
        </Button>
      </form>
    </Form>
  );
};

export default ChangePasswordTab;
