/**
 * Generates every unique pairing for a round-robin group stage.
 * For N participants this yields N * (N - 1) / 2 matches, with no
 * duplicate pairings and no participant facing themselves.
 */
export function generateRoundRobinPairs<T extends { id: string }>(
  participants: T[]
): Array<{ participant1: T; participant2: T }> {
  const pairs: Array<{ participant1: T; participant2: T }> = [];
  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      pairs.push({ participant1: participants[i], participant2: participants[j] });
    }
  }
  return pairs;
}

export function expectedMatchCount(n: number) {
  return (n * (n - 1)) / 2;
}

/** Fisher-Yates shuffle - used for random group assignment. */
export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Distributes participants evenly (as possible) across N groups, e.g. A, B, C... */
export function distributeIntoGroups<T>(participants: T[], numGroups: number): T[][] {
  const shuffled = shuffle(participants);
  const groups: T[][] = Array.from({ length: numGroups }, () => []);
  shuffled.forEach((p, idx) => {
    groups[idx % numGroups].push(p);
  });
  return groups;
}

export function groupLetterName(position: number) {
  // position is 0-indexed -> "Group A", "Group B", ...
  return `Group ${String.fromCharCode(65 + position)}`;
}
