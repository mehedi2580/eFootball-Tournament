import { prisma } from "@/lib/prisma";

// Characters chosen to avoid ambiguous look-alikes (no 0/O, 1/I/L).
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function randomSegment(length: number) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

/**
 * Generates a unique, short, human-friendly tournament code like "EFO-8K4P2".
 * Codes are stored and matched case-insensitively.
 */
export async function generateUniqueTournamentCode(): Promise<string> {
  for (let attempt = 0; attempt < 25; attempt++) {
    const code = `EFO-${randomSegment(5)}`;
    const existing = await prisma.tournament.findUnique({
      where: { uniqueCode: code },
      select: { id: true },
    });
    if (!existing) return code;
  }
  throw new Error("Could not generate a unique tournament code. Please try again.");
}

export function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}
