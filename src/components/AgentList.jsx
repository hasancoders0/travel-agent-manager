
"use client";

import { useEffect, useMemo, useState } from "react";
import AgentCard from "@/components/AgentCard";

const PAGE_SIZE = 6;

const FILTERS = [
  { label: "All agents", value: "all" },
  { label: "Verified", value: "verified" },
  { label: "Pending", value: "pending" },
];

export default function AgentList({ agents, onAdd, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filteredAgents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return agents.filter((agent) => {
      const matchesSearch = [
        agent.name,
        agent.agencyName,
        agent.title,
        agent.specialty,
        agent.email,
        agent.phone,
        agent.website,
        agent.location,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      const matchesFilter =
        filter === "all" ||
        (filter === "verified" && agent.verified) ||
        (filter === "pending" && !agent.verified);

      return matchesSearch && matchesFilter;
    });
  }, [agents, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredAgents.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const startIndex = (page - 1) * PAGE_SIZE;
  const visibleAgents = filteredAgents.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <section className="pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            All agents
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Manage your travel agent directory.
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <span className="text-lg leading-none">+</span>
          Add agent
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search agency, title, specialty, email..."
          aria-label="Search agents"
          className="min-w-0 flex-1 rounded-xl border border-transparent bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
        />

        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          aria-label="Filter agents"
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400"
        >
          {FILTERS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-800">
            {filteredAgents.length}
          </span>{" "}
          matching {filteredAgents.length === 1 ? "agent" : "agents"}
        </p>

        {(search || filter !== "all") && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setFilter("all");
            }}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            Clear filters
          </button>
        )}
      </div>

      {visibleAgents.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
          <h3 className="font-semibold text-slate-900">
            {agents.length === 0 ? "No agents yet" : "No matching agents"}
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            {agents.length === 0
              ? "Add your first travel agent to get started."
              : "Try another search term or filter."}
          </p>
          {agents.length === 0 && (
            <button
              type="button"
              onClick={onAdd}
              className="mt-5 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Create first agent
            </button>
          )}
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {filteredAgents.length > 0 && (
        <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing {startIndex + 1}–
            {Math.min(startIndex + PAGE_SIZE, filteredAgents.length)} of{" "}
            {filteredAgents.length}
          </p>

          {totalPages > 1 && (
            <nav aria-label="Agent pagination" className="flex flex-wrap gap-1.5">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (number) => (
                  <button
                    key={number}
                    type="button"
                    aria-current={page === number ? "page" : undefined}
                    onClick={() => setPage(number)}
                    className={`h-9 min-w-9 rounded-lg border px-3 text-sm font-semibold ${
                      page === number
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {number}
                  </button>
                )
              )}

              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </nav>
          )}
        </div>
      )}
    </section>
  );
}
