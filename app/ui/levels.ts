export type LevelValue =
  | "passerby"
  | "local"
  | "visiting"
  | "church"
  | "committed"
  | "core";

export type CoreRoleValue = "leader" | "pastor";

export const levelOptions: string[][] = [
  ["passerby", "Проходной"],
  ["local", "Местная"],
  ["visiting", "Посещающая"],
  ["church", "Церковная"],
  ["committed", "Посвящённая"],
  ["core", "Ядро"],
];

export const coreRoleOptions: string[][] = [
  ["leader", "Лидер"],
  ["pastor", "Пастор"],
];

export const levelLabels: Record<string, string> = {
  passerby: "Проходной",
  local: "Местная",
  visiting: "Посещающая",
  church: "Церковная",
  committed: "Посвящённая",
  core: "Ядро",
};

export const coreRoleLabels: Record<CoreRoleValue, string> = {
  leader: "Лидер",
  pastor: "Пастор",
};

export const levelOrder: Record<string, number> = {
  passerby: 0,
  local: 1,
  visiting: 2,
  church: 3,
  committed: 4,
  core: 5,
};

export const levelBadge: Record<string, string> = {
  passerby: "bg-zinc-100 text-zinc-600 border border-zinc-200 shadow-sm",
  local: "bg-slate-100 text-slate-700 border border-slate-200 shadow-sm",
  visiting: "bg-emerald-100/70 text-emerald-700 border border-emerald-200 shadow-sm",
  church: "bg-blue-100/70 text-blue-700 border border-blue-200 shadow-sm",
  committed: "bg-orange-100/70 text-orange-700 border border-orange-200 shadow-sm",
  core: "bg-rose-100/70 text-rose-700 border border-rose-200 shadow-sm",
};

export const coreRoleBadge: Record<CoreRoleValue, string> = {
  leader: "bg-white text-rose-700 ring-1 ring-rose-200",
  pastor: "bg-white text-cyan-700 ring-1 ring-cyan-200",
};

export function normalizeLevel(level: string | null | undefined): LevelValue {
  if (level === "leader" || level === "pastor") return "core";
  if (level && level in levelLabels) return level as LevelValue;
  return "local";
}

export function normalizeCoreRole(
  role: string | null | undefined
): CoreRoleValue {
  return role === "pastor" ? "pastor" : "leader";
}

export function getLevelLabel(level: string | null | undefined) {
  return levelLabels[normalizeLevel(level)];
}

export function getLevelBadgeClass(level: string | null | undefined) {
  return levelBadge[normalizeLevel(level)] || "bg-slate-100 text-slate-700";
}

export function getCoreRoleLabel(role: string | null | undefined) {
  return coreRoleLabels[normalizeCoreRole(role)];
}

export function getCoreRoleBadgeClass(role: string | null | undefined) {
  return coreRoleBadge[normalizeCoreRole(role)];
}
