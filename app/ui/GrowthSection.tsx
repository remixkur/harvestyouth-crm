"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Person = {
  id: number;
  full_name: string;
  mentor_name: string | null;
  baptized: boolean;
  archived: boolean;
  path_growth?: number | null;
  lesson_1: boolean;
  lesson_2: boolean;
  lesson_3: boolean;
  lesson_4: boolean;
  full_course: boolean;
};

type LessonKey = "lesson_1" | "lesson_2" | "lesson_3" | "lesson_4";

const growthLessons = [
  { number: 1, key: "lesson_1", label: "Урок 1" },
  { number: 2, key: "lesson_2", label: "Урок 2" },
  { number: 3, key: "lesson_3", label: "Урок 3" },
  { number: 4, key: "lesson_4", label: "Урок 4" },
] as const;

function getLessonLabel(lessonNumber: number | null) {
  if (!lessonNumber) return "Не выбрано";
  return (
    growthLessons.find((lesson) => lesson.number === lessonNumber)?.label ||
    "Не выбрано"
  );
}

function getNextLessonNumber(lastLessonNumber: number | null) {
  if (!lastLessonNumber) return null;
  return lastLessonNumber === 4 ? 1 : lastLessonNumber + 1;
}

function isGrowthEnrolled(person: Person) {
  return (
    Number(person.path_growth || 0) > 0 ||
    person.lesson_1 ||
    person.lesson_2 ||
    person.lesson_3 ||
    person.lesson_4 ||
    person.full_course
  );
}

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
  toggleGrowthEnrolled,
}: {
  people: Person[];
  quickToggleLesson: (person: any, lesson: LessonKey) => void;
  quickToggleBaptized: (person: any) => void;
  toggleGrowthEnrolled: (person: any) => void;
}) {
  const [lastSundayLesson, setLastSundayLesson] = useState<number | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [personSearch, setPersonSearch] = useState("");

  const enrolledGrowthPeople = people.filter(
    (person) => !person.archived && isGrowthEnrolled(person)
  );
  const activeGrowthPeople = enrolledGrowthPeople.filter((p) => !p.full_course);
  const completedGrowthPeople = enrolledGrowthPeople.filter((p) => p.full_course);
  const searchValue = personSearch.trim().toLowerCase();
  const searchMatches = searchValue
    ? people
        .filter(
          (person) =>
            !person.archived &&
            !isGrowthEnrolled(person) &&
            person.full_name.toLowerCase().includes(searchValue)
        )
        .slice(0, 8)
    : [];
  const nextSundayLesson = getNextLessonNumber(lastSundayLesson);

  useEffect(() => {
    let mounted = true;

    async function loadGrowthSchedule() {
      const { data, error } = await supabase
        .from("growth_lesson_cycle")
        .select("last_lesson_number")
        .eq("id", true)
        .maybeSingle();

      if (!mounted) return;

      setScheduleLoading(false);

      if (error) {
        setScheduleError(
          "Не удалось загрузить расписание уроков. Проверь, что миграция Supabase применена."
        );
        return;
      }

      setLastSundayLesson(data?.last_lesson_number ?? null);
    }

    loadGrowthSchedule();

    return () => {
      mounted = false;
    };
  }, []);

  async function updateLastSundayLesson(lessonNumber: number) {
    setScheduleSaving(true);
    setScheduleError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("growth_lesson_cycle")
      .upsert(
        {
          id: true,
          last_lesson_number: lessonNumber,
          updated_at: new Date().toISOString(),
          updated_by: user?.id ?? null,
        },
        { onConflict: "id" }
      )
      .select("last_lesson_number")
      .single();

    setScheduleSaving(false);

    if (error) {
      setScheduleError("Не удалось сохранить урок: " + error.message);
      return;
    }

    setLastSundayLesson(data?.last_lesson_number ?? lessonNumber);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-[40px]">Путь роста</h1>
        <p className="mt-1 text-slate-500">
          Добавляйте тех, кто начал ходить на уроки, и отмечайте прогресс
        </p>
      </div>

      <div className="rounded-[28px] border border-indigo-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Уроки для воскресенья
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Выберите урок, который прошел в последнее воскресенье. Следующий урок
              считается автоматически по кругу из четырёх уроков.
            </p>
          </div>

          {scheduleSaving && (
            <div className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
              Сохраняем...
            </div>
          )}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-medium text-slate-500">
              Прошлое воскресенье
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {scheduleLoading ? "Загрузка..." : getLessonLabel(lastSundayLesson)}
            </div>
          </div>

          <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-4">
            <div className="text-sm font-medium text-indigo-700">
              Следующее воскресенье
            </div>
            <div className="mt-2 text-2xl font-bold text-indigo-900">
              {scheduleLoading ? "Загрузка..." : getLessonLabel(nextSundayLesson)}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {growthLessons.map((lesson) => {
            const active = lastSundayLesson === lesson.number;

            return (
              <button
                key={lesson.key}
                onClick={() => updateLastSundayLesson(lesson.number)}
                disabled={scheduleSaving}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  active
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {lesson.label}
              </button>
            );
          })}
        </div>

        {scheduleError && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {scheduleError}
          </div>
        )}
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Добавить человека
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              В списке пути роста будут только люди, которых вы сюда добавили.
            </p>
          </div>

          <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
            {enrolledGrowthPeople.length} в пути роста
          </div>
        </div>

        <input
          value={personSearch}
          onChange={(event) => setPersonSearch(event.target.value)}
          placeholder="Найти человека по имени..."
          className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
        />

        <div className="mt-3 space-y-2">
          {!searchValue ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
              Начните вводить имя, чтобы добавить человека в путь роста.
            </div>
          ) : searchMatches.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
              Никого не нашли или человек уже добавлен.
            </div>
          ) : (
            searchMatches.map((person) => (
              <div
                key={person.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">
                    {person.full_name}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {person.mentor_name || "—"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    toggleGrowthEnrolled(person);
                    setPersonSearch("");
                  }}
                  className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Добавить в ПР
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="hidden grid-cols-[2fr_0.8fr_0.8fr_0.8fr_0.8fr_1.1fr_1fr_1fr] border-b border-slate-100 bg-slate-50/70 px-6 py-4 text-sm font-semibold uppercase tracking-wide text-slate-500 xl:grid">
          <div>Имя</div>
          <div>Урок 1</div>
          <div>Урок 2</div>
          <div>Урок 3</div>
          <div>Урок 4</div>
          <div>Курс</div>
          <div>Крещение</div>
          <div>Действия</div>
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
                className="grid grid-cols-[2fr_0.8fr_0.8fr_0.8fr_0.8fr_1.1fr_1fr_1fr] items-center px-6 py-5"
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

                <button
                  type="button"
                  onClick={() => toggleGrowthEnrolled(person)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-500 hover:bg-slate-50"
                >
                  Убрать
                </button>
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

                <button
                  type="button"
                  onClick={() => toggleGrowthEnrolled(person)}
                  className="mt-3 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50"
                >
                  Убрать из пути роста
                </button>
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
                className="grid grid-cols-[2fr_2fr_1fr_1fr] items-center px-6 py-4"
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
                <button
                  type="button"
                  onClick={() => toggleGrowthEnrolled(person)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-500 hover:bg-slate-50"
                >
                  Убрать
                </button>
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

                <button
                  type="button"
                  onClick={() => toggleGrowthEnrolled(person)}
                  className="mt-3 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50"
                >
                  Убрать из пути роста
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
