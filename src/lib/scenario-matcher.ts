import { scenarios, type Scenario } from "@/data/scenarios";

export function matchScenario(query: string): Scenario | null {
  const normalized = query.toLowerCase().replace(/\s+/g, "");

  let bestMatch: Scenario | null = null;
  let bestScore = 0;

  for (const scenario of scenarios) {
    let score = 0;
    for (const keywordGroup of scenario.keywords) {
      for (const keyword of keywordGroup) {
        if (normalized.includes(keyword.toLowerCase())) {
          score += 1;
          break; // count each group only once
        }
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = scenario;
    }
  }

  return bestScore >= 1 ? bestMatch : null;
}
