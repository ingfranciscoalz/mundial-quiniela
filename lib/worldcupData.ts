import type { Group, ArgentinaMatch, Team, KnockoutMatchConfig } from "@/types";

export const ARGENTINA: Team = { id: "ARG", name: "Argentina", flag: "🇦🇷" };

export const GROUPS: Group[] = [
  {
    id: "A",
    teams: [
      { id: "MEX", name: "México", flag: "🇲🇽" },
      { id: "RSA", name: "Sudáfrica", flag: "🇿🇦" },
      { id: "KOR", name: "Corea del Sur", flag: "🇰🇷" },
      { id: "CZE", name: "Chequia", flag: "🇨🇿" },
    ],
  },
  {
    id: "B",
    teams: [
      { id: "CAN", name: "Canadá", flag: "🇨🇦" },
      { id: "BIH", name: "Bosnia-Herzegovina", flag: "🇧🇦" },
      { id: "QAT", name: "Qatar", flag: "🇶🇦" },
      { id: "SUI", name: "Suiza", flag: "🇨🇭" },
    ],
  },
  {
    id: "C",
    teams: [
      { id: "BRA", name: "Brasil", flag: "🇧🇷" },
      { id: "MAR", name: "Marruecos", flag: "🇲🇦" },
      { id: "HAI", name: "Haití", flag: "🇭🇹" },
      { id: "SCO", name: "Escocia", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
    ],
  },
  {
    id: "D",
    teams: [
      { id: "USA", name: "Estados Unidos", flag: "🇺🇸" },
      { id: "PAR", name: "Paraguay", flag: "🇵🇾" },
      { id: "AUS", name: "Australia", flag: "🇦🇺" },
      { id: "TUR", name: "Türkiye", flag: "🇹🇷" },
    ],
  },
  {
    id: "E",
    teams: [
      { id: "GER", name: "Alemania", flag: "🇩🇪" },
      { id: "CUW", name: "Curaçao", flag: "🇨🇼" },
      { id: "CIV", name: "Costa de Marfil", flag: "🇨🇮" },
      { id: "ECU", name: "Ecuador", flag: "🇪🇨" },
    ],
  },
  {
    id: "F",
    teams: [
      { id: "NED", name: "Países Bajos", flag: "🇳🇱" },
      { id: "JPN", name: "Japón", flag: "🇯🇵" },
      { id: "SWE", name: "Suecia", flag: "🇸🇪" },
      { id: "TUN", name: "Túnez", flag: "🇹🇳" },
    ],
  },
  {
    id: "G",
    teams: [
      { id: "BEL", name: "Bélgica", flag: "🇧🇪" },
      { id: "EGY", name: "Egipto", flag: "🇪🇬" },
      { id: "IRN", name: "Irán", flag: "🇮🇷" },
      { id: "NZL", name: "Nueva Zelanda", flag: "🇳🇿" },
    ],
  },
  {
    id: "H",
    teams: [
      { id: "ESP", name: "España", flag: "🇪🇸" },
      { id: "CPV", name: "Cabo Verde", flag: "🇨🇻" },
      { id: "KSA", name: "Arabia Saudita", flag: "🇸🇦" },
      { id: "URU", name: "Uruguay", flag: "🇺🇾" },
    ],
  },
  {
    id: "I",
    teams: [
      { id: "FRA", name: "Francia", flag: "🇫🇷" },
      { id: "SEN", name: "Senegal", flag: "🇸🇳" },
      { id: "IRQ", name: "Iraq", flag: "🇮🇶" },
      { id: "NOR", name: "Noruega", flag: "🇳🇴" },
    ],
  },
  {
    id: "J",
    teams: [
      { id: "ARG", name: "Argentina", flag: "🇦🇷" },
      { id: "ALG", name: "Argelia", flag: "🇩🇿" },
      { id: "AUT", name: "Austria", flag: "🇦🇹" },
      { id: "JOR", name: "Jordania", flag: "🇯🇴" },
    ],
  },
  {
    id: "K",
    teams: [
      { id: "POR", name: "Portugal", flag: "🇵🇹" },
      { id: "COD", name: "Congo DR", flag: "🇨🇩" },
      { id: "UZB", name: "Uzbekistán", flag: "🇺🇿" },
      { id: "COL", name: "Colombia", flag: "🇨🇴" },
    ],
  },
  {
    id: "L",
    teams: [
      { id: "ENG", name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
      { id: "CRO", name: "Croacia", flag: "🇭🇷" },
      { id: "GHA", name: "Ghana", flag: "🇬🇭" },
      { id: "PAN", name: "Panamá", flag: "🇵🇦" },
    ],
  },
];

export const ARGENTINA_MATCHES: ArgentinaMatch[] = [
  {
    id: "ARG-1",
    stage: "group",
    stageLabel: "Fase de Grupos",
    opponent: { id: "ALG", name: "Argelia", flag: "🇩🇿" },
    date: "2026-06-16",
    venue: "Arrowhead Stadium, Kansas City",
    lockTime: "2026-06-16T22:00:00-03:00",
  },
  {
    id: "ARG-2",
    stage: "group",
    stageLabel: "Fase de Grupos",
    opponent: { id: "AUT", name: "Austria", flag: "🇦🇹" },
    date: "2026-06-22",
    venue: "AT&T Stadium, Dallas",
    lockTime: "2026-06-22T14:00:00-03:00",
  },
  {
    id: "ARG-3",
    stage: "group",
    stageLabel: "Fase de Grupos",
    opponent: { id: "JOR", name: "Jordania", flag: "🇯🇴" },
    date: "2026-06-27",
    venue: "AT&T Stadium, Dallas",
    lockTime: "2026-06-27T23:00:00-03:00",
  },
];

export const KNOCKOUT_MATCHES: KnockoutMatchConfig[] = [
  {
    id: "ARG-R32",
    stage: "r32",
    stageLabel: "Ronda de 32",
    date: "2026-07-03",
    venue: "Hard Rock Stadium, Miami",
    lockTime: "2026-07-03T15:00:00-03:00",
    bracketDescription:
      "2° Grupo H si Argentina termina 1° · 1° Grupo H si termina 2°",
    autoFillGroupIfFirst: "H",
    autoFillPositionIfFirst: "second",
    autoFillGroupIfSecond: "H",
    autoFillPositionIfSecond: "first",
  },
  {
    id: "ARG-R16",
    stage: "r16",
    stageLabel: "Octavos de Final",
    date: "2026-07-07",
    venue: "Mercedes-Benz Stadium, Atlanta",
    lockTime: "2026-07-07T15:00:00-03:00",
    bracketDescription: "Ganador del cruce Grupos D / G",
    autoFillGroupIfFirst: null,
    autoFillPositionIfFirst: "first",
    autoFillGroupIfSecond: null,
    autoFillPositionIfSecond: "first",
  },
  {
    id: "ARG-QF",
    stage: "qf",
    stageLabel: "Cuartos de Final",
    date: "2026-07-11",
    venue: "Arrowhead Stadium, Kansas City",
    lockTime: "2026-07-11T15:00:00-03:00",
    bracketDescription: "Ganador del cruce Grupos K / L",
    autoFillGroupIfFirst: null,
    autoFillPositionIfFirst: "first",
    autoFillGroupIfSecond: null,
    autoFillPositionIfSecond: "first",
  },
  {
    id: "ARG-SF",
    stage: "sf",
    stageLabel: "Semifinal",
    date: "2026-07-15",
    venue: "Mercedes-Benz Stadium, Atlanta",
    lockTime: "2026-07-15T15:00:00-03:00",
    bracketDescription: "Ganador de la otra llave (Grupos A/B/C/D)",
    autoFillGroupIfFirst: null,
    autoFillPositionIfFirst: "first",
    autoFillGroupIfSecond: null,
    autoFillPositionIfSecond: "first",
  },
  {
    id: "ARG-FINAL",
    stage: "final",
    stageLabel: "Final",
    date: "2026-07-19",
    venue: "MetLife Stadium, East Rutherford, NJ",
    lockTime: "2026-07-19T16:00:00-03:00",
    bracketDescription: "Gran Final del Mundial 2026 🏆",
    autoFillGroupIfFirst: null,
    autoFillPositionIfFirst: "first",
    autoFillGroupIfSecond: null,
    autoFillPositionIfSecond: "first",
  },
];

export const OTHER_GROUPS = GROUPS.filter((g) => g.id !== "J");

export function getGroupById(id: string): Group | undefined {
  return GROUPS.find((g) => g.id === id);
}

export function getTeamById(id: string): Team | undefined {
  for (const group of GROUPS) {
    const team = group.teams.find((t) => t.id === id);
    if (team) return team;
  }
  return undefined;
}
