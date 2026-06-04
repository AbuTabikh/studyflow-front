import { apiClient } from "@/lib/api-client";
import { UserProfile } from "@/types/settings";

/**
 * Service for authentication and user profile management
 */
export const AuthService = {
  /**
   * Login user and store token
   */
  async login(credentials: any) {
    const response = await apiClient.post<{ token: string; user: UserProfile }>("/login", credentials);
    if (response.token) {
      localStorage.setItem("studyflow_auth_token", response.token);
    }
    return response;
  },

  /**
   * Register a new user
   */
  async register(data: any) {
    return apiClient.post<{ message: string; token: string; user: UserProfile }>("/register", data);
  },

  /**
   * Send password reset link
   */
  async forgotPassword(email: string) {
    return apiClient.post<{ message: string; token: string; email: string }>("/forgot-password", { email });
  },

  /**
   * Reset password with token
   */
  async resetPassword(data: any) {
    return apiClient.post<{ message: string }>("/reset-password", data);
  },

  /**
   * Get current user profile
   */
  async getProfile() {
    return apiClient.get<{ user: UserProfile; email_verified: boolean }>("/user");
  },

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem("studyflow_auth_token");
    window.location.href = "/login";
  }
};
