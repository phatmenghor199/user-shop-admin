import { deleteCookie, getCookie, setCookie } from "cookies-next";

export function storeTokenRemember(token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  setCookie("auth-token", token, { maxAge: 30 * 24 * 60 * 60 });
}

export function getToken() {
  const token = getCookie("auth-token");
  return token;
}

export function storeToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  setCookie("auth-token", token);
}

/**
 * Logout the current user
 */
export function logoutUser(): void {
  // Delete auth cookie
  deleteCookie("auth-token");

  // Remove user from localStorage
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getCookie("auth-token");
  return !!token;
}
