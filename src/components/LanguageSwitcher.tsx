import { useLanguage } from '../contexts/LanguageContext';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full p-1 border border-white/30">
      <button
        onClick={() => setLanguage('en')}
        className={`px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm font-semibold rounded-full transition-all duration-300 ${
          language === 'en'
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
            : 'text-gray-700 hover:text-blue-600 hover:bg-white/50'
        }`}
      >
        <span className="hidden md:inline">🇺🇸 EN</span>
        <span className="md:hidden">🇺🇸</span>
      </button>
      <button
        onClick={() => setLanguage('id')}
        className={`px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm font-semibold rounded-full transition-all duration-300 ${
          language === 'id'
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
            : 'text-gray-700 hover:text-blue-600 hover:bg-white/50'
        }`}
      >
        <span className="hidden md:inline">🇮🇩 ID</span>
        <span className="md:hidden">🇮🇩</span>
      </button>
    </div>
  );
}
