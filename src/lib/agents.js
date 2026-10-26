import prisma from "@/lib/prisma";

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

export function createAgencySlug(agencyName, serialNumber) {
  const nameSlug = String(agencyName || "travel-agency")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const serial = String(serialNumber).padStart(6, "0");

  return `${nameSlug || "travel-agency"}-${serial}`;
}

export function getAgentUrl(agent) {
  const slug =
    agent.slug || createAgencySlug(agent.agencyName, agent.serialNumber || 1);

  return `/pages/travel-agent/${slug}`;
}

function normalizeUrl(value) {
  const url = String(value || "").trim();

  if (!url) return "";

  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function toDatabaseData(values) {
  const socialLinks = {
    ...EMPTY_AGENT.socialLinks,
    ...(values.socialLinks || {}),
  };

  const location = String(values.location || "").trim();
  const locationParts = location.split(",").map((part) => part.trim());

  return {
    agencyName: String(
      values.agencyName || values.name || values.title || "",
    ).trim(),

    title: String(values.title || "").trim() || null,
    specialty: String(values.specialty || "").trim() || null,
    description: values.description || "",

    email: String(values.email || "").trim() || null,
    phone: String(values.phone || "").trim() || null,
    website: normalizeUrl(values.website) || null,

    city: String(values.city || locationParts[0] || "").trim() || null,
    state:
      String(values.state || locationParts.slice(1).join(",") || "").trim() ||
      null,

    profileImage: values.photo || values.profileImage || null,

    facebook: normalizeUrl(socialLinks.facebook) || null,
    instagram: normalizeUrl(socialLinks.instagram) || null,
    twitter: normalizeUrl(socialLinks.twitter) || null,
    tiktok: normalizeUrl(socialLinks.tiktok) || null,
    threads: normalizeUrl(socialLinks.threads) || null,
    youtube: normalizeUrl(socialLinks.youtube) || null,

    metaTitle: String(values.metaTitle || "").trim() || null,
    metaDescription: String(values.metaDescription || "").trim() || null,

    verified: Boolean(values.verified),
    featured: Boolean(values.featured),
  };
}

function fromDatabaseAgent(agent) {
  return {
    ...EMPTY_AGENT,

    id: agent.id,
    slug: agent.slug || "",
    name: agent.agencyName,
    agencyName: agent.agencyName,
    title: agent.title || "",
    specialty: agent.specialty || "",
    description: agent.description || "",

    email: agent.email || "",
    phone: agent.phone || "",
    website: agent.website || "",

    city: agent.city || "",
    state: agent.state || "",
    location: [agent.city, agent.state].filter(Boolean).join(", "),

    photo: agent.profileImage || "",
    profileImage: agent.profileImage || "",

    socialLinks: {
      facebook: agent.facebook || "",
      instagram: agent.instagram || "",
      twitter: agent.twitter || "",
      tiktok: agent.tiktok || "",
      threads: agent.threads || "",
      youtube: agent.youtube || "",
    },

    metaTitle: agent.metaTitle || "",
    metaDescription: agent.metaDescription || "",

    verified: Boolean(agent.verified),
    featured: Boolean(agent.featured),

    createdAt: agent.createdAt?.toISOString?.() || agent.createdAt,
    updatedAt: agent.updatedAt?.toISOString?.() || agent.updatedAt,
  };
}

export async function getAgents() {
  const agents = await prisma.agent.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return agents.map(fromDatabaseAgent);
}

export async function getAgentById(id) {
  const agent = await prisma.agent.findUnique({
    where: { id },
  });

  return agent ? fromDatabaseAgent(agent) : null;
}

export async function getAgentBySlug(slug) {
  const agent = await prisma.agent.findUnique({
    where: { slug },
  });

  return agent ? fromDatabaseAgent(agent) : null;
}


export async function createAgent(values) {
  const data = toDatabaseData(values);

  if (!data.agencyName) {
    throw new Error("Agency name is required.");
  }

  // Avoid an interactive transaction with Neon connection pooling.
  const serialNumber = (await prisma.agent.count()) + 1;

  const slug = createAgencySlug(data.agencyName, serialNumber);

  const agent = await prisma.agent.create({
    data: {
      id: createAgentId(),
      slug,
      ...data,
    },
  });

  return fromDatabaseAgent(agent);
}


export async function updateAgent(id, values) {
  const data = toDatabaseData(values);

  if (!data.agencyName) {
    throw new Error("Agency name is required.");
  }

  const existing = await prisma.agent.findUnique({
    where: { id },
    select: { slug: true },
  });

  if (!existing) {
    throw new Error("Agent not found.");
  }

  // Keep the existing slug stable when an agency name changes.
  const agent = await prisma.agent.update({
    where: { id },
    data,
  });

  return fromDatabaseAgent(agent);
}

export async function deleteAgent(id) {
  await prisma.agent.delete({
    where: { id },
  });

  return { success: true };
}
