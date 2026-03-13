"use client";

import React, { useMemo, useState } from "react";
import { people } from "../data/people";
import {
  Users,
  LayoutDashboard,
  Route,
  Archive,
  Shield,
  Search,
  UserPlus,
  CheckCircle2,
} from "lucide-react";

const levelLabels: Record<string, string> = {
  local: "Местная",
  visiting: "Посещающая",
  church: "Церковная",
  committed: "Посвящённая",
  core: "Ядро",
};

const levelColors: Record<string, string> = {
  local: "bg-slate-100 text-slate-700",
  visiting: "bg-emerald-100 text-emerald-700",
  church: "bg-indigo-100 text-indigo-700",
  committed: "bg-orange-100 text-orange-700",
  core: "bg-rose-100 text-rose-700",
};

export default function Home() {
  const [activePage, setActivePage] = useState("people");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number>(people[0]?.id || 0);

  const activePeople = people.filter((p) => !p.archived);
  const archivedPeople = people.filter((p) => p.archived);

  const filteredPeople = useMemo(() => {
    return activePeople.filter((person) =>
      person.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, activePeople]);

  const selectedPerson =
    filteredPeople.find((p) => p.id === selectedId) || filteredPeople[0];

  const stats = {
    total: activePeople.length,
    growth: activePeople.filter((p) => p.pathGrowth > 0).length,
    mentors: new Set(activePeople.map((p) => p.mentor)).size,
    baptized: activePeople.filter((p) => p.baptized).length,
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-[1500px] gap-6 p-6">
        <aside className="w-72 shrink-0 rounded-3xl border bg-white p-4 shadow-sm">
          <div className="mb-6 flex items-center gap-3 px-2 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-bold text-white">
              ✝
            </div>
            <div>
              <div className="font-bold">Church CRM</div>
              <div className="text-sm text-slate-500">Молодёжка</div>
            </div>
          </div>

          <div className="space-y-2">
            <NavButton
              active={activePage === "dashboard"}
              icon={<LayoutDashboard size={18} />}
              label="Обзор"
              onClick={() => setActivePage("dashboard")}
            />
            <NavButton
              active={activePage === "people"}
              icon={<Users size={18} />}
              label="Подопечные"
              onClick={() => setActivePage("people")}
            />
            <NavButton
              active={activePage === "growth"}
              icon={<Route size={18} />}
              label="Путь роста"
              onClick={() => setActivePage("growth")}
            />
            <NavButton
              active={activePage === "archive"}
              icon={<Archive size={18} />}
              label="Архив"
              onClick={() => setActivePage("archive")}
            />
            <NavButton
              active={activePage === "users"}
              icon={<Shield size={18} />}
              label="Пользователи"
              onClick={() => setActivePage("users")}
            />
          </div>
        </aside>

        <section className="flex-1">
          {activePage === "dashboard" && (
            <div className="space-y-6">
              <h1 className="text-4xl font-bold">Обзор</h1>

              <div className="grid grid-cols-4 gap-4">
                <StatCard title="Всего людей" value={stats.total} />
                <StatCard title="На пути роста" value={stats.growth} />
                <StatCard title="Наставников" value={stats.mentors} />
                <StatCard title="Крещены" value={stats.baptized} />
              </div>
            </div>
          )}

          {activePage === "people" && (
            <div className="grid grid-cols-[1.4fr_0.8fr] gap-6">
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-4xl font-bold">Подопечные</h1>
                    <p className="mt-2 text-slate-500">
                      Список людей и быстрый доступ к карточке
                    </p>
                  </div>

                  <button className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 font-medium text-white">
                    <UserPlus size={18} />
                    Добавить человека
                  </button>
                </div>

                <div className="rounded-3xl border bg-white p-4 shadow-sm">
                  <div className="relative">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Поиск по имени"
                      className="w-full rounded-2xl border border-slate-200 py-3 pl-10 pr-4 outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
                  <div className="border-b bg-slate-50 px-4 py-3 font-semibold">
                    Список людей
                  </div>

                  <div className="divide-y">
                    {filteredPeople.map((person) => (
                      <button
                        key={person.id}
                        onClick={() => setSelectedId(person.id)}
                        className={`flex w-full items-center justify-between px-4 py-4 text-left transition ${
                          selectedPerson?.id === person.id
                            ? "bg-indigo-50"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div>
                          <div className="font-medium">{person.name}</div>
                          <div className="mt-1 text-sm text-slate-500">
                            Наставник: {person.mentor}
                          </div>
                        </div>

                        <div
                          className={`rounded-full px-3 py-1 text-sm font-medium ${
                            levelColors[person.level]
                          }`}
                        >
                          {levelLabels[person.level] || person.level}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                {selectedPerson ? (
                  <div className="space-y-4 rounded-3xl border bg-white p-6 shadow-sm">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedPerson.name}</h2>
                      <p className="mt-1 text-slate-500">
                        Наставник: {selectedPerson.mentor}
                      </p>
                    </div>

                    <InfoRow label="Контакт" value={selectedPerson.contact} />
                    <InfoRow
                      label="Уровень"
                      value={levelLabels[selectedPerson.level] || selectedPerson.level}
                    />
                    <InfoRow label="Источник" value={selectedPerson.source} />
                    <InfoRow label="Служение" value={selectedPerson.service} />
                    <InfoRow label="Домашка" value={selectedPerson.homeGroup} />
                    <InfoRow label="Последняя встреча" value={selectedPerson.lastMeeting} />
                    <InfoRow label="Следующий шаг" value={selectedPerson.nextStep} />
                    <InfoRow
                      label="Путь роста"
                      value={`${selectedPerson.pathGrowth}/4`}
                    />
                    <InfoRow
                      label="Крещение"
                      value={selectedPerson.baptized ? "Да" : "Нет"}
                    />

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="mb-2 text-sm text-slate-500">Комментарий</div>
                      <div className="text-sm">{selectedPerson.comment}</div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border bg-white p-6 shadow-sm">
                    Выбери человека слева
                  </div>
                )}
              </div>
            </div>
          )}

          {activePage === "growth" && (
            <div className="space-y-6">
              <h1 className="text-4xl font-bold">Путь роста</h1>

              <div className="grid gap-4">
                {activePeople
                  .filter((p) => p.pathGrowth > 0)
                  .map((person) => (
                    <div
                      key={person.id}
                      className="flex items-center justify-between rounded-3xl border bg-white p-5 shadow-sm"
                    >
                      <div>
                        <div className="font-semibold">{person.name}</div>
                        <div className="text-sm text-slate-500">
                          Наставник: {person.mentor}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-medium ${
                              person.pathGrowth >= step
                                ? "bg-emerald-500 text-white border-emerald-500"
                                : "bg-slate-50 text-slate-400"
                            }`}
                          >
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activePage === "archive" && (
            <div className="space-y-6">
              <h1 className="text-4xl font-bold">Архив</h1>

              <div className="grid gap-4">
                {archivedPeople.map((person) => (
                  <div
                    key={person.id}
                    className="rounded-3xl border bg-white p-5 shadow-sm"
                  >
                    <div className="font-semibold">{person.name}</div>
                    <div className="mt-1 text-sm text-slate-500">
                      Наставник: {person.mentor}
                    </div>
                    <div className="mt-2 text-sm">{person.comment}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePage === "users" && (
            <div className="space-y-6">
              <h1 className="text-4xl font-bold">Пользователи</h1>
              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                Тут позже будут пасторы, лидеры и роли.
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function NavButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
        active
          ? "bg-indigo-600 text-white"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border px-4 py-3">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}