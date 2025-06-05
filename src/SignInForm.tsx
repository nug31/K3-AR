"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "./contexts/LanguageContext";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="w-full">
      <form
        className="flex flex-col gap-form-field"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitting(true);
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set("flow", flow);
          void signIn("password", formData).catch((error) => {
            let toastTitle = "";
            if (error.message.includes("Invalid password")) {
              toastTitle = t('auth.invalid_password');
            } else {
              toastTitle =
                flow === "signIn"
                  ? t('auth.sign_in_error')
                  : t('auth.sign_up_error');
            }
            toast.error(toastTitle);
            setSubmitting(false);
          });
        }}
      >
        <div className="space-y-4">
          <div className="relative">
            <input
              className="input-modern w-full pl-12"
              type="email"
              name="email"
              placeholder={t('auth.email')}
              required
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              📧
            </div>
          </div>
          <div className="relative">
            <input
              className="input-modern w-full pl-12"
              type="password"
              name="password"
              placeholder={t('auth.password')}
              required
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔒
            </div>
          </div>
        </div>
        <button className="btn-primary w-full mt-6" type="submit" disabled={submitting}>
          {submitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="loading-spinner w-5 h-5"></div>
              <span>Loading...</span>
            </div>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {flow === "signIn" ? "🚀" : "✨"} {flow === "signIn" ? t('auth.sign_in') : t('auth.sign_up')}
            </span>
          )}
        </button>
        <div className="text-center text-sm text-secondary">
          <span>
            {flow === "signIn"
              ? t('auth.no_account')
              : t('auth.have_account')}
          </span>
          <button
            type="button"
            className="text-primary hover:text-primary-hover hover:underline font-medium cursor-pointer"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? t('auth.sign_up_instead') : t('auth.sign_in_instead')}
          </button>
        </div>
      </form>
      <div className="flex items-center justify-center my-3">
        <hr className="my-4 grow border-gray-200" />
        <span className="mx-4 text-secondary">{t('auth.or')}</span>
        <hr className="my-4 grow border-gray-200" />
      </div>
      <button className="btn-secondary w-full" onClick={() => void signIn("anonymous")}>
        <span className="flex items-center justify-center gap-2">
          👤 {t('auth.sign_in_anonymous')}
        </span>
      </button>
    </div>
  );
}
