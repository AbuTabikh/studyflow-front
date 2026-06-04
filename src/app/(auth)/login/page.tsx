import { LoginPageContent } from "@/components/auth/login-page-content";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | StudyFlow",
  description: "Sign in to your StudyFlow account to manage your academic life.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginPageContent />;
}
