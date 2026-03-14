"use client";

import React from "react";

type Person = {
  id: number;
  full_name: string;
  mentor_name: string | null;
  baptized: boolean;
  archived: boolean;
  lesson_1: boolean;
  lesson_2: boolean;
  lesson_3: boolean;
  lesson_4: boolean;
  full_course: boolean;
};

type LessonKey = "lesson_1" | "lesson_2" | "lesson_3" | "lesson_4";

function GrowthCell({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
        active
          ? "border-indigo-500 bg-indigo-500 text-white"
          : "border-indigo-300 bg-white text-indigo-400 hover:bg-indigo-50"
      }`}
    >
      {active ? "✓" : ""}
    </button>
  );
}

function MobileLessonButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-indigo-600 text-white"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      {label} {active ? "✓" : ""}
    </button>
  );
}

export default function GrowthSection({
  people,
  quickToggleLesson,
  quickToggleBaptized,
}: {
  people: any[];
  quickToggleLesson: (person: any, lesson: LessonKey) => void;
  quickToggleBaptized: (person: any) => void;
}){
  const activeGrowthPeople = people.filter((p) => !p.archived && !p.full_course);
  const completedGrowthPeople = people.filter((p) => !p.archived && p.full_course);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-[40px]">Путь роста</h1>
        <p className="mt-1 text-slate-500">Отмечайте уроки для каждого подопечного</p>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="hidden grid-cols-[2.4fr_1fr_1fr_1fr_1fr_1.4fr_1.2fr] border-b border-slate-100 bg-slate-50/70 px-6 py-4 text-sm font-semibold uppercase tracking-wide text-slate-500 xl:grid">
          <div>Имя</div>
          <div>Урок 1</div>
          <div>Урок 2</div>
          <div>Урок 3</div>
          <div>Урок 4</div>
          <div>Курс</div>
          <div>Крещение</div>
        </div>

        <div className="hidden divide-y divide-slate-100 xl:block">
          {activeGrowthPeople.length === 0 ? (
            <div className="px-6 py-8 text-sm text-slate-500">
              Сейчас никто не проходит путь роста
            </div>
          ) : (
            activeGrowthPeople.map((person) => (
              <div
                key={person.id}
                className="grid grid-cols-[2.4fr_1fr_1fr_1fr_1fr_1.4fr_1.2fr] items-center px-6 py-5"
              >
                <div className="text-[15px] font-semibold">{person.full_name}</div>

                <GrowthCell
                  active={person.lesson_1}
                  onClick={() => quickToggleLesson(person, "lesson_1")}
                />
                <GrowthCell
                  active={person.lesson_2}
                  onClick={() => quickToggleLesson(person, "lesson_2")}
                />
                <GrowthCell
                  active={person.lesson_3}
                  onClick={() => quickToggleLesson(person, "lesson_3")}
                />
                <GrowthCell
                  active={person.lesson_4}
                  onClick={() => quickToggleLesson(person, "lesson_4")}
                />

                <div>
                  {person.full_course ? (
                    <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 ring-1 ring-emerald-100">
                      Пройден
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </div>

                <div>
                  <GrowthCell
                    active={person.baptized}
                    onClick={() => quickToggleBaptized(person)}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-3 p-4 xl:hidden">
          {activeGrowthPeople.length === 0 ? (
            <div className="text-sm text-slate-500">
              Сейчас никто не проходит путь роста
            </div>
          ) : (
            activeGrowthPeople.map((person) => (
              <div
                key={person.id}
                className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[18px] font-semibold text-slate-900">
                      {person.full_name}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {person.mentor_name || "—"}
                    </div>
                  </div>

                  <div>
                    {person.baptized ? (
                      <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                        Крещён
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Не крещён</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <MobileLessonButton
                    label="Урок 1"
                    active={person.lesson_1}
                    onClick={() => quickToggleLesson(person, "lesson_1")}
                  />
                  <MobileLessonButton
                    label="Урок 2"
                    active={person.lesson_2}
                    onClick={() => quickToggleLesson(person, "lesson_2")}
                  />
                  <MobileLessonButton
                    label="Урок 3"
                    active={person.lesson_3}
                    onClick={() => quickToggleLesson(person, "lesson_3")}
                  />
                  <MobileLessonButton
                    label="Урок 4"
                    active={person.lesson_4}
                    onClick={() => quickToggleLesson(person, "lesson_4")}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="text-sm text-slate-600">
                    Курс:{" "}
                    <span className="font-medium text-slate-900">
                      {person.full_course ? "Пройден" : "В процессе"}
                    </span>
                  </div>

                  <button
                    onClick={() => quickToggleBaptized(person)}
                    className={`rounded-2xl px-3 py-2 text-sm font-medium transition ${
                      person.baptized
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {person.baptized ? "Крещён" : "Отметить"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4">
          <div className="text-lg font-semibold">Закончили путь роста</div>
        </div>

        <div className="hidden divide-y divide-slate-100 xl:block">
          {completedGrowthPeople.length === 0 ? (
            <div className="px-6 py-8 text-sm text-slate-500">Пока никого нет</div>
          ) : (
            completedGrowthPeople.map((person) => (
              <div
                key={person.id}
                className="grid grid-cols-[2fr_2fr_1fr] items-center px-6 py-4"
              >
                <div className="text-[15px] font-semibold">{person.full_name}</div>
                <div className="text-[14px] text-slate-500">
                  {person.mentor_name || "—"}
                </div>
                <div>
                  {person.baptized ? (
                    <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 ring-1 ring-emerald-100">
                      Крещён
                    </span>
                  ) : (
                    <span className="text-slate-400">не крещён</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-3 p-4 xl:hidden">
          {completedGrowthPeople.length === 0 ? (
            <div className="text-sm text-slate-500">Пока никого нет</div>
          ) : (
            completedGrowthPeople.map((person) => (
              <div
                key={person.id}
                className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="text-[17px] font-semibold text-slate-900">
                  {person.full_name}
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  {person.mentor_name || "—"}
                </div>

                <div className="mt-3">
                  {person.baptized ? (
                    <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 ring-1 ring-emerald-100">
                      Крещён
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">Не крещён</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}