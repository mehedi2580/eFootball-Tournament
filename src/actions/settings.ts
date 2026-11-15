"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { changeEmailSchema, changePasswordSchema } from "@/lib/validations";
import type { ActionState } from "@/lib/action-types";

export async function changeEmailAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = changeEmailSchema.safeParse({
    email: formData.get("email"),
    currentPassword: formData.get("currentPassword"),
  });
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const email = parsed.data.email.toLowerCase().trim();

  try {
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      return { success: false, message: "Account not found. Please sign in again." };
    }

    const passwordOk = await bcrypt.compare(parsed.data.currentPassword, dbUser.passwordHash);
    if (!passwordOk) {
      return {
        success: false,
        fieldErrors: { currentPassword: ["Current password is incorrect."] },
      };
    }

    if (email === dbUser.email) {
      return {
        success: false,
        fieldErrors: { email: ["This is already your email address."] },
      };
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return {
        success: false,
        fieldErrors: { email: ["An account with this email already exists."] },
      };
    }

    await prisma.user.update({ where: { id: user.id }, data: { email } });
  } catch (e) {
    // Race with another user claiming the same email between the check and the
    // update: the unique constraint rejects it with P2002.
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return {
        success: false,
        fieldErrors: { email: ["An account with this email already exists."] },
      };
    }
    return { success: false, message: "Something went wrong. Please try again later." };
  }

  return {
    success: true,
    message: "Email updated. Signing you out — please sign in again with your new email.",
  };
}

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      return { success: false, message: "Account not found. Please sign in again." };
    }

    const passwordOk = await bcrypt.compare(parsed.data.currentPassword, dbUser.passwordHash);
    if (!passwordOk) {
      return {
        success: false,
        fieldErrors: { currentPassword: ["Current password is incorrect."] },
      };
    }

    const sameAsOld = await bcrypt.compare(parsed.data.password, dbUser.passwordHash);
    if (sameAsOld) {
      return {
        success: false,
        fieldErrors: { password: ["New password must be different from your current password."] },
      };
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  } catch {
    return { success: false, message: "Something went wrong. Please try again later." };
  }

  return { success: true, message: "Password updated." };
}
