
"use client";

import { useState } from "react";
import FormField from "@/components/FormField";

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!onLogin(email.trim(), password)) {
      setError("Incorrect email or password.");
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />

      <section className="relative w-full max-w-md rounded-3xl border border-white bg-white/95 p-7 shadow-xl shadow-slate-200/60 sm:p-9">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white shadow-lg shadow-indigo-600/20">
          T
        </div>

        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
          Travel Agent Manager
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Welcome back
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Sign in to manage your travel agent directory.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <FormField
            label="Email address"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            placeholder="admin@example.com"
            required
          />

          <FormField
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Enter your password"
            required
          />

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
          >
            Sign in
          </button>
        </form>

        <div className="mt-6 rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-600">
            Development credentials
          </p>
          <p className="mt-2 text-xs text-slate-500">
            admin@example.com
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Password: Admin@123
          </p>
        </div>
      </section>
    </main>
  );
}
