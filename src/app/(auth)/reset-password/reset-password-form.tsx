"use client";

import { useFormState } from "react-dom";
import { resetPasswordAction } from "@/actions/auth";
import { initialActionState } from "@/lib/action-types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { SubmitButton } from "@/components/ui/submit-button";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useFormState(resetPasswordAction, initialActionState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <Label htmlFor="password">New Password</Label>
        <Input id="password" name="password" type="password" required className="mt-1.5" />
        <FieldError messages={state.fieldErrors?.password} />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required className="mt-1.5" />
        <FieldError messages={state.fieldErrors?.confirmPassword} />
      </div>
      {state.message && !state.success && <p className="text-sm text-destructive">{state.message}</p>}
      <SubmitButton className="w-full" pendingText="Updating...">
        Update Password
      </SubmitButton>
    </form>
  );
}
