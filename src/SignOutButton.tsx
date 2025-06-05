"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useLanguage } from "./contexts/LanguageContext";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const { t } = useLanguage();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      className="px-3 md:px-6 py-2 md:py-3 rounded-full bg-white/20 backdrop-blur-sm text-gray-700 border border-white/30 font-semibold hover:bg-white/30 hover:text-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl hover:transform hover:scale-105"
      onClick={() => void signOut()}
    >
      <span className="flex items-center gap-1 md:gap-2">
        <span>🚪</span>
        <span className="hidden md:inline">{t('auth.sign_out')}</span>
        <span className="md:hidden text-xs">Out</span>
      </span>
    </button>
  );
}
