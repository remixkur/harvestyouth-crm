"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Report = {
  id: string;
  report_date: string;
  group_name: string;
  leader_name: string;
  topic: string | null;
  people_count: number | null;
  location: string | null;
  how_was_it: string | null;
  positives: string | null;
  negatives: string | null;
  improvement_plan: string | null;
  photo_url: string | null;
  created_by: string;
  created_at: string;
};

export default function HomeGroupReportsSection({
  session,
  profile,
}: {
  session: any;
  profile: any;
}) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    report_date: new Date().toISOString().slice(0, 10),
    group_name: "",
    leader_name: profile?.mentor_name || "",
    topic: "",
    people_count: "",
    location: "",
    how_was_it: "",
    positives: "",
    negatives: "",
    improvement_plan: "",
  });

  async function loadReports() {
    setLoading(true);

    const { data, error } = await supabase
      .from("home_group_reports")
      .select("*")
      .order("report_date", { ascending: false });

    setLoading(false);

    if (error) {
      alert("Ошибка загрузки отчётов: " + error.message);
      return;
    }

    setReports(data || []);
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function handleAddReport(e: React.FormEvent) {
    e.preventDefault();

    if (!form.report_date || !form.group_name.trim() || !form.leader_name.trim()) {
      alert("Заполни дату, название домашки и кто проводил");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("home_group_reports")
      .insert([
        {
          report_date: form.report_date,
          group_name: form.group_name.trim(),
          leader_name: form.leader_name.trim(),
          topic: form.topic.trim() || null,
          people_count: form.people_count ? Number(form.people_count) : null,
          location: form.location.trim() || null,
          how_was_it: form.how_was_it.trim() || null,
          positives: form.positives.trim() || null,
          negatives: form.negatives.trim() || null,
          improvement_plan: form.improvement_plan.trim() || null,
          photo_url: null,
          created_by: session.user.id,
        },
      ])
      .select()
      .single();

    setSaving(false);

    if (error) {
      alert("Ошибка сохранения отчёта: " + error.message);
      return;
    }

    if (data) {
      setReports((prev) => [data, ...prev]);
      setShowForm(false);
      setForm({
        report_date: new Date().toISOString().slice(0, 10),
        group_name: "",
        leader_name: profile?.mentor_name || "",
        topic: "",
        people_count: "",
        location: "",
        how_was_it: "",
        positives: "",
        negatives: "",
        improvement_plan: "",
      });
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-[40px]">
            Домашки
          </h1>
          <p className="mt-1 text-slate-500">
            Отчёты по домашним группам
          </p>
        </div>

        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          {showForm ? "Закрыть" : "+ Добавить отчёт"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 text-lg font-semibold">Новый отчёт</div>

          <form onSubmit={handleAddReport} className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FieldLabel label="Дата домашки">
              <input
                type="date"
                value={form.report_date}
                onChange={(e) => setForm({ ...form, report_date: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
              />
            </FieldLabel>

            <FieldLabel label="Название домашки">
              <input
                value={form.group_name}
                onChange={(e) => setForm({ ...form, group_name: e.target.value })}
                placeholder="Например: Домашка у Богдана"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
              />
            </FieldLabel>

            <FieldLabel label="Кто проводил">
              <input
                value={form.leader_name}
                onChange={(e) => setForm({ ...form, leader_name: e.target.value })}
                placeholder="Имя ведущего"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
              />
            </FieldLabel>

            <FieldLabel label="Тема">
              <input
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                placeholder="Тема встречи"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
              />
            </FieldLabel>

            <FieldLabel label="Количество человек">
              <input
                type="number"
                min="0"
                value={form.people_count}
                onChange={(e) => setForm({ ...form, people_count: e.target.value })}
                placeholder="Например: 8"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
              />
            </FieldLabel>

            <FieldLabel label="Место проведения">
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Адрес / дом / квартира / зал"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
              />
            </FieldLabel>

            <TextAreaField
              label="Как прошла домашка"
              value={form.how_was_it}
              onChange={(value) => setForm({ ...form, how_was_it: value })}
            />

            <TextAreaField
              label="Плюсы"
              value={form.positives}
              onChange={(value) => setForm({ ...form, positives: value })}
            />

            <TextAreaField
              label="Минусы"
              value={form.negatives}
              onChange={(value) => setForm({ ...form, negatives: value })}
            />

            <TextAreaField
              label="Что можно сделать лучше"
              value={form.improvement_plan}
              onChange={(value) => setForm({ ...form, improvement_plan: value })}
            />

            <div className="flex justify-end md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Сохраняем..." : "Сохранить отчёт"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
          <div className="text-lg font-semibold">
            {profile?.role === "admin" ? "Все отчёты" : "Мои отчёты"}
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-slate-500">Загружаем отчёты...</div>
        ) : reports.length === 0 ? (
          <div className="p-6 text-slate-500">Отчётов пока нет</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reports.map((report) => (
              <div key={report.id} className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">
                      {report.group_name}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {formatDate(report.report_date)} • {report.leader_name}
                    </div>
                  </div>

                  <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                    {report.people_count ?? "—"} чел.
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <ReportDetail label="Тема" value={report.topic || "—"} />
                  <ReportDetail label="Место" value={report.location || "—"} />
                  <ReportDetail label="Как прошла" value={report.how_was_it || "—"} />
                  <ReportDetail label="Плюсы" value={report.positives || "—"} />
                  <ReportDetail label="Минусы" value={report.negatives || "—"} />
                  <ReportDetail label="Что улучшить" value={report.improvement_plan || "—"} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2">
      <div className="text-sm font-medium text-slate-500">{label}</div>
      {children}
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <FieldLabel label={label}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
      />
    </FieldLabel>
  );
}

function ReportDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="mb-1 text-sm text-slate-500">{label}</div>
      <div className="whitespace-pre-wrap text-sm font-medium text-slate-900">
        {value}
      </div>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}