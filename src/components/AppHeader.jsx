
export default function AppHeader({ onLogout }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-bold text-white shadow-sm shadow-indigo-600/20">
          T
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Travel Agent Manager
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Travel Agents
          </h1>
        </div>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
      >
        Log out
      </button>
    </header>
  );
}
