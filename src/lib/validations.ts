import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(60),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const createTournamentSchema = z
  .object({
    name: z.string().min(3, "Tournament name must be at least 3 characters").max(100),
    description: z.string().max(1000).optional().or(z.literal("")),
    organizerName: z.string().min(2, "Organizer name is required").max(60),
    numParticipants: z.coerce.number().int().min(4, "At least 4 participants required").max(128),
    numGroups: z.coerce.number().int().min(1, "At least 1 group required").max(32),
    startDate: z.string().optional().or(z.literal("")),
    endDate: z.string().optional().or(z.literal("")),
    isPublic: z.boolean().default(true),
  })
  .refine((data) => data.numParticipants >= data.numGroups, {
    message: "Number of participants must be at least the number of groups",
    path: ["numGroups"],
  });

export const addParticipantSchema = z.object({
  name: z.string().min(1, "Participant name is required").max(60),
});

export const editParticipantSchema = z.object({
  participantId: z.string().min(1),
  name: z.string().min(1, "Participant name is required").max(60),
});

export const matchResultSchema = z.object({
  matchId: z.string().min(1),
  participant1Score: z.coerce.number().int().min(0, "Score cannot be negative").max(999),
  participant2Score: z.coerce.number().int().min(0, "Score cannot be negative").max(999),
});

export const tournamentSearchSchema = z.object({
  query: z.string().min(1, "Enter a tournament code or name").max(100),
});
