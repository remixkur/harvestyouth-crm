"use client";

import { useEffect, useState } from "react";
import ClientHome from "./ui/ClientHome";
import LoginForm from "./ui/LoginForm";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [people, setPeople] = useState<any[] | null>(null);
  const [peopleError, setPeopleError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;
        setSession(session);
      } catch (e: any) {
        console.error("Session error:", e);
      } finally {
        if (mounted) setSessionChecked(true);
      }
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);
      setSessionChecked(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      if (!session) {
        setPeople(null);
        setPeopleError(null);
        setProfile(null);
        return;
      }

      setPeople(null);
      setPeopleError(null);

      try {
        const profileResult = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (!mounted) return;

        if (profileResult.error) {
          setPeople([]);
          setPeopleError("Не найден профиль пользователя: " + profileResult.error.message);
          return;
        }

        setProfile(profileResult.data);

        const { data, error } = await supabase.from("people").select("*");

        if (!mounted) return;

        if (error) {
          console.error("Ошибка загрузки people:", error);
          setPeople([]);
          setPeopleError(error.message || "Не удалось загрузить people");
          return;
        }

        setPeople(data || []);
      } catch (e: any) {
        console.error("Catch loadData:", e);
        if (!mounted) return;
        setPeople([]);
        setPeopleError(e.message || "Неизвестная ошибка загрузки");
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [session]);

  if (!sessionChecked) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-900">
        Проверяем вход...
      </main>
    );
  }

  if (!session) {
    return <LoginForm />;
  }

  if (peopleError) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-100 text-slate-900 p-6">
        <div className="text-2xl font-bold">Ошибка загрузки</div>
        <div className="max-w-xl rounded-2xl border bg-white p-4 text-sm">
          {peopleError}
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.reload();
          }}
          className="rounded-2xl bg-slate-900 px-4 py-3 text-white"
        >
          Выйти
        </button>
      </main>
    );
  }

  if (people === null) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-900">
        Загружаем людей...
      </main>
    );
  }

  return <ClientHome initialPeople={people} profile={profile} session={session} />;
}