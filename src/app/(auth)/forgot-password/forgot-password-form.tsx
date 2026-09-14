"use client";

import { useFormState } from "react-dom";
import { forgotPasswordAction } from "@/actions/auth";
import { initialActionState } from "@/lib/action-types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { SubmitButton } from "@/components/ui/submit-button";

export function ForgotPasswordForm() {
  const [state, formAction] = useFormState(forgotPasswordAction, initialActionState);

  if (state.success) {
    return (
      <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required className="mt-1.5" placeholder="you@example.com" />
        <FieldError messages={state.fieldErrors?.email} />
      </div>
      <SubmitButton className="w-full" pendingText="Sending...">
        Send Reset Link
      </SubmitButton>
    </form>
  );
}
