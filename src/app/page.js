"use client";

import { useCallback, useEffect, useState } from "react";
import LoginForm from "@/components/LoginForm";
import AppHeader from "@/components/AppHeader";
import AgentForm from "@/components/AgentForm";
import AgentList from "@/components/AgentList";
import ConfirmDialog from "@/components/ConfirmDialog";
import Toast from "@/components/Toast";
import { EMPTY_AGENT } from "@/lib/agent-constants";

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
  const [saving, setSaving] = useState(false);

  const closeToast = useCallback(() => setToast(null), []);

  const notify = useCallback((message, type = "success") => {
    setToast({
      id: `${Date.now()}-${Math.random()}`,
      message,
      type,
    });
  }, []);

  const loadAgents = useCallback(async () => {
    const response = await fetch("/api/agents", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Unable to load agents from the database.");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Unexpected response from the agents API.");
    }

    setAgents(data);
  }, []);

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const session = sessionStorage.getItem(SESSION_KEY) === "true";

        if (active) {
          setLoggedIn(session);
        }

        if (session) {
          const response = await fetch("/api/agents", {
            cache: "no-store",
          });

          if (!response.ok) {
            throw new Error("Unable to load agents from the database.");
          }

          const data = await response.json();

          if (!Array.isArray(data)) {
            throw new Error("Unexpected response from the agents API.");
          }

          if (active) {
            setAgents(data);
          }
        }
      } catch (error) {
        console.error("Workspace initialization error:", error);

        if (active) {
          notify(error.message || "Unable to load workspace data.", "error");
        }
      } finally {
        if (active) {
          setReady(true);
        }
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, [notify]);

  function handleLogin(email, password) {
    if (
      email.trim().toLowerCase() !== ADMIN_EMAIL ||
      password !== ADMIN_PASSWORD
    ) {
      return false;
    }

    try {
      sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // Demo-only session.
    }

    setLoggedIn(true);

    loadAgents().catch((error) => {
      notify(error.message || "Unable to load agents.", "error");
    });

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

  async function handleSave(values) {
    if (saving) return;

    setSaving(true);

    try {
      const isEditing = Boolean(editingAgent);

      const response = await fetch(
        isEditing
          ? `/api/agents/${encodeURIComponent(editingAgent.id)}`
          : "/api/agents",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...EMPTY_AGENT,
            ...values,
            agencyName: values.agencyName || values.name || "",
            socialLinks: {
              ...EMPTY_AGENT.socialLinks,
              ...(values.socialLinks || {}),
            },
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to save agent.");
      }

      await loadAgents();

      setFormOpen(false);
      setEditingAgent(null);

      notify(
        isEditing ? "Agent updated successfully." : "Agent added successfully.",
      );
    } catch (error) {
      notify(error.message || "Unable to save agent.", "error");
      throw error;
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingAgent) return;

    const agent = deletingAgent;

    try {
      const response = await fetch(
        `/api/agents/${encodeURIComponent(agent.id)}`,
        { method: "DELETE" },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to delete agent.");
      }

      setAgents((current) => current.filter((item) => item.id !== agent.id));

      setDeletingAgent(null);
      notify(`${agent.agencyName || agent.name} was deleted.`);
    } catch (error) {
      notify(error.message || "Unable to delete agent.", "error");
    }
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading workspace...</p>
      </main>
    );
  }

  if (!loggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

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
                initialAgent={editingAgent || EMPTY_AGENT}
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
