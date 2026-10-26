
"use client";

import { useCallback, useEffect, useState } from "react";
import LoginForm from "@/components/LoginForm";
import AppHeader from "@/components/AppHeader";
import AgentForm from "@/components/AgentForm";
import AgentList from "@/components/AgentList";
import ConfirmDialog from "@/components/ConfirmDialog";
import Toast from "@/components/Toast";
import { createAgent, getAgents, saveAgents } from "@/lib/agents";

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "Admin@123";
const SESSION_KEY = "travel-agent-manager-demo-session";

export default function Home() {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [agents, setAgents] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [deletingAgent, setDeletingAgent] = useState(null);
  const [toast, setToast] = useState(null);

  const closeToast = useCallback(() => setToast(null), []);

  const notify = useCallback((message, type = "success") => {
    setToast({
      id: `${Date.now()}-${Math.random()}`,
      message,
      type,
    });
  }, []);

  useEffect(() => {
    setAgents(getAgents());

    try {
      setLoggedIn(sessionStorage.getItem(SESSION_KEY) === "true");
    } catch {
      setLoggedIn(false);
    }

    setReady(true);
  }, []);

  function handleLogin(email, password) {
    if (
      email.toLowerCase() !== ADMIN_EMAIL ||
      password !== ADMIN_PASSWORD
    ) {
      return false;
    }

    setLoggedIn(true);

    try {
      sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // Demo-only session.
    }

    return true;
  }

  function handleLogout() {
    setLoggedIn(false);
    setFormOpen(false);
    setEditingAgent(null);
    setDeletingAgent(null);
    closeToast();

    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore unavailable session storage.
    }
  }

  function persist(nextAgents) {
    try {
      saveAgents(nextAgents);
      setAgents(nextAgents);
      return true;
    } catch (error) {
      notify(error.message || "Unable to save agent data.", "error");
      return false;
    }
  }

  function handleSave(values) {
    if (editingAgent) {
      const updated = agents.map((agent) =>
        agent.id === editingAgent.id
          ? { ...agent, ...values, id: agent.id }
          : agent
      );

      if (!persist(updated)) {
        throw new Error("Unable to save changes. Please try again.");
      }

      setFormOpen(false);
      setEditingAgent(null);
      notify("Agent updated successfully.");
      return;
    }

    const newAgent = createAgent(values);

    if (!persist([newAgent, ...agents])) {
      throw new Error("Unable to add agent. Please try again.");
    }

    setFormOpen(false);
    setEditingAgent(null);
    notify("Agent added successfully.");
  }

  function handleDelete() {
    if (!deletingAgent) return;

    const name = deletingAgent.agencyName || deletingAgent.name;
    const nextAgents = agents.filter(
      (agent) => agent.id !== deletingAgent.id
    );

    if (persist(nextAgents)) {
      setDeletingAgent(null);
      notify(`${name} was deleted.`);
    }
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading workspace...</p>
      </main>
    );
  }

  if (!loggedIn) return <LoginForm onLogin={handleLogin} />;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-7 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <AppHeader onLogout={handleLogout} />

        {formOpen ? (
          <section className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-6 sm:px-8">
              <button
                type="button"
                onClick={() => {
                  setFormOpen(false);
                  setEditingAgent(null);
                }}
                className="mb-5 text-sm font-medium text-slate-500 hover:text-indigo-600"
              >
                ← Back to agents
              </button>

              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                {editingAgent ? "Edit agent" : "Add a new agent"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Complete the profile, social links and SEO metadata below.
              </p>
            </div>

            <div className="p-5 sm:p-8">
              <AgentForm
                key={editingAgent?.id || "new-agent"}
                initialAgent={editingAgent}
                onSave={handleSave}
                onCancel={() => {
                  setFormOpen(false);
                  setEditingAgent(null);
                }}
              />
            </div>
          </section>
        ) : (
          <AgentList
            agents={agents}
            onAdd={() => {
              setEditingAgent(null);
              setFormOpen(true);
            }}
            onEdit={(agent) => {
              setEditingAgent(agent);
              setFormOpen(true);
            }}
            onDelete={setDeletingAgent}
          />
        )}
      </div>

      <Toast key={toast?.id || "no-toast"} toast={toast} onClose={closeToast} />

      <ConfirmDialog
        open={Boolean(deletingAgent)}
        title="Delete this agent?"
        message={
          deletingAgent
            ? `Delete ${deletingAgent.agencyName || deletingAgent.name}? This action cannot be undone.`
            : ""
        }
        onCancel={() => setDeletingAgent(null)}
        onConfirm={handleDelete}
      />
    </main>
  );
}
