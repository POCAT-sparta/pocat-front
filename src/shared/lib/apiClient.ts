const BASE_URL = import.meta.env.VITE_API_URL ?? "";

function getCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1] ?? null;
}

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Strict`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

function getAccessToken() {
  return getCookie("accessToken");
}

function getRefreshToken() {
  return getCookie("refreshToken");
}

export function setTokens(accessToken: string, refreshToken: string) {
  setCookie("accessToken", accessToken);
  setCookie("refreshToken", refreshToken);
}

export function clearTokens() {
  deleteCookie("accessToken");
  deleteCookie("refreshToken");
}

async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/reissue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const json = await res.json();
    if (json.status === "SUCCESS" && json.data) {
      setTokens(json.data.accessToken, json.data.refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...fetchOptions, headers });

  if (res.status === 401 && !skipAuth) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${getAccessToken()}`;
      const retryRes = await fetch(`${BASE_URL}${path}`, { ...fetchOptions, headers });
      if (!retryRes.ok) {
        const err = await retryRes.json().catch(() => ({ message: "요청 실패" }));
        throw new Error(err.message ?? "요청 실패");
      }
      return retryRes.json();
    } else {
      clearTokens();
      window.location.href = "/login";
      throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "요청 실패" }));
    throw new Error(err.message ?? "요청 실패");
  }

  return res.json();
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
