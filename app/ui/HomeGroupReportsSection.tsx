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

type ReportForm = {
  report_date: string;
  group_name: string;
  leader_name: string;
  topic: string;
  people_count: string;
  location: string;
  how_was_it: string;
  positives: string;
  negatives: string;
  improvement_plan: string;
};

const emptyForm = (leaderName = ""): ReportForm => ({
  report_date: new Date().toISOString().slice(0, 10),
  group_name: "",
  leader_name: leaderName,
  topic: "",
  people_count: "",
  location: "",
  how_was_it: "",
  positives: "",
  negatives: "",
  improvement_plan: "",
});

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
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [reportsView, setReportsView] = useState<"mine" | "all">("mine");
  const [photoPreview, setPhotoPreview] = useState<{
    url: string;
    title: string;
  } | null>(null);

  const [form, setForm] = useState<ReportForm>(
    emptyForm(profile?.mentor_name || "")
  );

  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const visibleReports =
  reportsView === "mine"
    ? reports.filter((report) => report.created_by === session.user.id)
    : reports;

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

  useEffect(() => {
    if (!photoPreview) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPhotoPreview(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [photoPreview]);

  function resetForm() {
    setForm(emptyForm(profile?.mentor_name || ""));
    setPhotoFile(null);
    setEditingReportId(null);
    setShowForm(false);
  }

  function startEdit(report: Report) {
    setEditingReportId(report.id);
    setShowForm(true);
    setPhotoFile(null);

    setForm({
      report_date: report.report_date || new Date().toISOString().slice(0, 10),
      group_name: report.group_name || "",
      leader_name: report.leader_name || profile?.mentor_name || "",
      topic: report.topic || "",
      people_count: report.people_count?.toString() || "",
      location: report.location || "",
      how_was_it: report.how_was_it || "",
      positives: report.positives || "",
      negatives: report.negatives || "",
      improvement_plan: report.improvement_plan || "",
    });
  }

  async function uploadPhoto(reportId: string) {
    if (!photoFile) return null;

    const fileExt = photoFile.name.split(".").pop() || "jpg";
    const fileName = `${reportId}-${Date.now()}.${fileExt}`;
    const filePath = `${session.user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("home-group-photos")
      .upload(filePath, photoFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error("Ошибка загрузки фото: " + uploadError.message);
    }

    const { data } = supabase.storage
      .from("home-group-photos")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSubmitReport(e: React.FormEvent) {
    e.preventDefault();

    if (!form.report_date || !form.group_name.trim() || !form.leader_name.trim()) {
      alert("Заполни дату, название домашки и кто проводил");
      return;
    }

    setSaving(true);

    try {
      const basePayload = {
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
      };

      if (editingReportId) {
        let photo_url: string | null = null;

        if (photoFile) {
          photo_url = await uploadPhoto(editingReportId);
        }

        const updatePayload = photo_url
          ? { ...basePayload, photo_url }
          : basePayload;

        const { data, error } = await supabase
          .from("home_group_reports")
          .update(updatePayload)
          .eq("id", editingReportId)
          .select()
          .single();

        if (error) {
          throw new Error("Ошибка обновления отчёта: " + error.message);
        }

        if (data) {
          setReports((prev) =>
            prev.map((report) => (report.id === data.id ? data : report))
          );
        }

        resetForm();
        return;
      }

      const { data: createdReport, error: insertError } = await supabase
        .from("home_group_reports")
        .insert([
          {
            ...basePayload,
            photo_url: null,
            created_by: session.user.id,
          },
        ])
        .select()
        .single();

      if (insertError) {
        throw new Error("Ошибка сохранения отчёта: " + insertError.message);
      }

      let finalReport = createdReport;

      if (createdReport && photoFile) {
        const photo_url = await uploadPhoto(createdReport.id);

        const { data: updatedReport, error: photoUpdateError } = await supabase
          .from("home_group_reports")
          .update({ photo_url })
          .eq("id", createdReport.id)
          .select()
          .single();

        if (photoUpdateError) {
          throw new Error("Фото загрузилось, но ссылка не сохранилась: " + photoUpdateError.message);
        }

        finalReport = updatedReport;
      }

      if (finalReport) {
        setReports((prev) => [finalReport, ...prev]);
      }

      resetForm();
    } catch (e: any) {
      alert(e.message || "Неизвестная ошибка");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteReport(report: Report) {
    const confirmed = confirm(
      `Удалить отчёт "${report.group_name}" от ${formatDate(report.report_date)}?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("home_group_reports")
      .delete()
      .eq("id", report.id);

    if (error) {
      alert("Ошибка удаления отчёта: " + error.message);
      return;
    }

    setReports((prev) => prev.filter((item) => item.id !== report.id));
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
          onClick={() => {
            if (showForm) {
              resetForm();
              return;
            }

            setShowForm(true);
          }}
          className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          {showForm ? "Закрыть" : "+ Добавить отчёт"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 text-lg font-semibold">
            {editingReportId ? "Редактировать отчёт" : "Новый отчёт"}
          </div>

          <form onSubmit={handleSubmitReport} className="grid grid-cols-1 gap-3 md:grid-cols-2">
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

            <FieldLabel label="Фото">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
              />
              <div className="mt-1 text-xs text-slate-400">
                {photoFile ? photoFile.name : "Можно оставить пустым"}
              </div>
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

            <div className="flex flex-col justify-end gap-3 md:col-span-2 sm:flex-row">
              {editingReportId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold hover:bg-slate-50"
                >
                  Отмена
                </button>
              )}

              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving
                  ? "Сохраняем..."
                  : editingReportId
                  ? "Сохранить изменения"
                  : "Сохранить отчёт"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="text-lg font-semibold">
      {reportsView === "mine" ? "Мои отчёты" : "Все отчёты"}
    </div>

    <div className="flex rounded-2xl border border-slate-200 bg-white p-1">
      <button
        onClick={() => setReportsView("mine")}
        className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
          reportsView === "mine"
            ? "bg-indigo-600 text-white"
            : "text-slate-600 hover:bg-slate-50"
        }`}
      >
        Мои отчёты
      </button>

      <button
        onClick={() => setReportsView("all")}
        className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
          reportsView === "all"
            ? "bg-indigo-600 text-white"
            : "text-slate-600 hover:bg-slate-50"
        }`}
      >
        Все отчёты
      </button>
    </div>
  </div>
</div>

        {loading ? (
          <div className="p-6 text-slate-500">Загружаем отчёты...</div>
      ) : visibleReports.length === 0 ? (
          <div className="p-6 text-slate-500">Отчётов пока нет</div>
        ) : (
          <div className="divide-y divide-slate-100">
           {visibleReports.map((report) => (
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

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                      {report.people_count ?? "—"} чел.
                    </div>

                    {(report.created_by === session.user.id || profile?.role === "admin") && (
  <>
    <button
      onClick={() => startEdit(report)}
      className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium hover:bg-slate-50"
    >
      Редактировать
    </button>

    <button
      onClick={() => handleDeleteReport(report)}
      className="rounded-full border border-rose-200 px-3 py-1 text-sm font-medium text-rose-600 hover:bg-rose-50"
    >
      Удалить
    </button>
  </>
)}
                  </div>
                </div>

                {report.photo_url && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() =>
                        setPhotoPreview({
                          url: report.photo_url!,
                          title: report.group_name,
                        })
                      }
                      className="group relative block w-full overflow-hidden rounded-2xl text-left"
                      aria-label={`Открыть фото отчёта ${report.group_name}`}
                    >
                      <img
                        src={report.photo_url}
                        alt={`Фото отчёта ${report.group_name}`}
                        className="max-h-[420px] w-full object-cover transition duration-200 group-hover:scale-[1.01]"
                      />
                      <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200 backdrop-blur">
                        Открыть фото
                      </span>
                    </button>
                  </div>
                )}

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

      {photoPreview && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/90 p-3 sm:p-6"
          onClick={() => setPhotoPreview(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Фото отчёта ${photoPreview.title}`}
        >
          <div className="absolute left-4 top-4 max-w-[calc(100vw-96px)] rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur sm:left-6 sm:top-6">
            {photoPreview.title}
          </div>

          <button
            type="button"
            onClick={() => setPhotoPreview(null)}
            className="absolute right-4 top-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg sm:right-6 sm:top-6"
          >
            Закрыть
          </button>

          <img
            src={photoPreview.url}
            alt={`Фото отчёта ${photoPreview.title}`}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[88vh] max-w-full rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
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
