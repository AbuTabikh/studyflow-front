"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, BookOpen, ListTodo, Route, Settings,
  LogOut, Menu, X, Brain, School, CalendarDays,
} from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useAppState } from "@/hooks/use-app-state";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { useTranslation } from "@/lib/i18n/use-translation";
import { LangSwitcher } from "@/components/ui/lang-switcher";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { state } = useAppState();
  const { tr, t, isRtl } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const user = state.userProfile;

  const navItems = [
    { href: "/dashboard",         label: tr(t.nav.dashboard),         icon: LayoutDashboard },
    { href: "/academic-planning", label: tr(t.nav.academicPlanning),   icon: School },
    { href: "/courses",           label: tr(t.nav.courses),            icon: BookOpen },
    { href: "/tasks",             label: tr(t.nav.tasks),              icon: ListTodo },
    { href: "/calendar",          label: tr(t.nav.calendar),           icon: CalendarDays },
    { href: "/self-learning",     label: tr(t.nav.selfLearning),       icon: Route },
    { href: "/reflections",       label: tr(t.nav.reflections),        icon: Brain },
  ];

  const handleLogout = () => {
    localStorage.removeItem("studyflow_setup_complete");
    localStorage.removeItem("studyflow_user_data");
    window.location.href = "/";
  };

  return (
    <>
      <button
        className={`lg:hidden fixed top-4 z-50 p-2 bg-card rounded-lg border border-border shadow-sm ${isRtl ? "right-4" : "left-4"}`}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-foreground/20 z-40" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn(
        "fixed top-0 z-40 h-screen w-64 bg-card transition-transform duration-300",
        isRtl ? "right-0 border-l border-border" : "left-0 border-r border-border",
        mobileOpen ? "translate-x-0" : isRtl ? "translate-x-full lg:translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-border">
            <Link href="/dashboard">
              <Image src="/logo.png" alt="StudyFlow Logo" width={140} height={50} className="h-12 w-auto dark:brightness-0 dark:invert" />
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border space-y-2">
            <div className="flex justify-center pb-1">
              <LangSwitcher />
            </div>
            <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors group">
              <UserAvatar profile={user} className="h-8 w-8 group-hover:ring-2 group-hover:ring-primary/20 transition-all" />
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-foreground truncate">{user.name || tr(t.nav.dashboard)}</span>
                <span className="text-[10px] text-muted-foreground truncate uppercase tracking-wider">{user.major || ""}</span>
              </div>
              <Settings className="h-4 w-4 opacity-50" />
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-4 py-3 h-auto text-sm font-medium text-muted-foreground hover:bg-muted hover:text-red-600 transition-colors"
              onClick={() => setIsLogoutDialogOpen(true)}
            >
              <LogOut className="h-5 w-5" />
              {tr(t.nav.logout)}
            </Button>
          </div>
        </div>
      </aside>

      <ConfirmActionDialog
        isOpen={isLogoutDialogOpen}
        title={tr(t.confirm.areYouSure)}
        description={tr(t.confirm.logout)}
        confirmText={tr(t.actions.logout)}
        icon={<LogOut className="h-6 w-6" />}
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutDialogOpen(false)}
      />
    </>
  );
}
