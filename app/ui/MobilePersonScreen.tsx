"use client";

import React from "react";

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
  baptized: boolean;
  last_meeting_date: string | null;
  next_step: string | null;
  comment: string | null;
  lesson_1: boolean;
  lesson_2: boolean;
  lesson_3: boolean;
  lesson_4: boolean;
  full_course: boolean;
};

type EditForm = {
  full_name: string;
  contact: string;
  mentor_name: string;
  level: string;
  source: string;
  service_team: string;
  home_group: string;
  last_meeting_date: string;
  next_step: string;
  comment: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
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
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
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

export default function MobilePersonScreen({
  selectedPerson,
  mobileDetailOpen,
  setMobileDetailOpen,
  editing,
  setEditing,
  editForm,
  setEditForm,
  saving,
  handleSaveEdit,
  levelBadge,
  levelLabels,
  formatMeetingDate,
  getDaysAgo,
  showMeetingPicker,
  setShowMeetingPicker,
  handleMeetingToday,
  handleMeetingYesterday,
  customMeetingDate,
  setCustomMeetingDate,
  handleCustomMeetingDate,
  startEdit,
  handleArchivePerson,
  handleToggleBaptized,
  toggleLesson,
}: {
  selectedPerson: Person | null;
  mobileDetailOpen: boolean;
  setMobileDetailOpen: (value: boolean) => void;
  editing: boolean;
  setEditing: (value: boolean) => void;
  editForm: EditForm;
  setEditForm: (value: EditForm) => void;
  saving: boolean;
  handleSaveEdit: (e: React.FormEvent) => void;
  levelBadge: Record<string, string>;
  levelLabels: Record<string, string>;
  formatMeetingDate: (value: string | null) => string;
  getDaysAgo: (value: string | null) => string | null;
  showMeetingPicker: boolean;
  setShowMeetingPicker: (value: boolean | ((prev: boolean) => boolean)) => void;
  handleMeetingToday: () => void;
  handleMeetingYesterday: () => void;
  customMeetingDate: string;
  setCustomMeetingDate: (value: string) => void;
  handleCustomMeetingDate: () => void;
startEdit: (person: any) => void;
  handleArchivePerson: () => void;
  handleToggleBaptized: () => void;
  toggleLesson: (lesson: "lesson_1" | "lesson_2" | "lesson_3" | "lesson_4") => void;
}) {
  if (!selectedPerson || !mobileDetailOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#f6f7fb] xl:hidden">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <button
          onClick={() => {
            setMobileDetailOpen(false);
            setEditing(false);
            setShowMeetingPicker(false);
          }}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium"
        >
          ← Назад
        </button>

        <div className="max-w-[180px] truncate text-sm font-semibold text-slate-900">
          {selectedPerson.full_name}
        </div>

        <div className="w-[72px]" />
      </div>

      <div className="h-[calc(100vh-61px)] overflow-y-auto p-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <div className="text-[24px] font-bold leading-tight">
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

              <div className="flex flex-col gap-3">
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
                <div className="break-words text-[15px] font-medium">
                  {selectedPerson.next_step || "—"}
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 text-sm text-slate-500">Комментарий</div>
                <div className="break-words text-[15px] text-slate-800">
                  {selectedPerson.comment || "—"}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={() => setShowMeetingPicker((prev) => !prev)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-medium hover:bg-slate-50"
                >
                  Добавить встречу
                </button>

                {showMeetingPicker && (
                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={handleMeetingToday}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-100"
                      >
                        Сегодня
                      </button>

                      <button
                        onClick={handleMeetingYesterday}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-100"
                      >
                        Вчера
                      </button>
                    </div>

                    <div className="flex flex-col gap-2">
                      <input
                        type="date"
                        value={customMeetingDate}
                        onChange={(e) => setCustomMeetingDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
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
      </div>
    </div>
  );
}