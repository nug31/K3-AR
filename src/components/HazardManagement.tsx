import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";

export function HazardManagement() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterArea, setFilterArea] = useState<string>("");
  const [newHazard, setNewHazard] = useState({
    name: "",
    description: "",
    category: "physical",
    riskLevel: "medium",
    location: { x: 0, y: 0, area: "Bengkel TKR" },
    detectionKeywords: [""],
    safetyMeasures: [""],
  });
  const { t } = useLanguage();

  const hazards = useQuery(api.hazards.listHazards, {
    category: filterCategory || undefined,
    area: filterArea || undefined,
  });
  const createHazard = useMutation(api.hazards.createHazard);
  const updateHazard = useMutation(api.hazards.updateHazard);

  const handleCreateHazard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const hazardData = {
        ...newHazard,
        detectionKeywords: newHazard.detectionKeywords.filter(k => k.trim() !== ""),
        safetyMeasures: newHazard.safetyMeasures.filter(m => m.trim() !== ""),
      };
      await createHazard(hazardData);
      toast.success(t('hazards.created_success'));
      setShowCreateForm(false);
      setNewHazard({
        name: "",
        description: "",
        category: "physical",
        riskLevel: "medium",
        location: { x: 0, y: 0, area: "Bengkel TKR" },
        detectionKeywords: [""],
        safetyMeasures: [""],
      });
    } catch (error) {
      toast.error(t('hazards.created_error'));
    }
  };

  const handleToggleActive = async (hazardId: any, isActive: boolean) => {
    try {
      await updateHazard({
        hazardId,
        updates: { isActive: !isActive },
      });
      toast.success(`${t('nav.hazards')} ${!isActive ? t('hazards.activated') : t('hazards.deactivated')}`);
    } catch (error) {
      toast.error(t('hazards.updated_error'));
    }
  };

  const addKeyword = () => {
    setNewHazard({
      ...newHazard,
      detectionKeywords: [...newHazard.detectionKeywords, ""],
    });
  };

  const removeKeyword = (index: number) => {
    setNewHazard({
      ...newHazard,
      detectionKeywords: newHazard.detectionKeywords.filter((_, i) => i !== index),
    });
  };

  const updateKeyword = (index: number, value: string) => {
    const updated = [...newHazard.detectionKeywords];
    updated[index] = value;
    setNewHazard({ ...newHazard, detectionKeywords: updated });
  };

  const addSafetyMeasure = () => {
    setNewHazard({
      ...newHazard,
      safetyMeasures: [...newHazard.safetyMeasures, ""],
    });
  };

  const removeSafetyMeasure = (index: number) => {
    setNewHazard({
      ...newHazard,
      safetyMeasures: newHazard.safetyMeasures.filter((_, i) => i !== index),
    });
  };

  const updateSafetyMeasure = (index: number, value: string) => {
    const updated = [...newHazard.safetyMeasures];
    updated[index] = value;
    setNewHazard({ ...newHazard, safetyMeasures: updated });
  };

  if (hazards === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "critical": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "electrical": return "⚡";
      case "chemical": return "🧪";
      case "physical": return "🔧";
      case "biological": return "🦠";
      case "ergonomic": return "🏃";
      default: return "⚠️";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('hazards.title')}</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + {t('hazards.create_new')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('hazards.all_categories')}</option>
            <option value="electrical">{t('category.electrical')}</option>
            <option value="chemical">{t('category.chemical')}</option>
            <option value="physical">{t('category.physical')}</option>
            <option value="biological">{t('category.biological')}</option>
            <option value="ergonomic">{t('category.ergonomic')}</option>
          </select>
          <select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('hazards.all_areas')}</option>
            <option value="Bengkel TKR">{t('location.bengkel_tkr')}</option>
            <option value="Bengkel Mesin">{t('location.bengkel_mesin')}</option>
            <option value="Bengkel Elind">{t('location.bengkel_elind')}</option>
            <option value="Bengkel TSM">{t('location.bengkel_tsm')}</option>
            <option value="Bengkel TKI">{t('location.bengkel_tki')}</option>
            <option value="Gudang">{t('location.warehouse')}</option>
            <option value="Other">{t('location.other')}</option>
          </select>
        </div>
      </div>

      {/* Create Hazard Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">{t('hazards.create_new')}</h2>
            <form onSubmit={handleCreateHazard} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('hazards.name')}
                  </label>
                  <input
                    type="text"
                    value={newHazard.name}
                    onChange={(e) => setNewHazard({ ...newHazard, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('hazards.category')}
                  </label>
                  <select
                    value={newHazard.category}
                    onChange={(e) => setNewHazard({ ...newHazard, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="electrical">{t('category.electrical')}</option>
                    <option value="chemical">{t('category.chemical')}</option>
                    <option value="physical">{t('category.physical')}</option>
                    <option value="biological">{t('category.biological')}</option>
                    <option value="ergonomic">{t('category.ergonomic')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('hazards.description')}
                </label>
                <textarea
                  value={newHazard.description}
                  onChange={(e) => setNewHazard({ ...newHazard, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('hazards.risk_level')}
                  </label>
                  <select
                    value={newHazard.riskLevel}
                    onChange={(e) => setNewHazard({ ...newHazard, riskLevel: e.target.value })}
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
                    value={newHazard.location.area}
                    onChange={(e) => setNewHazard({
                      ...newHazard,
                      location: { ...newHazard.location, area: e.target.value }
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('hazards.detection_keywords')}
                </label>
                {newHazard.detectionKeywords.map((keyword, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => updateKeyword(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter keyword"
                    />
                    <button
                      type="button"
                      onClick={() => removeKeyword(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addKeyword}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + {t('hazards.add_keyword')}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('hazards.safety_measures')}
                </label>
                {newHazard.safetyMeasures.map((measure, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={measure}
                      onChange={(e) => updateSafetyMeasure(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter safety measure"
                    />
                    <button
                      type="button"
                      onClick={() => removeSafetyMeasure(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSafetyMeasure}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + {t('hazards.add_measure')}
                </button>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {t('hazards.create')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  {t('hazards.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hazards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hazards.map((hazard) => (
          <div key={hazard._id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getCategoryIcon(hazard.category)}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{hazard.name}</h3>
                  <p className="text-sm text-gray-600">{t(`category.${hazard.category}`)}</p>
                </div>
              </div>
              <button
                onClick={() => handleToggleActive(hazard._id, hazard.isActive)}
                className={`px-2 py-1 text-xs rounded ${
                  hazard.isActive 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {hazard.isActive ? t('hazards.active') : t('hazards.inactive')}
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-3">{hazard.description}</p>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Risk Level:</span>
                <span className={`px-2 py-1 text-xs rounded ${getRiskColor(hazard.riskLevel)}`}>
                  {t(`risk.${hazard.riskLevel}`).toUpperCase()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Location:</span>
                <span className="text-xs text-gray-700">{hazard.location.area}</span>
              </div>

              <div>
                <span className="text-xs text-gray-500">Keywords:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {hazard.detectionKeywords.slice(0, 3).map((keyword, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {keyword}
                    </span>
                  ))}
                  {hazard.detectionKeywords.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{hazard.detectionKeywords.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-500">Safety Measures:</span>
                <div className="mt-1">
                  {hazard.safetyMeasures.slice(0, 2).map((measure, index) => (
                    <div key={index} className="text-xs text-gray-700">
                      • {measure}
                    </div>
                  ))}
                  {hazard.safetyMeasures.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{hazard.safetyMeasures.length - 2} more measures
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hazards.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('hazards.no_hazards')}</h3>
          <p className="text-gray-600">{t('hazards.create_first')}</p>
        </div>
      )}
    </div>
  );
}
