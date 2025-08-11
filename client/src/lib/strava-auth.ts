import { apiRequest } from "./queryClient";

export interface StravaAuthResponse {
  sessionToken: string;
  user: any;
}

export const initiateStravaAuth = async (): Promise<string> => {
  const response = await apiRequest("GET", "/api/auth/strava");
  const data = await response.json();
  return data.authUrl;
};

export const completeStravaAuth = async (code: string): Promise<StravaAuthResponse> => {
  const response = await apiRequest("POST", "/api/auth/strava/callback", { code });
  return await response.json();
};

export const logout = async (): Promise<void> => {
  const sessionToken = localStorage.getItem('sessionToken');
  if (sessionToken) {
    await apiRequest("POST", "/api/auth/logout", {});
    localStorage.removeItem('sessionToken');
  }
};

export const getSessionToken = (): string | null => {
  return localStorage.getItem('sessionToken');
};

export const setSessionToken = (token: string): void => {
  localStorage.setItem('sessionToken', token);
};

export const isAuthenticated = (): boolean => {
  return !!getSessionToken();
};
