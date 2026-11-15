"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { signOut } from "next-auth/react";
import { changeEmailAction } from "@/actions/settings";
import { initialActionState } from "@/lib/action-types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { SubmitButton } from "@/components/ui/submit-button";

export function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, formAction] = useFormState(changeEmailAction, initialActionState);

  // The session still carries the old email (JWT snapshot from sign-in), so
  // sign out after a successful change and send the user to log in again.
  useEffect(() => {
    if (state.success) {
      const t = setTimeout(() => {
        void signOut({ callbackUrl: "/login?email-changed=1" });
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="newEmail">New email</Label>
        <Input
          id="newEmail"
          name="email"
          type="email"
          required
          className="mt-1.5"
          placeholder={currentEmail}
          autoComplete="email"
        />
        <FieldError messages={state.fieldErrors?.email} />
      </div>
      <div>
        <Label htmlFor="emailCurrentPassword">Current password</Label>
        <Input
          id="emailCurrentPassword"
          name="currentPassword"
          type="password"
          required
          className="mt-1.5"
          autoComplete="current-password"
        />
        <FieldError messages={state.fieldErrors?.currentPassword} />
      </div>
      {state.message && (
        <p className={`text-sm ${state.success ? "text-success" : "text-destructive"}`}>
          {state.message}
        </p>
      )}
      <SubmitButton pendingText="Updating email...">Update Email</SubmitButton>
    </form>
  );
}
