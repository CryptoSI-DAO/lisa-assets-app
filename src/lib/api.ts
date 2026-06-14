import type { Project, ProjectDetail, Report, SortKey } from "./types";

// Configurable backend URL from env var; defaults to empty string (same-origin).
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    // Gracefully handle connection errors (backend not live yet).
    if (err instanceof TypeError) {
      // network failure
      console.warn(`[api] connection failed for ${url}`);
    }
    throw err;
  }
}

/** Fetch a paginated, optionally filtered list of projects. */
export async function getProjects(
  search?: string,
  sort?: SortKey,
  page?: number,
): Promise<Project[]> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (sort) params.set("sort", sort);
  if (page) params.set("page", String(page));
  const qs = params.toString();
  return apiFetch<Project[]>(`/api/projects${qs ? `?${qs}` : ""}`);
}

/** Fetch a single project's details by id. */
export async function getProject(id: string): Promise<ProjectDetail> {
  return apiFetch<ProjectDetail>(`/api/projects/${id}`);
}

/** Fetch a full report for a project. */
export async function getReport(id: string): Promise<Report> {
  return apiFetch<Report>(`/api/reports/${id}`);
}

/** Subscribe an email to the newsletter. */
export async function subscribeNewsletter(email: string): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>(`/api/newsletter/subscribe`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
