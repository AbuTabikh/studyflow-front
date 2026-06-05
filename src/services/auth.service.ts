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
   * Update user profile and settings in DB
   */
  async updateProfile(profile: Partial<UserProfile>): Promise<void> {
    const token = typeof window !== "undefined" && localStorage.getItem("studyflow_auth_token");
    if (!token) return;
    const payload: Record<string, any> = {};
    if (profile.name           !== undefined) payload.name                  = profile.name;
    if (profile.university     !== undefined) payload.university             = profile.university;
    if (profile.major          !== undefined) payload.major                  = profile.major;
    if (profile.academicYear   !== undefined) payload.academic_year          = profile.academicYear;
    if (profile.currentGPA     !== undefined) payload.current_gpa            = parseFloat(profile.currentGPA) || null;
    if (profile.totalCreditHours     !== undefined) payload.total_credit_hours     = parseInt(profile.totalCreditHours, 10) || null;
    if (profile.completedCreditHours !== undefined) payload.completed_credit_hours = parseInt(profile.completedCreditHours, 10) || null;
    if (profile.themePreference      !== undefined) payload.theme                   = profile.themePreference;
    if (profile.language             !== undefined) payload.language                = profile.language;
    if (profile.reminderPreferences  !== undefined) payload.reminder_preferences    = profile.reminderPreferences;
    if (profile.onboardingCompleted  !== undefined) payload.onboarding_completed    = profile.onboardingCompleted;
    if (profile.avatarUrl            !== undefined) payload.avatar_url              = profile.avatarUrl;
    await apiClient.post("/user/update-profile", payload);
  },

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem("studyflow_auth_token");
    window.location.href = "/login";
  }
};
