"use client";

import React, { useState } from "react";
import GrowthSection from "./GrowthSection";
import { supabase } from "../../lib/supabase";
import MobilePersonScreen from "./MobilePersonScreen";

type Person = {
  id: number;
  full_name: string;
  contact: string | null;
  gender: string | null;
  mentor_name: string | null;
  level: string;
  source: string | null;
  service_team: string | null;
  home_group: string | null;
  accepted_jesus: boolean;
  baptized: boolean;
  last_meeting_date: string | null;
  next_step: string | null;
  comment: string | null;
  archived: boolean;
  archive_reason: string | null;
  path_growth?: number;
  lesson_1: boolean;
  lesson_2: boolean;
  lesson_3: boolean;
  lesson_4: boolean;
  full_course: boolean;
};

const levelLabels: Record<string, string> = {
  local: "Местная",
  visiting: "Посещающая",
  church: "Церковная",
  committed: "Посвящённая",
  core: "Ядро",
};

const levelOrder: Record<string, number> = {
  local: 1,
  visiting: 2,
  church: 3,
  committed: 4,
  core: 5,
};

const levelBadge: Record<string, string> = {
  local: "bg-slate-100 text-slate-700 border border-slate-200 shadow-sm",
  visiting: "bg-emerald-100/70 text-emerald-700 border border-emerald-200 shadow-sm",
  church: "bg-blue-100/70 text-blue-700 border border-blue-200 shadow-sm",
  committed: "bg-orange-100/70 text-orange-700 border border-orange-200 shadow-sm",
  core: "bg-rose-100/70 text-rose-700 border border-rose-200 shadow-sm",
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatMeetingDate(dateString: string | null) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getDaysAgo(dateString: string | null) {
  if (!dateString) return null;

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - date.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "в будущем";
  if (diffDays === 0) return "сегодня";
  if (diffDays === 1) return "1 день назад";
  if (diffDays < 5) return `${diffDays} дня назад`;
  return `${diffDays} дней назад`;
}

export default function ClientHome({
  initialPeople,
  profile,
  session,
}: {
  initialPeople: Person[];
  profile: any;
  session: any;
}) {
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [activePage, setActivePage] = useState("people");
  const [selectedId, setSelectedId] = useState<number>(initialPeople[0]?.id || 0);
  const [search, setSearch] = useState("");
  const [mentorFilter, setMentorFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [archiveFilter, setArchiveFilter] = useState("active");
  const [baptizedFilter, setBaptizedFilter] = useState("all");
  const [growthFilter, setGrowthFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("default");

  const [showAddForm, setShowAddForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showMeetingPicker, setShowMeetingPicker] = useState(false);
  const [customMeetingDate, setCustomMeetingDate] = useState("");
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);


  const [form, setForm] = useState({
    full_name: "",
    contact: "",
    mentor_name: profile?.role === "mentor" ? profile?.mentor_name || "" : "",
    level: "local",
    source: "",
    service_team: "",
    home_group: "",
    last_meeting_date: "",
    next_step: "",
    comment: "",
  });

  const [editForm, setEditForm] = useState({
    full_name: "",
    contact: "",
    mentor_name: "",
    level: "local",
    source: "",
    service_team: "",
    home_group: "",
    last_meeting_date: "",
    next_step: "",
    comment: "",
  });

  const activePeople = people
    .filter((p) => {
      const byArchive =
        archiveFilter === "all"
          ? true
          : archiveFilter === "active"
          ? !p.archived
          : p.archived;

      const byMentor = mentorFilter === "all" ? true : p.mentor_name === mentorFilter;
      const byLevel = levelFilter === "all" ? true : p.level === levelFilter;

      const byBaptized =
        baptizedFilter === "all"
          ? true
          : baptizedFilter === "yes"
          ? p.baptized
          : !p.baptized;

      const startedGrowth = p.lesson_1 || p.lesson_2 || p.lesson_3 || p.lesson_4;

      const byGrowth =
        growthFilter === "all"
          ? true
          : growthFilter === "started"
          ? startedGrowth
          : growthFilter === "completed"
          ? p.full_course
          : !startedGrowth;

      const bySearch = p.full_name.toLowerCase().includes(search.toLowerCase());

      return byArchive && byMentor && byLevel && byBaptized && byGrowth && bySearch;
    })
    .sort((a, b) => {
      if (sortOrder === "level_asc") {
        return (levelOrder[a.level] || 999) - (levelOrder[b.level] || 999);
      }
      if (sortOrder === "level_desc") {
        return (levelOrder[b.level] || 999) - (levelOrder[a.level] || 999);
      }
      return 0;
    });

  const archivedPeople = people.filter((p) => p.archived);

  const selectedPerson =
    activePeople.find((p) => p.id === selectedId) ||
    people.find((p) => p.id === selectedId) ||
    activePeople[0] ||
    null;

  const stats = {
    total: people.filter((p) => !p.archived).length,
    growth: people.filter((p) => !p.archived && (p.lesson_1 || p.lesson_2 || p.lesson_3 || p.lesson_4)).length,
    mentors: new Set(people.map((p) => p.mentor_name).filter(Boolean)).size,
    baptized: people.filter((p) => p.baptized && !p.archived).length,
  };

  const levelStats = {
    local: people.filter((p) => !p.archived && p.level === "local").length,
    visiting: people.filter((p) => !p.archived && p.level === "visiting").length,
    church: people.filter((p) => !p.archived && p.level === "church").length,
    committed: people.filter((p) => !p.archived && p.level === "committed").length,
    core: people.filter((p) => !p.archived && p.level === "core").length,
  };

  const readyForBaptism = people.filter((p) => !p.archived && p.full_course && !p.baptized);
  const completedGrowth = people.filter((p) => !p.archived && p.full_course);
  const newPeople = people.filter((p) => !p.archived && (p.level === "local" || p.level === "visiting"));
  const noMeetingLong = people.filter((p) => !p.archived && !p.last_meeting_date);

  const mentorOptions = Array.from(
    new Set(people.map((p) => p.mentor_name).filter(Boolean))
  ) as string[];

  function startEdit(person: Person) {
    setEditForm({
      full_name: person.full_name || "",
      contact: person.contact || "",
      mentor_name: person.mentor_name || "",
      level: person.level || "local",
      source: person.source || "",
      service_team: person.service_team || "",
      home_group: person.home_group || "",
      last_meeting_date: person.last_meeting_date || "",
      next_step: person.next_step || "",
      comment: person.comment || "",
    });
    setEditing(true);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPerson) return;

    setSaving(true);

    const { data, error } = await supabase
      .from("people")
      .update({
        full_name: editForm.full_name,
        contact: editForm.contact || null,
        mentor_name: editForm.mentor_name || null,
        level: editForm.level,
        source: editForm.source || null,
        service_team: editForm.service_team || null,
        home_group: editForm.home_group || null,
        last_meeting_date: editForm.last_meeting_date || null,
        next_step: editForm.next_step || null,
        comment: editForm.comment || null,
      })
      .eq("id", selectedPerson.id)
      .select()
      .single();

    setSaving(false);

    if (error) {
      alert("Ошибка при сохранении: " + error.message);
      return;
    }

    if (data) {
      setPeople((prev) => prev.map((p) => (p.id === data.id ? data : p)));
      setEditing(false);
    }
  }

  async function toggleLesson(lesson: "lesson_1" | "lesson_2" | "lesson_3" | "lesson_4") {
    if (!selectedPerson) return;

    const updatedLessons = {
      lesson_1: lesson === "lesson_1" ? !selectedPerson.lesson_1 : selectedPerson.lesson_1,
      lesson_2: lesson === "lesson_2" ? !selectedPerson.lesson_2 : selectedPerson.lesson_2,
      lesson_3: lesson === "lesson_3" ? !selectedPerson.lesson_3 : selectedPerson.lesson_3,
      lesson_4: lesson === "lesson_4" ? !selectedPerson.lesson_4 : selectedPerson.lesson_4,
    };

    const full_course =
      updatedLessons.lesson_1 &&
      updatedLessons.lesson_2 &&
      updatedLessons.lesson_3 &&
      updatedLessons.lesson_4;

    const { data, error } = await supabase
      .from("people")
      .update({ ...updatedLessons, full_course })
      .eq("id", selectedPerson.id)
      .select()
      .single();

    if (error) {
      alert("Ошибка обновления урока: " + error.message);
      return;
    }

    if (data) {
      setPeople((prev) => prev.map((p) => (p.id === data.id ? data : p)));
    }
  }

  async function quickToggleLesson(
    person: Person,
    lesson: "lesson_1" | "lesson_2" | "lesson_3" | "lesson_4"
  ) {
    const updatedLessons = {
      lesson_1: lesson === "lesson_1" ? !person.lesson_1 : person.lesson_1,
      lesson_2: lesson === "lesson_2" ? !person.lesson_2 : person.lesson_2,
      lesson_3: lesson === "lesson_3" ? !person.lesson_3 : person.lesson_3,
      lesson_4: lesson === "lesson_4" ? !person.lesson_4 : person.lesson_4,
    };

    const full_course =
      updatedLessons.lesson_1 &&
      updatedLessons.lesson_2 &&
      updatedLessons.lesson_3 &&
      updatedLessons.lesson_4;

    const { data, error } = await supabase
      .from("people")
      .update({ ...updatedLessons, full_course })
      .eq("id", person.id)
      .select()
      .single();

    if (error) {
      alert("Ошибка обновления урока: " + error.message);
      return;
    }

    if (data) {
      setPeople((prev) => prev.map((p) => (p.id === data.id ? data : p)));
    }
  }

  async function quickToggleBaptized(person: Person) {
    const { data, error } = await supabase
      .from("people")
      .update({ baptized: !person.baptized })
      .eq("id", person.id)
      .select()
      .single();

    if (error) {
      alert("Ошибка обновления крещения: " + error.message);
      return;
    }

    if (data) {
      setPeople((prev) => prev.map((p) => (p.id === data.id ? data : p)));
    }
  }

  async function handleToggleBaptized() {
    if (!selectedPerson) return;

    const { data, error } = await supabase
      .from("people")
      .update({ baptized: !selectedPerson.baptized })
      .eq("id", selectedPerson.id)
      .select()
      .single();

    if (error) {
      alert("Ошибка обновления крещения: " + error.message);
      return;
    }

    if (data) {
      setPeople((prev) => prev.map((p) => (p.id === data.id ? data : p)));
    }
  }

  async function saveMeetingDate(dateValue: string) {
    if (!selectedPerson) return;

    const { data, error } = await supabase
      .from("people")
      .update({ last_meeting_date: dateValue })
      .eq("id", selectedPerson.id)
      .select()
      .single();

    if (error) {
      alert("Ошибка обновления встречи: " + error.message);
      return;
    }

    if (data) {
      setPeople((prev) => prev.map((p) => (p.id === data.id ? data : p)));
      setShowMeetingPicker(false);
      setCustomMeetingDate("");
    }
  }

  async function handleMeetingToday() {
    const today = new Date().toISOString().slice(0, 10);
    await saveMeetingDate(today);
  }

  async function handleMeetingYesterday() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await saveMeetingDate(yesterday.toISOString().slice(0, 10));
  }

  async function handleCustomMeetingDate() {
    if (!customMeetingDate) {
      alert("Выбери дату");
      return;
    }
    await saveMeetingDate(customMeetingDate);
  }

  async function handleArchivePerson() {
    if (!selectedPerson) return;

    const reason = prompt("Причина архивации:", "Перестал ходить");
    if (reason === null) return;

    const { data, error } = await supabase
      .from("people")
      .update({
        archived: true,
        archive_reason: reason || "Без причины",
      })
      .eq("id", selectedPerson.id)
      .select()
      .single();

    if (error) {
      alert("Ошибка архивации: " + error.message);
      return;
    }

    if (data) {
      setPeople((prev) => prev.map((p) => (p.id === data.id ? data : p)));
      setSelectedId(0);
    }
  }

  async function handleRestorePerson(person: Person) {
    const { data, error } = await supabase
      .from("people")
      .update({
        archived: false,
        archive_reason: null,
      })
      .eq("id", person.id)
      .select()
      .single();

    if (error) {
      alert("Ошибка при возврате из архива: " + error.message);
      return;
    }

    if (data) {
      setPeople((prev) => prev.map((p) => (p.id === data.id ? data : p)));
    }
  }

  async function handleAddPerson(e: React.FormEvent) {
    e.preventDefault();

    if (!form.full_name.trim()) {
      alert("Введите имя");
      return;
    }

    setSaving(true);

    const mentorNameToSave =
      profile?.role === "mentor" ? profile?.mentor_name || form.mentor_name : form.mentor_name;

    const { data, error } = await supabase
      .from("people")
      .insert([
        {
          full_name: form.full_name,
          contact: form.contact || null,
          mentor_name: mentorNameToSave || null,
          level: form.level,
          source: form.source || null,
          service_team: form.service_team || null,
          home_group: form.home_group || null,
          last_meeting_date: form.last_meeting_date || null,
          next_step: form.next_step || null,
          comment: form.comment || null,
          accepted_jesus: false,
          baptized: false,
          archived: false,
          path_growth: 0,
          lesson_1: false,
          lesson_2: false,
          lesson_3: false,
          lesson_4: false,
          full_course: false,
        },
      ])
      .select()
      .single();

    setSaving(false);

    if (error) {
      alert("Ошибка при добавлении: " + error.message);
      return;
    }

    if (data) {
      setPeople((prev) => [data, ...prev]);
      setSelectedId(data.id);
      setShowAddForm(false);
      setForm({
        full_name: "",
        contact: "",
        mentor_name: profile?.role === "mentor" ? profile?.mentor_name || "" : "",
        level: "local",
        source: "",
        service_team: "",
        home_group: "",
        last_meeting_date: "",
        next_step: "",
        comment: "",
      });
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6 sm:py-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-2xl font-bold tracking-tight sm:text-3xl">HarvestYouth</div>
            <div className="mt-1 text-sm text-slate-500">Учёт людей</div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm">
              <div className="font-medium break-all">{session?.user?.email || "—"}</div>
              <div className="text-slate-500">
                {profile?.role || "—"} • {profile?.mentor_name || "—"}
              </div>
            </div>

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.reload();
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-50"
            >
              Выйти
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm lg:block">
            <nav className="space-y-2">
              <SidebarButton active={activePage === "dashboard"} onClick={() => setActivePage("dashboard")}>
                Обзор
              </SidebarButton>
              <SidebarButton active={activePage === "people"} onClick={() => setActivePage("people")}>
                Люди
              </SidebarButton>
              <SidebarButton active={activePage === "growth"} onClick={() => setActivePage("growth")}>
                Путь роста
              </SidebarButton>
              <SidebarButton active={activePage === "archive"} onClick={() => setActivePage("archive")}>
                Архив
              </SidebarButton>
              <SidebarButton active={activePage === "users"} onClick={() => setActivePage("users")}>
                Пользователи
              </SidebarButton>
            </nav>
          </aside>

          <section className="min-w-0">
            <div className="mb-4 lg:hidden">
              <div className="flex gap-2 overflow-x-auto rounded-[24px] border border-slate-200 bg-white p-2 shadow-sm">
                <SidebarButton active={activePage === "dashboard"} onClick={() => setActivePage("dashboard")}>
                  Обзор
                </SidebarButton>
                <SidebarButton active={activePage === "people"} onClick={() => setActivePage("people")}>
                  Люди
                </SidebarButton>
                <SidebarButton active={activePage === "growth"} onClick={() => setActivePage("growth")}>
                  ПР
                </SidebarButton>
                <SidebarButton active={activePage === "archive"} onClick={() => setActivePage("archive")}>
                  Архив
                </SidebarButton>
                <SidebarButton active={activePage === "users"} onClick={() => setActivePage("users")}>
                  Профиль
                </SidebarButton>
              </div>
            </div>

       {activePage === "dashboard" && (
  <div className="space-y-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-[40px]">
          Добро пожаловать, {profile?.mentor_name || session?.user?.email || "Пользователь"}
        </h1>
        <p className="mt-2 text-lg text-slate-500">Обзор ваших подопечных</p>
      </div>

      <button
        onClick={() => {
          setActivePage("people");
          setShowAddForm(true);
        }}
        className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
      >
        + Добавить человека
      </button>
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <OverviewStatCard
        icon="👥"
        title="Всего подопечных"
        value={stats.total}
        iconBg="bg-violet-100"
      />
      <OverviewStatCard
        icon="💚"
        title="Новичков"
        value={newPeople.length}
        iconBg="bg-emerald-100"
      />
      <OverviewStatCard
        icon="⭐"
        title="Служителей"
        value={people.filter((p) => !p.archived && (p.level === "committed" || p.level === "core")).length}
        iconBg="bg-violet-100"
      />
      <OverviewStatCard
        icon="📈"
        title="За последний месяц"
        value={
          people.filter((p) => {
            if (p.archived || !p.last_meeting_date) return false;
            const date = new Date(p.last_meeting_date);
            if (isNaN(date.getTime())) return false;
            const now = new Date();
            const diff = now.getTime() - date.getTime();
            return diff <= 30 * 24 * 60 * 60 * 1000;
          }).length
        }
        iconBg="bg-amber-100"
      />
    </div>

    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold tracking-tight">По уровням посвящения</h2>

      <div className="mt-6 space-y-5">
        <LevelBar
          label="Местная"
          value={levelStats.local}
          total={Math.max(stats.total, 1)}
          badgeClass={levelBadge.local}
        />
        <LevelBar
          label="Посещающая"
          value={levelStats.visiting}
          total={Math.max(stats.total, 1)}
          badgeClass={levelBadge.visiting}
        />
        <LevelBar
          label="Церковная"
          value={levelStats.church}
          total={Math.max(stats.total, 1)}
          badgeClass={levelBadge.church}
        />
        <LevelBar
          label="Посвящённая"
          value={levelStats.committed}
          total={Math.max(stats.total, 1)}
          badgeClass={levelBadge.committed}
        />
        <LevelBar
          label="Ядро"
          value={levelStats.core}
          total={Math.max(stats.total, 1)}
          badgeClass={levelBadge.core}
        />
      </div>
    </div>
  </div>
)}

            {activePage === "people" && (
              <div className="space-y-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight sm:text-[40px]">Люди</h1>
                    <p className="mt-1 text-slate-500">{activePeople.length} человек</p>
                  </div>

                  <button
                    onClick={() => setShowAddForm((prev) => !prev)}
                    className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                  >
                    {showAddForm ? "Закрыть" : "+ Добавить"}
                  </button>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Поиск по имени..."
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                    />

                    <select
                      value={mentorFilter}
                      onChange={(e) => setMentorFilter(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                    >
                      <option value="all">Все наставники</option>
                      {mentorOptions.map((mentor) => (
                        <option key={mentor} value={mentor}>
                          {mentor}
                        </option>
                      ))}
                    </select>

                    <select
                      value={levelFilter}
                      onChange={(e) => setLevelFilter(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                    >
                      <option value="all">Все уровни</option>
                      <option value="local">Местная</option>
                      <option value="visiting">Посещающая</option>
                      <option value="church">Церковная</option>
                      <option value="committed">Посвящённая</option>
                      <option value="core">Ядро</option>
                    </select>

                    <select
                      value={archiveFilter}
                      onChange={(e) => setArchiveFilter(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                    >
                      <option value="active">Активные</option>
                      <option value="archived">Архив</option>
                      <option value="all">Все</option>
                    </select>

                    <select
                      value={baptizedFilter}
                      onChange={(e) => setBaptizedFilter(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                    >
                      <option value="all">Крещение</option>
                      <option value="yes">Крещён</option>
                      <option value="no">Не крещён</option>
                    </select>

                    <select
                      value={growthFilter}
                      onChange={(e) => setGrowthFilter(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                    >
                      <option value="all">Путь роста</option>
                      <option value="started">Есть уроки</option>
                      <option value="completed">Закончили ПР</option>
                      <option value="not_started">Не начинали</option>
                    </select>

                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none xl:col-span-1 md:col-span-2"
                    >
                      <option value="default">Без сортировки</option>
                      <option value="level_asc">От местной к ядру</option>
                      <option value="level_desc">От ядра к местной</option>
                    </select>
                  </div>
                </div>

                {showAddForm && (
                  <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 text-lg font-semibold">Новый человек</div>

                    <form onSubmit={handleAddPerson} className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <Input value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} placeholder="Имя" />
                      <Input value={form.contact} onChange={(v) => setForm({ ...form, contact: v })} placeholder="Контакт" />
                      <Input
                        value={form.mentor_name}
                        onChange={(v) => setForm({ ...form, mentor_name: v })}
                        placeholder="Наставник"
                        disabled={profile?.role === "mentor"}
                      />
                      <SelectField
                        value={form.level}
                        onChange={(v) => setForm({ ...form, level: v })}
                        options={[
                          ["local", "Местная"],
                          ["visiting", "Посещающая"],
                          ["church", "Церковная"],
                          ["committed", "Посвящённая"],
                          ["core", "Ядро"],
                        ]}
                      />
                      <Input value={form.source} onChange={(v) => setForm({ ...form, source: v })} placeholder="Источник" />
                      <Input value={form.service_team} onChange={(v) => setForm({ ...form, service_team: v })} placeholder="Служение" />
                      <Input value={form.home_group} onChange={(v) => setForm({ ...form, home_group: v })} placeholder="Домашка" />
                      <Input value={form.last_meeting_date} onChange={(v) => setForm({ ...form, last_meeting_date: v })} placeholder="Последняя встреча" />
                      <Input value={form.next_step} onChange={(v) => setForm({ ...form, next_step: v })} placeholder="Следующий шаг" />
                      <textarea
                        value={form.comment}
                        onChange={(e) => setForm({ ...form, comment: e.target.value })}
                        placeholder="Комментарий"
                        rows={4}
                        className="rounded-2xl border border-slate-200 px-4 py-3 outline-none md:col-span-2"
                      />

                      <div className="flex justify-end md:col-span-2">
                        <button
                          type="submit"
                          disabled={saving}
                          className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          {saving ? "Сохраняем..." : "Сохранить"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="flex flex-col gap-6 xl:grid xl:grid-cols-[minmax(0,1fr)_420px]">
                  <div className="hidden overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm xl:block">
                    <div className="grid grid-cols-[2.2fr_1.6fr_1.4fr_1.2fr_1fr] border-b border-slate-100 bg-slate-50/70 px-6 py-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                      <div>Имя</div>
                      <div>Наставник</div>
                      <div>Уровень</div>
                      <div>Встреча</div>
                      <div>Крещение</div>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {activePeople.map((person) => (
                        <button
                          key={person.id}
                         onClick={() => {
  setSelectedId(person.id);
  setEditing(false);
  setMobileDetailOpen(true);
}}
                          className={cx(
                            "grid w-full grid-cols-[2.2fr_1.6fr_1.4fr_1.2fr_1fr] items-center px-6 py-5 text-left transition",
                            selectedPerson?.id === person.id
                              ? "bg-indigo-50 border-l-4 border-indigo-500"
                              : "hover:bg-slate-50"
                          )}
                        >
                          <div className="min-w-0">
                            <div className="truncate text-[16px] font-semibold text-slate-900">
                              {person.full_name}
                            </div>
                          </div>

                          <div className="text-[15px] text-slate-600">{person.mentor_name || "—"}</div>

                          <div>
                            <span
                              className={cx(
                                "inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
                                levelBadge[person.level] || "bg-slate-100 text-slate-700"
                              )}
                            >
                              {levelLabels[person.level] || person.level}
                            </span>
                          </div>

                          <div>
                            {person.last_meeting_date ? (
                              <div className="leading-tight">
                                <div className="text-[15px] font-medium text-emerald-600">
                                  {formatMeetingDate(person.last_meeting_date)}
                                </div>
                                <div className="mt-1 text-xs text-slate-400">
                                  {getDaysAgo(person.last_meeting_date)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[15px] font-medium text-rose-500">нет встречи</span>
                            )}
                          </div>

                          <div>
                            {person.baptized ? (
                              <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 ring-1 ring-emerald-100">
                                Крещён
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </div>
                        </button>
                      ))}

                      {activePeople.length === 0 && (
                        <div className="px-6 py-12 text-center text-slate-500">Ничего не найдено</div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 xl:hidden">
                    {activePeople.map((person) => (
                      <button
                        key={person.id}
                        onClick={() => {
  setSelectedId(person.id);
  setEditing(false);
  setMobileDetailOpen(true);
}}
                        className={cx(
                          "w-full rounded-[24px] border border-slate-200 bg-white p-4 text-left shadow-sm transition",
                          selectedPerson?.id === person.id ? "ring-2 ring-indigo-500" : "hover:bg-slate-50"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-[18px] font-semibold text-slate-900">
                              {person.full_name}
                            </div>
                            <div className="mt-1 text-sm text-slate-500">{person.mentor_name || "—"}</div>
                          </div>

                          <span
                            className={cx(
                              "inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
                              levelBadge[person.level] || "bg-slate-100 text-slate-700"
                            )}
                          >
                            {levelLabels[person.level] || person.level}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-sm">
                          <div>
                            {person.last_meeting_date ? (
                              <span className="text-emerald-600">
                                {formatMeetingDate(person.last_meeting_date)}
                              </span>
                            ) : (
                              <span className="text-rose-500">нет встречи</span>
                            )}
                          </div>

                          <div>
                            {person.baptized ? (
                              <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                                Крещён
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}

                    {activePeople.length === 0 && (
                      <div className="rounded-[24px] border border-slate-200 bg-white p-6 text-center text-slate-500 shadow-sm">
                        Ничего не найдено
                      </div>
                    )}
                  </div>

                  <MobilePersonScreen
  selectedPerson={selectedPerson}
  mobileDetailOpen={mobileDetailOpen}
  setMobileDetailOpen={setMobileDetailOpen}
  editing={editing}
  setEditing={setEditing}
  editForm={editForm}
  setEditForm={setEditForm}
  saving={saving}
  handleSaveEdit={handleSaveEdit}
  levelBadge={levelBadge}
  levelLabels={levelLabels}
  formatMeetingDate={formatMeetingDate}
  getDaysAgo={getDaysAgo}
  showMeetingPicker={showMeetingPicker}
  setShowMeetingPicker={setShowMeetingPicker}
  handleMeetingToday={handleMeetingToday}
  handleMeetingYesterday={handleMeetingYesterday}
  customMeetingDate={customMeetingDate}
  setCustomMeetingDate={setCustomMeetingDate}
  handleCustomMeetingDate={handleCustomMeetingDate}
  startEdit={startEdit}
  handleArchivePerson={handleArchivePerson}
  handleToggleBaptized={handleToggleBaptized}
  toggleLesson={toggleLesson}
/>

                  {selectedPerson ? (
  <div className="hidden w-full rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 xl:sticky xl:top-6 xl:block">
                      <div className="mb-5">
                        <div className="text-[24px] font-bold leading-tight sm:text-[32px]">
                          {selectedPerson.full_name}
                        </div>

                        <div className="mt-3">
                          <span
                            className={cx(
                              "inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
                              levelBadge[selectedPerson.level] || "bg-slate-100 text-slate-700"
                            )}
                          >
                            {levelLabels[selectedPerson.level] || selectedPerson.level}
                          </span>
                        </div>
                      </div>

                      {editing ? (
                        <form onSubmit={handleSaveEdit} className="space-y-3">
                          <Input value={editForm.full_name} onChange={(v) => setEditForm({ ...editForm, full_name: v })} placeholder="Имя" />
                          <Input value={editForm.contact} onChange={(v) => setEditForm({ ...editForm, contact: v })} placeholder="Контакт" />
                          <Input value={editForm.mentor_name} onChange={(v) => setEditForm({ ...editForm, mentor_name: v })} placeholder="Наставник" />
                          <SelectField
                            value={editForm.level}
                            onChange={(v) => setEditForm({ ...editForm, level: v })}
                            options={[
                              ["local", "Местная"],
                              ["visiting", "Посещающая"],
                              ["church", "Церковная"],
                              ["committed", "Посвящённая"],
                              ["core", "Ядро"],
                            ]}
                          />
                          <Input value={editForm.source} onChange={(v) => setEditForm({ ...editForm, source: v })} placeholder="Источник" />
                          <Input value={editForm.service_team} onChange={(v) => setEditForm({ ...editForm, service_team: v })} placeholder="Служение" />
                          <Input value={editForm.home_group} onChange={(v) => setEditForm({ ...editForm, home_group: v })} placeholder="Домашка" />
                          <Input value={editForm.last_meeting_date} onChange={(v) => setEditForm({ ...editForm, last_meeting_date: v })} placeholder="Последняя встреча" />
                          <Input value={editForm.next_step} onChange={(v) => setEditForm({ ...editForm, next_step: v })} placeholder="Следующий шаг" />
                          <textarea
                            value={editForm.comment}
                            onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                            rows={4}
                            placeholder="Комментарий"
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
                          />

                          <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                              type="submit"
                              disabled={saving}
                              className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                            >
                              {saving ? "Сохраняем..." : "Сохранить"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditing(false)}
                              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold"
                            >
                              Отмена
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 gap-5">
                            <Detail label="Контакт" value={selectedPerson.contact || "—"} />
                            <Detail label="Пол" value={selectedPerson.gender || "—"} />
                            <Detail label="Наставник" value={selectedPerson.mentor_name || "—"} />
                            <Detail label="Источник" value={selectedPerson.source || "—"} />
                            <Detail label="Служение" value={selectedPerson.service_team || "—"} />
                            <Detail label="Домашка" value={selectedPerson.home_group || "—"} />
                            <Detail
                              label="Последняя встреча"
                              value={
                                selectedPerson.last_meeting_date
                                  ? `${formatMeetingDate(selectedPerson.last_meeting_date)} • ${getDaysAgo(selectedPerson.last_meeting_date)}`
                                  : "—"
                              }
                            />
                            <Detail
                              label="Путь роста"
                              value={`${Number(selectedPerson.lesson_1) + Number(selectedPerson.lesson_2) + Number(selectedPerson.lesson_3) + Number(selectedPerson.lesson_4)}/4 уроков`}
                            />
                          </div>

                          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                            <div className="mb-2 text-sm text-slate-500">Следующий шаг</div>
                            <div className="text-[15px] font-medium break-words">
                              {selectedPerson.next_step || "—"}
                            </div>
                          </div>

                          <div className="mt-5">
                            <div className="mb-2 text-sm text-slate-500">Комментарий</div>
                            <div className="text-[15px] text-slate-800 break-words">
                              {selectedPerson.comment || "—"}
                            </div>
                          </div>

                          <div className="mt-6 space-y-3">
                            <div className="space-y-3">
                              <button
                                onClick={() => setShowMeetingPicker((prev) => !prev)}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-medium hover:bg-slate-50"
                              >
                                Добавить встречу
                              </button>

                              {showMeetingPicker && (
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-3">
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      onClick={handleMeetingToday}
                                      className="rounded-xl bg-white px-3 py-2 text-sm font-medium border border-slate-200 hover:bg-slate-100"
                                    >
                                      Сегодня
                                    </button>

                                    <button
                                      onClick={handleMeetingYesterday}
                                      className="rounded-xl bg-white px-3 py-2 text-sm font-medium border border-slate-200 hover:bg-slate-100"
                                    >
                                      Вчера
                                    </button>
                                  </div>

                                  <div className="flex flex-col gap-2 sm:flex-row">
                                    <input
                                      type="date"
                                      value={customMeetingDate}
                                      onChange={(e) => setCustomMeetingDate(e.target.value)}
                                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                                    />
                                    <button
                                      onClick={handleCustomMeetingDate}
                                      className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                    >
                                      Сохранить
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => startEdit(selectedPerson)}
                              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-medium hover:bg-slate-50"
                            >
                              Редактировать
                            </button>

                            <button
                              onClick={handleArchivePerson}
                              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-500 hover:bg-slate-50"
                            >
                              В архив
                            </button>

                            <button
                              onClick={handleToggleBaptized}
                              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-medium hover:bg-slate-50"
                            >
                              {selectedPerson.baptized ? "Снять крещение" : "Отметить крещение"}
                            </button>
                          </div>

                          <div className="mt-6 rounded-2xl border border-slate-200 p-4">
                            <div className="mb-3 text-sm text-slate-500">Путь роста</div>

                            <div className="mb-3 flex flex-wrap gap-2">
                              <LessonToggle active={selectedPerson.lesson_1} onClick={() => toggleLesson("lesson_1")}>
                                Урок 1
                              </LessonToggle>
                              <LessonToggle active={selectedPerson.lesson_2} onClick={() => toggleLesson("lesson_2")}>
                                Урок 2
                              </LessonToggle>
                              <LessonToggle active={selectedPerson.lesson_3} onClick={() => toggleLesson("lesson_3")}>
                                Урок 3
                              </LessonToggle>
                              <LessonToggle active={selectedPerson.lesson_4} onClick={() => toggleLesson("lesson_4")}>
                                Урок 4
                              </LessonToggle>
                            </div>

                            <div className="space-y-2 text-sm text-slate-700">
                              <div>Урок 1: {selectedPerson.lesson_1 ? "✓" : "—"}</div>
                              <div>Урок 2: {selectedPerson.lesson_2 ? "✓" : "—"}</div>
                              <div>Урок 3: {selectedPerson.lesson_3 ? "✓" : "—"}</div>
                              <div>Урок 4: {selectedPerson.lesson_4 ? "✓" : "—"}</div>
                              <div className="font-medium">
                                Полный курс: {selectedPerson.full_course ? "Да" : "Нет"}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-[28px] border border-slate-200 bg-white p-8 text-slate-400 shadow-sm">
                      Выбери человека слева
                    </div>
                  )}
                </div>
              </div>
            )}

            {activePage === "growth" && (
              <GrowthSection
                people={people}
                quickToggleLesson={quickToggleLesson}
                quickToggleBaptized={quickToggleBaptized}
              />
            )}

            {activePage === "archive" && (
              <div className="space-y-5">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight sm:text-[40px]">Архив</h1>
                  <p className="mt-1 text-slate-500">Люди, которые больше не в активном процессе</p>
                </div>

                <div className="grid gap-4">
                  {archivedPeople.map((person) => (
                    <div
                      key={person.id}
                      className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="text-lg font-semibold">{person.full_name}</div>
                          <div className="mt-2 text-sm text-slate-500">
                            Наставник: {person.mentor_name || "—"}
                          </div>
                          <div className="mt-3 text-sm text-slate-700">
                            {person.archive_reason || person.comment || "—"}
                          </div>
                        </div>

                        <button
                          onClick={() => handleRestorePerson(person)}
                          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                        >
                          Вернуть
                        </button>
                      </div>
                    </div>
                  ))}

                  {archivedPeople.length === 0 && (
                    <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
                      Архив пуст
                    </div>
                  )}
                </div>
              </div>
            )}

            {activePage === "users" && (
              <div className="space-y-5">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight sm:text-[40px]">Пользователи</h1>
                  <p className="mt-1 text-slate-500">Роли и доступы системы</p>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                  <div className="text-sm text-slate-500">Текущая роль</div>
                  <div className="mt-2 text-xl font-semibold">{profile?.role || "—"}</div>
                  <div className="mt-1 text-slate-500">Наставник: {profile?.mentor_name || "—"}</div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function SidebarButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "shrink-0 rounded-2xl px-4 py-3 text-left text-sm font-medium transition",
        active ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
      )}
    >
      {children}
    </button>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
}

function LevelStatCard({
  title,
  value,
  badgeClass,
}: {
  title: string;
  value: number;
  badgeClass: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
      <div className={cx("inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide", badgeClass)}>
        {title}
      </div>
      <div className="mt-3 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function DashboardList({
  title,
  items,
  emptyText,
  subtitle,
}: {
  title: string;
  items: Person[];
  emptyText: string;
  subtitle: (person: Person) => string;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="text-sm text-slate-500">{emptyText}</div>
        ) : (
          items.map((person) => (
            <div key={person.id} className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="font-medium">{person.full_name}</div>
              <div className="text-sm text-slate-500">{subtitle(person)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 break-words text-[15px] font-semibold text-slate-900">
        {value}
      </div>
    </div>
  );
}

function LessonToggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "rounded-2xl px-3 py-2 text-sm font-medium transition",
        active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      )}
    >
      {children}
    </button>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none disabled:bg-slate-100"
    />
  );
}

function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[][];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
    >
      {options.map(([val, label]) => (
        <option key={val} value={val}>
          {label}
        </option>
      ))}
    </select>
  );
}

function OverviewStatCard({
  icon,
  title,
  value,
  iconBg,
}: {
  icon: string;
  title: string;
  value: number;
  iconBg: string;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${iconBg}`}>
          {icon}
        </div>

        <div>
          <div className="text-4xl font-bold leading-none">{value}</div>
          <div className="mt-2 text-lg text-slate-500">{title}</div>
        </div>
      </div>
    </div>
  );
}

function LevelBar({
  label,
  value,
  total,
  badgeClass,
}: {
  label: string;
  value: number;
  total: number;
  badgeClass: string;
}) {
  const percent = Math.max(0, Math.min(100, (value / total) * 100));

  return (
    <div className="grid grid-cols-[140px_minmax(0,1fr)_40px] items-center gap-4">
      <div>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold tracking-wide ${badgeClass}`}
        >
          {label}
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="text-right text-2xl text-slate-500">{value}</div>
    </div>
  );
}