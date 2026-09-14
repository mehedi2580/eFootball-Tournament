"use client";

import { useFormState } from "react-dom";
import { signUpAction } from "@/actions/auth";
import { initialActionState } from "@/lib/action-types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { SubmitButton } from "@/components/ui/submit-button";

export function SignUpForm() {
  const [state, formAction] = useFormState(signUpAction, initialActionState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="name">Name / Username</Label>
        <Input id="name" name="name" required className="mt-1.5" placeholder="Alex Carter" />
        <FieldError messages={state.fieldErrors?.name} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required className="mt-1.5" placeholder="you@example.com" />
        <FieldError messages={state.fieldErrors?.email} />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required className="mt-1.5" placeholder="At least 8 characters" />
        <FieldError messages={state.fieldErrors?.password} />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required className="mt-1.5" />
        <FieldError messages={state.fieldErrors?.confirmPassword} />
      </div>
      {state.message && !state.success && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
      <SubmitButton className="w-full" pendingText="Creating account...">
        Create Account
      </SubmitButton>
    </form>
  );
}
