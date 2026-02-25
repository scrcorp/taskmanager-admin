const ACCESS_TOKEN_KEY = "taskmanager_access_token";
const REFRESH_TOKEN_KEY = "taskmanager_refresh_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  if (process.env.NEXT_PUBLIC_USE_MOCK === "true") return true;
  return !!getAccessToken();
}

const COMPANY_CODE_KEY = "taskmanager_company_code";

/** .env에 고정된 회사코드 (NEXT_PUBLIC_COMPANY_CODE) */
export function getEnvCompanyCode(): string | null {
  const env = process.env.NEXT_PUBLIC_COMPANY_CODE;
  return env && env.length === 6 ? env.toUpperCase() : null;
}

export function getCompanyCode(): string | null {
  if (typeof window === "undefined") return getEnvCompanyCode();
  return localStorage.getItem(COMPANY_CODE_KEY) || getEnvCompanyCode();
}

export function setCompanyCode(code: string): void {
  localStorage.setItem(COMPANY_CODE_KEY, code.toUpperCase());
}

export function hasCompanyCode(): boolean {
  const code = getCompanyCode();
  return !!code && code.length === 6;
}
