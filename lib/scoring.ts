export function calcMatchPoints(
  predictedArg: number,
  predictedOpp: number,
  actualArg: number,
  actualOpp: number
): number {
  if (predictedArg === actualArg && predictedOpp === actualOpp) return 3;
  const predictedResult = Math.sign(predictedArg - predictedOpp);
  const actualResult = Math.sign(actualArg - actualOpp);
  if (predictedResult === actualResult) return 1;
  return 0;
}

export function calcGroupPoints(
  predictedFirst: string,
  predictedSecond: string,
  actualFirst: string,
  actualSecond: string
): number {
  const advanced = [actualFirst, actualSecond];
  let pts = 0;
  if (advanced.includes(predictedFirst)) pts++;
  if (advanced.includes(predictedSecond)) pts++;
  return pts;
}

export function getResultLabel(argentina: number, opponent: number): string {
  if (argentina > opponent) return "Victoria";
  if (argentina < opponent) return "Derrota";
  return "Empate";
}

export function calcKnockoutPoints(
  predictedArg: number,
  predictedOpp: number,
  predictedOpponentTeam: string | null,
  actualArg: number,
  actualOpp: number,
  actualOpponentTeam: string | null
): number {
  // Si el rival no coincide con lo predicho: 0 pts
  if (!predictedOpponentTeam || !actualOpponentTeam) return 0;
  if (predictedOpponentTeam !== actualOpponentTeam) return 0;

  // Rival correcto → mínimo 1 pt
  if (predictedArg === actualArg && predictedOpp === actualOpp) return 3;
  const predictedResult = Math.sign(predictedArg - predictedOpp);
  const actualResult = Math.sign(actualArg - actualOpp);
  if (predictedResult === actualResult) return 2;
  return 1;
}

export function getResultBadge(
  predictedArg: number,
  predictedOpp: number,
  actualArg: number,
  actualOpp: number
): "exact" | "correct" | "wrong" {
  if (predictedArg === actualArg && predictedOpp === actualOpp) return "exact";
  const predictedResult = Math.sign(predictedArg - predictedOpp);
  const actualResult = Math.sign(actualArg - actualOpp);
  if (predictedResult === actualResult) return "correct";
  return "wrong";
}
