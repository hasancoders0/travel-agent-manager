"use client";

import { useEffect, useRef, useState } from "react";
import FormField from "@/components/FormField";
import { EMPTY_AGENT } from "@/lib/agent-constants";

const SOCIAL_FIELDS = [
  {
    key: "facebook",
    label: "Facebook",
    placeholder: "facebook.com/yourpage",
  },
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "instagram.com/yourprofile",
  },
  {
    key: "twitter",
    label: "Twitter / X",
    placeholder: "x.com/yourprofile",
  },
  {
    key: "tiktok",
    label: "TikTok",
    placeholder: "tiktok.com/@yourprofile",
  },
  {
    key: "threads",
    label: "Threads",
    placeholder: "threads.net/@yourprofile",
  },
  {
    key: "youtube",
    label: "YouTube",
    placeholder: "youtube.com/@yourchannel",
  },
];

const TEXT_FIELDS = [
  {
    name: "agencyName",
    label: "Agency Name",
    required: true,
    placeholder: "e.g. ABC Travel Agency",
  },
  {
    name: "title",
    label: "Title",
    placeholder: "e.g. Senior Travel Consultant",
  },
  {
    name: "specialty",
    label: "Specialty",
    placeholder: "e.g. Family Travel, Cruises, Luxury Tours",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    placeholder: "agent@example.com",
  },
  {
    name: "phone",
    label: "Phone Number",
    type: "tel",
    placeholder: "e.g. +1 555 123 4567",
  },
  {
    name: "website",
    label: "Website",
    type: "url",
    placeholder: "example.com",
  },
  {
    name: "location",
    label: "Location",
    placeholder: "e.g. Orlando, Florida, USA",
  },
];

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

function normalizeUrl(value) {
  const input = String(value || "").trim();

  if (!input) return "";

  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(input)
    ? input
    : `https://${input}`;

  let url;

  try {
    url = new URL(withProtocol);
  } catch {
    throw new Error("Please enter a valid website or social link.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only HTTP and HTTPS links are supported.");
  }

  if (!url.hostname.includes(".") || /\s/.test(url.hostname)) {
    throw new Error("Please enter a valid website or social link.");
  }

  return url.href;
}

function CharacterCounter({ value = "" }) {
  return (
    <span className="text-xs font-normal tabular-nums text-slate-400">
      {value.length} characters
    </span>
  );
}

function CountedTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  helpText,
}) {
  return (
    <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-slate-700">
      <span>{label}</span>

      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
      />

      <div className="flex items-start justify-between gap-3 text-xs font-normal text-slate-400">
        <span>{helpText || ""}</span>
        <CharacterCounter value={value} />
      </div>
    </label>
  );
}

export default function AgentForm({ initialAgent, onSave, onCancel }) {
  const [form, setForm] = useState({
    ...EMPTY_AGENT,
    socialLinks: { ...EMPTY_AGENT.socialLinks },
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    setForm({
      ...EMPTY_AGENT,
      ...(initialAgent || {}),
      agencyName: initialAgent?.agencyName || initialAgent?.name || "",
      photo: initialAgent?.photo || initialAgent?.profileImage || "",
      socialLinks: {
        ...EMPTY_AGENT.socialLinks,
        ...(initialAgent?.socialLinks || {}),
      },
    });

    setError("");
  }, [initialAgent]);

  function update(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function updateSocial(key, value) {
    setForm((current) => ({
      ...current,
      socialLinks: {
        ...current.socialLinks,
        [key]: value,
      },
    }));
  }

  async function handlePhoto(event) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Please choose a JPG, PNG, WebP or GIF image.");
      input.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image must be smaller than 2 MB.");
      input.value = "";
      return;
    }

    setUploading(true);
    setError("");

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Image upload failed.");
      }

      if (!result.url) {
        throw new Error("The upload API did not return an image URL.");
      }

      update("photo", result.url);
    } catch (err) {
      setError(err.message || "Unable to upload the image.");
    } finally {
      setUploading(false);
      input.value = "";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.agencyName.trim()) {
      setError("Agency Name is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (uploading) {
      setError("Please wait for the image upload to finish.");
      return;
    }

    let website = "";
    const socialLinks = {};

    try {
      website = normalizeUrl(form.website);

      for (const field of SOCIAL_FIELDS) {
        socialLinks[field.key] = normalizeUrl(form.socialLinks[field.key]);
      }
    } catch (err) {
      setError(err.message || "Please check your URLs.");
      return;
    }

    setSaving(true);

    try {
      await onSave({
        ...form,
        agencyName: form.agencyName.trim(),
        title: form.title.trim(),
        specialty: form.specialty.trim(),
        description: form.description.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        website,
        location: form.location.trim(),
        photo: form.photo || "",
        metaTitle: form.metaTitle.trim(),
        metaDescription: form.metaDescription.trim(),
        socialLinks,
      });
    } catch (err) {
      setError(err.message || "Unable to save the agent.");
    } finally {
      setSaving(false);
    }
  }

  const busy = saving || uploading;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {/* Profile Image */}
      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Profile Image
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Upload a clear photo for the agent profile.
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            aria-label="Choose profile image"
            className="flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white text-3xl text-slate-300 shadow-sm transition hover:border-indigo-400 hover:text-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {form.photo ? (
              <img
                src={form.photo}
                alt="Profile preview"
                className="h-full w-full object-cover"
              />
            ) : (
              "+"
            )}
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-700">
              Choose profile image
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handlePhoto}
              disabled={busy}
              aria-label="Select a profile image file"
              className="mt-3 block w-full text-xs text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:font-medium file:text-slate-700 file:shadow-sm hover:file:bg-slate-100"
            />

            <p className="mt-2 text-xs text-slate-400">
              JPG, PNG, WebP or GIF · Maximum 2 MB
            </p>

            {uploading && (
              <p className="mt-2 text-sm font-medium text-indigo-600">
                Uploading image...
              </p>
            )}

            {form.photo && (
              <button
                type="button"
                disabled={busy}
                onClick={() => update("photo", "")}
                className="mt-2 text-xs font-semibold text-rose-600 hover:underline disabled:opacity-50"
              >
                Remove image
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Agent Information */}
      <section className="space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-semibold text-slate-900">Agent Information</h3>
          <p className="mt-1 text-sm text-slate-500">
            Basic information about the agency and travel agent.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {TEXT_FIELDS.slice(0, 3).map((field) => (
            <FormField
              key={field.name}
              {...field}
              value={form[field.name] || ""}
              onChange={(event) => update(field.name, event.target.value)}
            />
          ))}
        </div>

        <CountedTextarea
          label="Description"
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          placeholder="Introduce the travel agent, their experience, services and destinations..."
          rows={5}
          helpText="Profile description"
        />

        <div className="grid gap-5 sm:grid-cols-2">
          {TEXT_FIELDS.slice(3).map((field) => (
            <FormField
              key={field.name}
              {...field}
              value={form[field.name] || ""}
              onChange={(event) => update(field.name, event.target.value)}
            />
          ))}
        </div>
      </section>

      {/* Social Links */}
      <section className="space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-semibold text-slate-900">Social Links</h3>
          <p className="mt-1 text-sm text-slate-500">
            Add public social media profiles. The https:// prefix is optional.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {SOCIAL_FIELDS.map((field) => (
            <FormField
              key={field.key}
              name={`socialLinks.${field.key}`}
              label={field.label}
              type="url"
              value={form.socialLinks[field.key] || ""}
              onChange={(event) => updateSocial(field.key, event.target.value)}
              placeholder={field.placeholder}
            />
          ))}
        </div>
      </section>

      {/* SEO Metadata */}
      <section className="space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-semibold text-slate-900">SEO Metadata</h3>
          <p className="mt-1 text-sm text-slate-500">
            Set the page title and search engine description.
          </p>
        </div>

        <CountedTextarea
          label="Meta Title"
          value={form.metaTitle}
          onChange={(event) => update("metaTitle", event.target.value)}
          placeholder="e.g. ABC Travel Agency | Expert Travel Consultant"
          rows={2}
          helpText="Page title for search engines"
        />

        <CountedTextarea
          label="Meta Description"
          value={form.metaDescription}
          onChange={(event) => update("metaDescription", event.target.value)}
          placeholder="Describe the travel agent and their services for search results..."
          rows={3}
          helpText="Search engine description"
        />
      </section>

      {/* Visibility */}
      <section className="grid gap-4 sm:grid-cols-2">
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-slate-50">
          <input
            type="checkbox"
            checked={Boolean(form.verified)}
            onChange={(event) => update("verified", event.target.checked)}
            className="mt-1 h-4 w-4 accent-indigo-600"
          />

          <span>
            <span className="block text-sm font-semibold text-slate-800">
              Verified agent
            </span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">
              Show a verified badge on the public agent profile.
            </span>
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-amber-200 hover:bg-amber-50/50">
          <input
            type="checkbox"
            checked={Boolean(form.featured)}
            onChange={(event) => update("featured", event.target.checked)}
            className="mt-1 h-4 w-4 accent-amber-500"
          />

          <span>
            <span className="block text-sm font-semibold text-slate-800">
              Featured agent
            </span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">
              Prioritize this agent at the beginning of the listing.
            </span>
          </span>
        </label>
      </section>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700"
        >
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading
            ? "Uploading image..."
            : saving
              ? "Saving..."
              : initialAgent
                ? "Save changes"
                : "Create agent"}
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
