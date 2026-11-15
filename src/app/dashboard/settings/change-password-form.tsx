"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { changePasswordAction } from "@/actions/settings";
import { initialActionState } from "@/lib/action-types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { SubmitButton } from "@/components/ui/submit-button";

export function ChangePasswordForm() {
  const [state, formAction] = useFormState(changePasswordAction, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="passwordCurrentPassword">Current password</Label>
        <Input
          id="passwordCurrentPassword"
          name="currentPassword"
          type="password"
          required
          className="mt-1.5"
          autoComplete="current-password"
        />
        <FieldError messages={state.fieldErrors?.currentPassword} />
      </div>
      <div>
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          name="password"
          type="password"
          required
          className="mt-1.5"
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />
        <FieldError messages={state.fieldErrors?.password} />
      </div>
      <div>
        <Label htmlFor="confirmNewPassword">Confirm new password</Label>
        <Input
          id="confirmNewPassword"
          name="confirmPassword"
          type="password"
          required
          className="mt-1.5"
          autoComplete="new-password"
        />
        <FieldError messages={state.fieldErrors?.confirmPassword} />
      </div>
      {state.message && (
        <p className={`text-sm ${state.success ? "text-success" : "text-destructive"}`}>
          {state.message}
        </p>
      )}
      <SubmitButton pendingText="Updating password...">Update Password</SubmitButton>
    </form>
  );
}
