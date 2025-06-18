import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RegisterFormValues, registerSchema } from "@/lib/zod";
import { authService } from "@/services/auth";
import { createClient } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

const RegisterModal = () => {
  const [open, setOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const {
    control,
    handleSubmit,

    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const validatedData = registerSchema.safeParse(data);

      if (!validatedData.success) {
        toast.error(validatedData.error.message);
        return;
      }
      const { error } = await supabase.auth.signUp({
        email: validatedData.data.email,
        password: validatedData.data.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      await authService.register({
        ...validatedData.data,
      });

      toast.success("Account created successfully");

      router.push("/account");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="text-white p-0 text-underline hover:bg-transparent"
        >
          Register
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register</DialogTitle>
          <DialogDescription>Create your account below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* First Name */}
          <div>
            <Label htmlFor="firstName" className="text-white">
              First Name
            </Label>
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <Input
                  id="firstName"
                  placeholder="John"
                  {...field}
                  value={field.value}
                />
              )}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm">{errors.firstName.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <Label htmlFor="lastName" className="text-white">
              Last Name
            </Label>
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <Input
                  id="lastName"
                  placeholder="Doe"
                  {...field}
                  value={field.value}
                />
              )}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm">{errors.lastName.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...field}
                  value={field.value}
                />
              )}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...field}
                  value={field.value}
                />
              )}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          <Button disabled={isSubmitting} type="submit" className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Registering...
              </>
            ) : (
              "Register"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal;
