import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../contexts/LanguageContext";

export function Dashboard() {
  const arStats = useQuery(api.ar.getARSessionStats, { timeRange: "week" });
  const recentReports = useQuery(api.reports.listReports, { status: "reported" });
  const hazards = useQuery(api.hazards.listHazards, {});
  const { t } = useLanguage();

  if (arStats === undefined || recentReports === undefined || hazards === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const hazardsByRisk = hazards.reduce((acc, hazard) => {
    acc[hazard.riskLevel] = (acc[hazard.riskLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const reportsBySeverity = recentReports.reduce((acc, report) => {
    acc[report.severity] = (acc[report.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
          <span className="text-white text-lg md:text-xl">📊</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-bold gradient-text">{t('nav.dashboard')}</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <div className="card-modern p-3 md:p-6 group hover:scale-105 transition-all duration-300">
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <div className="p-2 md:p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl md:rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 mb-2 md:mb-0">
              <span className="text-xl md:text-3xl">🎥</span>
            </div>
            <div className="md:ml-6 text-center md:text-left">
              <p className="text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wide">{t('dashboard.ar_sessions')}</p>
              <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1">{arStats.totalSessions}</p>
              <div className="w-full bg-blue-100 rounded-full h-1 md:h-2 mt-2 md:mt-3">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 md:h-2 rounded-full" style={{width: '75%'}}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-modern p-3 md:p-6 group hover:scale-105 transition-all duration-300">
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <div className="p-2 md:p-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl md:rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 mb-2 md:mb-0">
              <span className="text-xl md:text-3xl">⚠️</span>
            </div>
            <div className="md:ml-6 text-center md:text-left">
              <p className="text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wide">{t('dashboard.hazards_detected')}</p>
              <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1">{arStats.totalHazardsDetected}</p>
              <div className="w-full bg-yellow-100 rounded-full h-1 md:h-2 mt-2 md:mt-3">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-1 md:h-2 rounded-full" style={{width: '60%'}}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-modern p-3 md:p-6 group hover:scale-105 transition-all duration-300">
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <div className="p-2 md:p-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl md:rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 mb-2 md:mb-0">
              <span className="text-xl md:text-3xl">📋</span>
            </div>
            <div className="md:ml-6 text-center md:text-left">
              <p className="text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wide">{t('dashboard.open_reports')}</p>
              <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1">{recentReports.length}</p>
              <div className="w-full bg-red-100 rounded-full h-1 md:h-2 mt-2 md:mt-3">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 h-1 md:h-2 rounded-full" style={{width: '45%'}}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-modern p-3 md:p-6 group hover:scale-105 transition-all duration-300">
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <div className="p-2 md:p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl md:rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 mb-2 md:mb-0">
              <span className="text-xl md:text-3xl">🛡️</span>
            </div>
            <div className="md:ml-6 text-center md:text-left">
              <p className="text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wide">{t('nav.hazards')}</p>
              <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1">{hazards.length}</p>
              <div className="w-full bg-green-100 rounded-full h-1 md:h-2 mt-2 md:mt-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-1 md:h-2 rounded-full" style={{width: '85%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hazards by Risk Level */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.hazard_distribution')}</h3>
          <div className="space-y-3">
            {Object.entries(hazardsByRisk).map(([risk, count]) => (
              <div key={risk} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    risk === "critical" ? "bg-red-500" :
                    risk === "high" ? "bg-orange-500" :
                    risk === "medium" ? "bg-yellow-500" :
                    "bg-green-500"
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">{t(`risk.${risk}`)}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reports by Severity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.severity')}</h3>
          <div className="space-y-3">
            {Object.entries(reportsBySeverity).map(([severity, count]) => (
              <div key={severity} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    severity === "critical" ? "bg-red-500" :
                    severity === "high" ? "bg-orange-500" :
                    severity === "medium" ? "bg-yellow-500" :
                    "bg-green-500"
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">{t(`risk.${severity}`)}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.recent_reports')}</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentReports.slice(0, 5).map((report) => (
            <div key={report._id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{report.title}</h4>
                  <p className="text-sm text-gray-600">{report.description}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="text-xs text-gray-500">
                      📍 {report.location.area}
                    </span>
                    <span className="text-xs text-gray-500">
                      📅 {new Date(report._creationTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    report.severity === "critical" ? "bg-red-100 text-red-800" :
                    report.severity === "high" ? "bg-orange-100 text-orange-800" :
                    report.severity === "medium" ? "bg-yellow-100 text-yellow-800" :
                    "bg-green-100 text-green-800"
                  }`}>
                    {t(`risk.${report.severity}`)}
                  </span>
                  <span className="text-xs text-gray-500">{t(`report_type.${report.reportType}`)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
