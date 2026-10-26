
const STORAGE_KEY = "travel-agent-manager-agents-v1";

export const EMPTY_AGENT = {
  name: "",
  agencyName: "",
  title: "",
  specialty: "",
  description: "",
  email: "",
  phone: "",
  website: "",
  location: "",
  photo: "",
  verified: false,
  featured: false,

  socialLinks: {
    facebook: "",
    instagram: "",
    twitter: "",
    tiktok: "",
    threads: "",
    youtube: "",
  },

  metaTitle: "",
  metaDescription: "",
};

export function createAgentId() {
  return `agent_${crypto.randomUUID()}`;
}

export function createAgencySlug(agencyName, id) {
  const slug = String(agencyName || "travel-agency")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${slug || "travel-agency"}-${id}`;
}

export function getAgentUrl(agent) {
  return `/pages/travel-agent/${createAgencySlug(
    agent.agencyName,
    agent.id
  )}`;
}

function normalizeAgent(agent) {
  return {
    ...EMPTY_AGENT,
    ...agent,
    agencyName: agent.agencyName || agent.title || "",
    title: agent.title || "",
    photo: agent.photo || "",
    verified: Boolean(agent.verified),
    featured: Boolean(agent.featured),

    socialLinks: {
      ...EMPTY_AGENT.socialLinks,
      ...(agent.socialLinks || {}),
    },
  };
}

export function getAgents() {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];

    if (!Array.isArray(parsed)) return [];

    const migrated = parsed.map((agent) => ({
      ...normalizeAgent(agent),
      id: agent.id || createAgentId(),
    }));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));

    return migrated;
  } catch {
    return [];
  }
}

export function saveAgents(agents) {
  if (typeof window === "undefined") {
    throw new Error("Browser storage is unavailable.");
  }

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(agents.map(normalizeAgent))
    );
  } catch {
    throw new Error(
      "Unable to save agent data. Browser storage may be full."
    );
  }
}

export function createAgent(values) {
  return {
    ...normalizeAgent(values),
    id: createAgentId(),
    createdAt: new Date().toISOString(),
  };
}
