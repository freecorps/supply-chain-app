"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { AuthError } from "@supabase/supabase-js";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function AuthPage() {
  const supabase = createClient();
  const [isLogin, setIsLogin] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: FormValues) {
    let errorForm: AuthError | null = null;
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        errorForm = error;
      } else {
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
        });
        errorForm = error;
      }

      if (errorForm) {
        toast.error("Failed to log in");
        return;
      }

      if (isLogin) {
        toast("Logged in successfully");
      } else {
        toast("Account created successfully");
      }

      toast("Logged in successfully");
    } catch (error) {
      toast.error("Failed to log in");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>{isLogin ? "Login" : "Sign Up"}</CardTitle>
            <CardDescription>
              {isLogin ? "Welcome back!" : "Create a new account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full">
                {isLogin ? "Log in" : "Sign up"}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Log in"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
