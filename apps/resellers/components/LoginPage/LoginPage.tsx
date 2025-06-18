"use client";

import { authService } from "@/services/auth";
import { createClient } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  ButtonGroup,
  Paper,
  PasswordInput,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconBrandFacebookFilled, IconBrandGoogle } from "@tabler/icons-react";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import classes from "./AuthenticationImage.module.css";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const LoginPage = () => {
  const supabase = createClient();
  const router = useRouter();

  const { control, handleSubmit } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      const { email, password } = data;

      const { redirectTo, error: userError } = await authService.login({
        email,
      });

      if (userError) {
        notifications.show({
          title: "Login failed",
          message: userError.message,
          color: "red",
        });
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        notifications.show({
          title: "Login failed",
          message: error.message,
          color: "red",
        });
      }

      notifications.show({
        title: "Login successful",
        message: "You have been logged in successfully",
        color: "green",
      });

      router.push(redirectTo);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      notifications.show({
        title: "Login failed",
        message: err.response?.data.message,
        color: "red",
      });
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
        },
      });

      localStorage.removeItem("shoppingCart");
    } catch (error) {
      if (error instanceof Error) {
        notifications.show({
          title: "Error signing in with Google",
          message: error.message,
          color: "red",
        });
      } else {
        notifications.show({
          title: "Error signing in with Google",
          message: "Error signing in with Google",
          color: "red",
        });
      }
    }
  };

  const handleSignInWithFacebook = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
        },
      });

      localStorage.removeItem("shoppingCart");
    } catch (error) {
      if (error instanceof Error) {
        notifications.show({
          title: "Error signing in with Facebook",
          message: error.message,
          color: "red",
        });
      } else {
        notifications.show({
          title: "Error signing in with Facebook",
          message: "Error signing in with Facebook",
          color: "red",
        });
      }
    }
  };

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form} radius={0} p={30}>
        <Title order={2} className={classes.title} ta="center" mt="md" mb={50}>
          Welcome back to Noir Reseller!
        </Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <TextInput
                label="Email address"
                placeholder="hello@gmail.com"
                size="md"
                {...field}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <PasswordInput
                label="Password"
                placeholder="Your password"
                mt="md"
                size="md"
                {...field}
              />
            )}
          />

          <ButtonGroup mt="xl">
            <Button
              fullWidth
              onClick={handleSignInWithFacebook}
              variant="default"
              leftSection={<IconBrandFacebookFilled color="#339af0" />}
            >
              Facebook
            </Button>
            <Button
              fullWidth
              onClick={handleSignInWithGoogle}
              variant="default"
              leftSection={<IconBrandGoogle color="#f08c00" />}
            >
              Google
            </Button>
          </ButtonGroup>

          <Button type="submit" fullWidth mt="xl" size="md">
            Login
          </Button>
        </form>

        {/* <Text ta="center" mt="md">
          Don&apos;t have an account?{" "}
          <Anchor<"a">
            href="#"
            fw={700}
            onClick={(event) => event.preventDefault()}
          >
            Register
          </Anchor>
        </Text> */}
      </Paper>
    </div>
  );
};
