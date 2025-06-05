import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { ARScanner } from "./components/ARScanner";
import { Dashboard } from "./components/Dashboard";
import { ReportsPanel } from "./components/ReportsPanel";
import { HazardManagement } from "./components/HazardManagement";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { useState } from "react";

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<"ar" | "dashboard" | "reports" | "hazards">("ar");
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Authenticated>
        {/* Desktop Header */}
        <header className="hidden md:block sticky top-0 z-10 glass border-b border-white/20">
          <div className="flex justify-between items-center px-6 h-20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">🛡️</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold gradient-text">{t('app.title')}</h2>
                <p className="text-sm text-gray-600 font-medium">Safety Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <LanguageSwitcher />
              <SignOutButton />
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="md:hidden header-mobile">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-bold">🛡️</span>
              </div>
              <div>
                <h2 className="text-lg font-bold gradient-text">{t('app.title')}</h2>
                <p className="text-xs text-gray-600 font-medium">Safety System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <SignOutButton />
            </div>
          </div>
        </header>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex border-t border-white/20 bg-white/50 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab("ar")}
              className={`flex-1 py-4 px-6 text-sm font-semibold transition-all duration-300 relative ${
                activeTab === "ar"
                  ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                  : "text-gray-700 hover:text-blue-600 hover:bg-white/70"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                🎥 {t('nav.ar_scanner')}
              </span>
              {activeTab === "ar" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-t-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex-1 py-4 px-6 text-sm font-semibold transition-all duration-300 relative ${
                activeTab === "dashboard"
                  ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                  : "text-gray-700 hover:text-blue-600 hover:bg-white/70"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                📊 {t('nav.dashboard')}
              </span>
              {activeTab === "dashboard" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-t-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`flex-1 py-4 px-6 text-sm font-semibold transition-all duration-300 relative ${
                activeTab === "reports"
                  ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                  : "text-gray-700 hover:text-blue-600 hover:bg-white/70"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                📋 {t('nav.reports')}
              </span>
              {activeTab === "reports" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-t-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("hazards")}
              className={`flex-1 py-4 px-6 text-sm font-semibold transition-all duration-300 relative ${
                activeTab === "hazards"
                  ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                  : "text-gray-700 hover:text-blue-600 hover:bg-white/70"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                ⚠️ {t('nav.hazards')}
              </span>
              {activeTab === "hazards" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-t-full"></div>
              )}
            </button>
          </nav>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden mobile-nav">
          <div className="flex justify-around">
            <button
              onClick={() => setActiveTab("ar")}
              className={`mobile-nav-item ${activeTab === "ar" ? "active" : ""}`}
            >
              <span className="mobile-nav-icon">🎥</span>
              <span>AR</span>
            </button>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`mobile-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            >
              <span className="mobile-nav-icon">📊</span>
              <span>{t('nav.dashboard')}</span>
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`mobile-nav-item ${activeTab === "reports" ? "active" : ""}`}
            >
              <span className="mobile-nav-icon">📋</span>
              <span>{t('nav.reports')}</span>
            </button>
            <button
              onClick={() => setActiveTab("hazards")}
              className={`mobile-nav-item ${activeTab === "hazards" ? "active" : ""}`}
            >
              <span className="mobile-nav-icon">⚠️</span>
              <span>{t('nav.hazards')}</span>
            </button>
          </div>
        </nav>

        <main className="flex-1 content-mobile">
          <Content activeTab={activeTab} />
        </main>
      </Authenticated>

      <Unauthenticated>
        <div className="flex items-center justify-center h-full p-8 relative overflow-hidden">
          {/* Background Animation */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
            <div className="absolute top-40 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
          </div>

          <div className="w-full max-w-md mx-auto relative z-10">
            <div className="text-center mb-8">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl animate-float">
                  <span className="text-white text-3xl">🛡️</span>
                </div>
              </div>
              <h1 className="text-5xl font-bold gradient-text mb-4 animate-fade-in-up">
                {t('landing.title')}
              </h1>
              <p className="text-xl text-gray-700 font-medium mb-2">
                {t('landing.subtitle')}
              </p>
              <p className="text-gray-600">
                {t('landing.description')}
              </p>
            </div>
            <div className="card-modern p-8">
              <SignInForm />
            </div>
          </div>
        </div>
      </Unauthenticated>

      <Toaster />
    </div>
  );
}

function Content({ activeTab }: { activeTab: string }) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {activeTab === "ar" && <ARScanner />}
      {activeTab === "dashboard" && <Dashboard />}
      {activeTab === "reports" && <ReportsPanel />}
      {activeTab === "hazards" && <HazardManagement />}
    </div>
  );
}
