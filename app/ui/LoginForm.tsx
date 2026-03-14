"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert("Ошибка входа: " + error.message);
      return;
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm border space-y-4"
      >
        <h1 className="text-3xl font-bold">Вход в CRM</h1>
        <p className="text-slate-500">Введите email и пароль</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-indigo-600 px-4 py-3 font-medium text-white disabled:opacity-60"
        >
          {loading ? "Входим..." : "Войти"}
        </button>
      </form>
    </main>
  );
}