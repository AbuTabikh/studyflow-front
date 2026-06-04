import { RegisterPageContent } from "@/components/auth/register-page-content";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | StudyFlow",
  description: "Create a StudyFlow account to start organizing your academic journey.",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return <RegisterPageContent />;
}
