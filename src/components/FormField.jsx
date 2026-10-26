"use client";

export default function FormField({
  label,
  name,
  value = "",
  onChange,
  type = "text",
  required = false,
  placeholder,
  autoComplete,
  helpText,
}) {
  const inputType = type === "url" ? "text" : type;

  return (
    <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-slate-700">
      <span>
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </span>

      <input
        name={name}
        type={inputType}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        autoComplete={autoComplete}
        inputMode={type === "url" ? "url" : undefined}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
      />

      {helpText && (
        <span className="text-xs font-normal leading-5 text-slate-400">
          {helpText}
        </span>
      )}
    </label>
  );
}
