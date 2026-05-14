export type LevelValue =
  | "passerby"
  | "local"
  | "visiting"
  | "church"
  | "committed"
  | "leader"
  | "pastor";

export const levelOptions: string[][] = [
  ["passerby", "Проходной"],
  ["local", "Местная"],
  ["visiting", "Посещающая"],
  ["church", "Церковная"],
  ["committed", "Посвящённая"],
  ["leader", "Лидер"],
  ["pastor", "Пастор"],
];

export const levelLabels: Record<string, string> = {
  passerby: "Проходной",
  local: "Местная",
  visiting: "Посещающая",
  church: "Церковная",
  committed: "Посвящённая",
  leader: "Лидер",
  pastor: "Пастор",
};

export const levelOrder: Record<string, number> = {
  passerby: 0,
  local: 1,
  visiting: 2,
  church: 3,
  committed: 4,
  leader: 5,
  pastor: 6,
};

export const levelBadge: Record<string, string> = {
  passerby: "bg-zinc-100 text-zinc-600 border border-zinc-200 shadow-sm",
  local: "bg-slate-100 text-slate-700 border border-slate-200 shadow-sm",
  visiting: "bg-emerald-100/70 text-emerald-700 border border-emerald-200 shadow-sm",
  church: "bg-blue-100/70 text-blue-700 border border-blue-200 shadow-sm",
  committed: "bg-orange-100/70 text-orange-700 border border-orange-200 shadow-sm",
  leader: "bg-rose-100/70 text-rose-700 border border-rose-200 shadow-sm",
  pastor: "bg-cyan-100/80 text-cyan-700 border border-cyan-200 shadow-sm",
};

export function normalizeLevel(level: string | null | undefined): LevelValue {
  if (level === "core") return "leader";
  if (level && level in levelLabels) return level as LevelValue;
  return "local";
}

export function getLevelLabel(level: string | null | undefined) {
  return levelLabels[normalizeLevel(level)];
}

export function getLevelBadgeClass(level: string | null | undefined) {
  return levelBadge[normalizeLevel(level)] || "bg-slate-100 text-slate-700";
}
