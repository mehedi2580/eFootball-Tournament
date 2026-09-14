import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log In" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { registered?: string; reset?: string };
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Log in to manage your tournaments.</CardDescription>
      </CardHeader>
      <CardContent>
        {searchParams.registered && (
          <p className="mb-4 rounded-md bg-success/10 px-3 py-2 text-sm text-success">
            Account created. You can now log in.
          </p>
        )}
        {searchParams.reset && (
          <p className="mb-4 rounded-md bg-success/10 px-3 py-2 text-sm text-success">
            Password updated. You can now log in.
          </p>
        )}
        <LoginForm />
        <div className="mt-4 flex flex-col items-center gap-2 text-sm">
          <Link href="/forgot-password" className="text-muted-foreground hover:underline">
            Forgot your password?
          </Link>
          <p className="text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
