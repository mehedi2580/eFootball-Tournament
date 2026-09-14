import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = { title: "Sign Up" };

export default function SignUpPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Sign up to create and manage your own eFootball tournaments.</CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpForm />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
