import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChangeEmailForm } from "./change-email-form";
import { ChangePasswordForm } from "./change-password-form";

export const metadata: Metadata = { title: "Account Settings" };

export default async function SettingsPage() {
  const user = await requireUser();
  // Read the email fresh from the database: the session holds a snapshot from
  // sign-in time, which can be stale after an email change.
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { email: true },
  });
  const currentEmail = dbUser?.email ?? user.email;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Account Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your email address and password.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Change email</CardTitle>
          <CardDescription>
            Your current email is <span className="font-medium text-foreground">{currentEmail}</span>.
            After changing it, you&apos;ll need to sign in again with the new email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangeEmailForm currentEmail={currentEmail} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>Choose a new password of at least 8 characters.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
