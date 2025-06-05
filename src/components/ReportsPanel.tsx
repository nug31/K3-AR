import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";

export function ReportsPanel() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [newReport, setNewReport] = useState({
    title: "",
    description: "",
    reportType: "hazard_spotted",
    severity: "medium",
    location: { x: 0, y: 0, area: "Bengkel TKR" },
  });
  const { t } = useLanguage();

  const reports = useQuery(api.reports.listReports, {
    status: filterStatus || undefined
  });
  const myReports = useQuery(api.reports.getMyReports);
  const createReport = useMutation(api.reports.createReport);
  const updateReportStatus = useMutation(api.reports.updateReportStatus);

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReport(newReport);
      toast.success(t('reports.created_success'));
      setShowCreateForm(false);
      setNewReport({
        title: "",
        description: "",
        reportType: "hazard_spotted",
        severity: "medium",
        location: { x: 0, y: 0, area: "Bengkel TKR" },
      });
    } catch (error) {
      toast.error(t('reports.created_error'));
    }
  };

  const handleStatusUpdate = async (reportId: any, status: string) => {
    try {
      await updateReportStatus({ reportId, status });
      toast.success(t('reports.updated_success'));
    } catch (error) {
      toast.error(t('reports.updated_error'));
    }
  };

  if (reports === undefined || myReports === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "reported": return "bg-blue-100 text-blue-800";
      case "investigating": return "bg-yellow-100 text-yellow-800";
      case "resolved": return "bg-green-100 text-green-800";
      case "closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('reports.title')}</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + {t('reports.create_new')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('reports.filter_all')}</option>
            <option value="reported">{t('reports.filter_reported')}</option>
            <option value="investigating">{t('reports.filter_investigating')}</option>
            <option value="resolved">{t('reports.filter_resolved')}</option>
            <option value="closed">{t('reports.filter_closed')}</option>
          </select>
        </div>
      </div>

      {/* Create Report Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">{t('reports.create_new')}</h2>
            <form onSubmit={handleCreateReport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('reports.report_title')}
                </label>
                <input
                  type="text"
                  value={newReport.title}
                  onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('reports.description')}
                </label>
                <textarea
                  value={newReport.description}
                  onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('reports.type')}
                </label>
                <select
                  value={newReport.reportType}
                  onChange={(e) => setNewReport({ ...newReport, reportType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hazard_spotted">{t('report_type.hazard_spotted')}</option>
                  <option value="incident">{t('report_type.incident')}</option>
                  <option value="near_miss">{t('report_type.near_miss')}</option>
                  <option value="safety_concern">{t('report_type.safety_concern')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('reports.severity')}
                </label>
                <select
                  value={newReport.severity}
                  onChange={(e) => setNewReport({ ...newReport, severity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">{t('risk.low')}</option>
                  <option value="medium">{t('risk.medium')}</option>
                  <option value="high">{t('risk.high')}</option>
                  <option value="critical">{t('risk.critical')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('reports.location')}
                </label>
                <select
                  value={newReport.location.area}
                  onChange={(e) => setNewReport({
                    ...newReport,
                    location: { ...newReport.location, area: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Bengkel TKR">{t('location.bengkel_tkr')}</option>
                  <option value="Bengkel Mesin">{t('location.bengkel_mesin')}</option>
                  <option value="Bengkel Elind">{t('location.bengkel_elind')}</option>
                  <option value="Bengkel TSM">{t('location.bengkel_tsm')}</option>
                  <option value="Bengkel TKI">{t('location.bengkel_tki')}</option>
                  <option value="Gudang">{t('location.warehouse')}</option>
                  <option value="Other">{t('location.other')}</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {t('reports.create')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  {t('reports.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{t('reports.filter_all')}</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {reports.map((report) => (
            <div key={report._id} className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{report.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="text-xs text-gray-500">
                      📍 {report.location.area}
                    </span>
                    <span className="text-xs text-gray-500">
                      📅 {new Date(report._creationTime).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {t(`report_type.${report.reportType}`)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2 ml-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(report.severity)}`}>
                    {t(`risk.${report.severity}`)}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}>
                    {t(`reports.status_${report.status}`)}
                  </span>
                  {report.status === "reported" && (
                    <button
                      onClick={() => handleStatusUpdate(report._id, "investigating")}
                      className="text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700"
                    >
                      {t('reports.start_investigation')}
                    </button>
                  )}
                  {report.status === "investigating" && (
                    <button
                      onClick={() => handleStatusUpdate(report._id, "resolved")}
                      className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                    >
                      {t('reports.mark_resolved')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
