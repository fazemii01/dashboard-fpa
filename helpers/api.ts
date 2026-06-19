export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(/(^|;)\s*userAuth\s*=\s*([^;]+)/);
  return match ? decodeURIComponent(match[2]) : null;
}

export async function apiRequest(path: string, options: RequestInit = {}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://backend-tab.jaribakat.com";
  const token = getAuthToken();

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      // Clear cookie and redirect
      document.cookie = "userAuth=; Max-Age=0; path=/;";
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Terjadi kesalahan pada server");
  }

  if (res.status === 204) return null;
  return res.json();
}
