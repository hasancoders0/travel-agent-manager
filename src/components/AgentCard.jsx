
"use client";

const SOCIAL_LINKS = [
  ["facebook", "Facebook"],
  ["instagram", "Instagram"],
  ["twitter", "Twitter / X"],
  ["tiktok", "TikTok"],
  ["threads", "Threads"],
  ["youtube", "YouTube"],
];

export default function AgentCard({ agent, onEdit, onDelete }) {
  const agencyName = agent.agencyName || "Travel Agency";

  const initials = agencyName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const socialLinks = agent.socialLinks || {};

  const availableSocialLinks = SOCIAL_LINKS.filter(
    ([key]) => Boolean(socialLinks[key]?.trim())
  );

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-slate-200/50">
      {/* Agent Header */}
      <div className="flex items-start gap-3">
        {agent.photo ? (
          <img
            src={agent.photo}
            alt={`${agencyName} profile`}
            className="h-14 w-14 shrink-0 rounded-2xl border border-slate-100 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-sm font-semibold text-indigo-700">
            {initials || "TA"}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="break-words text-sm font-semibold text-slate-900">
            {agencyName}
          </h3>

          {agent.title && (
            <p className="mt-1 break-words text-sm text-slate-500">
              {agent.title}
            </p>
          )}

          {/* Badges: show only when enabled */}
          <div className="mt-2 flex flex-wrap gap-2">
            {agent.verified && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Verified
              </span>
            )}

            {agent.featured && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                <span aria-hidden="true">★</span>
                Featured
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="my-5 h-px bg-slate-100" />

      {/* Agent Details */}
      <div className="flex-1 space-y-3.5 text-sm">
        {agent.specialty && (
          <p className="break-words">
            <span className="text-slate-400">Specialty: </span>
            <span className="font-medium text-slate-700">
              {agent.specialty}
            </span>
          </p>
        )}

        {agent.location && (
          <p className="break-words">
            <span className="text-slate-400">Location: </span>
            <span className="text-slate-700">{agent.location}</span>
          </p>
        )}

        {agent.description && (
          <p className="line-clamp-3 whitespace-pre-line break-words leading-6 text-slate-500">
            {agent.description}
          </p>
        )}

        {agent.email && (
          <a
            href={`mailto:${agent.email}`}
            className="block break-all text-slate-600 transition hover:text-indigo-600"
          >
            {agent.email}
          </a>
        )}

        {agent.phone && (
          <a
            href={`tel:${agent.phone}`}
            className="block break-words text-slate-600 transition hover:text-indigo-600"
          >
            {agent.phone}
          </a>
        )}

        {agent.website && (
          <a
            href={agent.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block break-all font-medium text-indigo-600 transition hover:text-indigo-800"
          >
            Visit website ↗
          </a>
        )}

        {/* Social Profiles */}
        {availableSocialLinks.length > 0 && (
          <div className="border-t border-slate-100 pt-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Social profiles
            </p>

            <div className="flex flex-wrap gap-2">
              {availableSocialLinks.map(([key, label]) => (
                <a
                  key={key}
                  href={socialLinks[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  {label} ↗
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Admin Actions */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => onEdit(agent)}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Edit details
        </button>

        <button
          type="button"
          onClick={() => onDelete(agent)}
          className="rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
