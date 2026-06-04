"use client";

import Link from "next/link";
import Image from "next/image";
import { RegisterForm } from "./register-form";
import { useTranslation } from "@/lib/i18n/use-translation";

export function RegisterPageContent() {
  const { tr, t } = useTranslation();
  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:flex-1 bg-primary items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-foreground/10 mb-6">
              <svg className="w-10 h-10 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-primary-foreground mb-4">{tr(t.auth.trackProgress)}</h3>
            <p className="text-primary-foreground/80">{tr(t.auth.trackSubtitle)}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <Link href="/"><Image src="/logo.png" alt="StudyFlow Logo" width={140} height={50} className="h-16 w-auto mx-auto dark:brightness-0 dark:invert" /></Link>
            <h2 className="mt-6 text-2xl font-bold text-foreground">{tr(t.auth.createAccountBtn)}</h2>
            <p className="mt-2 text-muted-foreground">{tr(t.auth.signInSubtitle)}</p>
          </div>

          <RegisterForm />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {tr(t.auth.haveAccount)}{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              {tr(t.auth.signInLink)}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
