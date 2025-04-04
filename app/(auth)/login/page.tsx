import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login | Smart Shop Admin",
  description: "Login to your Smart Shop admin account",
};

export default function LoginPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="relative group">
          {/* Animated border */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-x"></div>

          {/* Card content */}
          <div className="relative bg-card rounded-lg border p-8 shadow-lg">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Sign in to your account
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your credentials to access your admin dashboard
              </p>
            </div>
            <div className="mt-6">
              <LoginForm />
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              <Link
                href="/forgot-password"
                className="underline underline-offset-4 hover:text-primary"
              >
                Forgot your password?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
