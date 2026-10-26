
"use client";

export default function ConfirmDialog({
  open,
  title = "Delete this agent?",
  message = "This action cannot be undone.",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-sm rounded-2xl border border-white/60 bg-white p-6 shadow-2xl shadow-slate-950/20"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-lg font-semibold text-rose-600">
          !
        </div>

        <h2
          id="confirm-title"
          className="mt-4 text-lg font-semibold text-slate-900"
        >
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {message}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
          >
            Delete agent
          </button>
        </div>
      </section>
    </div>
  );
}
