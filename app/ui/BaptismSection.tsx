"use client";

import React from "react";

type Person = {
  id: number;
  full_name: string;
  mentor_name: string | null;
  baptized: boolean;
  archived: boolean;
  baptism_lesson_1: boolean;
  baptism_lesson_2: boolean;
  baptism_ready: boolean;
};

function Cell({
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
          ? "border-cyan-500 bg-cyan-500 text-white"
          : "border-cyan-300 bg-white text-cyan-400 hover:bg-cyan-50"
      }`}
    >
      {active ? "✓" : ""}
    </button>
  );
}

function MobileStepButton({
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
          ? "bg-cyan-500 text-white"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      {label} {active ? "✓" : ""}
    </button>
  );
}

export default function BaptismSection({
  people,
  quickToggleBaptismLesson,
  quickToggleBaptized,
}: {
  people: Person[];
  quickToggleBaptismLesson: (
    person: Person,
    lesson: "baptism_lesson_1" | "baptism_lesson_2"
  ) => void;
  quickToggleBaptized: (person: Person) => void;
}) {
  const activePeople = people.filter((p) => !p.archived && !p.baptized);
  const completedPeople = people.filter((p) => !p.archived && p.baptized);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-[40px]">
          Подготовка к крещению
        </h1>
        <p className="mt-1 text-slate-500">
          Две встречи подготовки и затем само крещение
        </p>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="hidden grid-cols-[2.4fr_1fr_1fr_1.2fr] border-b border-slate-100 bg-slate-50/70 px-6 py-4 text-sm font-semibold uppercase tracking-wide text-slate-500 xl:grid">
          <div>Имя</div>
          <div>Встреча 1</div>
          <div>Встреча 2</div>
          <div>Крещение</div>
        </div>

        <div className="hidden divide-y divide-slate-100 xl:block">
          {activePeople.length === 0 ? (
            <div className="px-6 py-8 text-sm text-slate-500">
              Пока никого нет
            </div>
          ) : (
            activePeople.map((person) => (
              <div
                key={person.id}
                className="grid grid-cols-[2.4fr_1fr_1fr_1.2fr] items-center px-6 py-5"
              >
                <div>
                  <div className="text-[15px] font-semibold">
                    {person.full_name}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    {person.mentor_name || "—"}
                  </div>
                </div>

                <Cell
                  active={person.baptism_lesson_1}
                  onClick={() =>
                    quickToggleBaptismLesson(person, "baptism_lesson_1")
                  }
                />

                <Cell
                  active={person.baptism_lesson_2}
                  onClick={() =>
                    quickToggleBaptismLesson(person, "baptism_lesson_2")
                  }
                />

                <Cell
                  active={person.baptized}
                  onClick={() => quickToggleBaptized(person)}
                />
              </div>
            ))
          )}
        </div>

        <div className="space-y-3 p-4 xl:hidden">
          {activePeople.length === 0 ? (
            <div className="text-sm text-slate-500">Пока никого нет</div>
          ) : (
            activePeople.map((person) => (
              <div
                key={person.id}
                className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="text-[18px] font-semibold text-slate-900">
                  {person.full_name}
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  {person.mentor_name || "—"}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <MobileStepButton
                    label="Встреча 1"
                    active={person.baptism_lesson_1}
                    onClick={() =>
                      quickToggleBaptismLesson(person, "baptism_lesson_1")
                    }
                  />

                  <MobileStepButton
                    label="Встреча 2"
                    active={person.baptism_lesson_2}
                    onClick={() =>
                      quickToggleBaptismLesson(person, "baptism_lesson_2")
                    }
                  />

                  <MobileStepButton
                    label="Крещение"
                    active={person.baptized}
                    onClick={() => quickToggleBaptized(person)}
                  />
                </div>

                <div className="mt-4 text-sm text-slate-600">
                  Статус:{" "}
                  <span className="font-medium text-slate-900">
                    {person.baptism_ready ? "Готов к крещению" : "В процессе"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4">
          <div className="text-lg font-semibold">Уже крещены</div>
        </div>

        <div className="space-y-3 p-4">
          {completedPeople.length === 0 ? (
            <div className="text-sm text-slate-500">Пока никого нет</div>
          ) : (
            completedPeople.map((person) => (
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
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}