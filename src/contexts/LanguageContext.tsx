import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'id';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('k3-language');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('k3-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  useEffect(() => {
    localStorage.setItem('k3-language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Translations object
const translations = {
  en: {
    // Header & Navigation
    'app.title': 'K3 AR Safety',
    'nav.ar_scanner': 'AR Scanner',
    'nav.dashboard': 'Dashboard',
    'nav.reports': 'Reports',
    'nav.hazards': 'Hazards',
    'auth.sign_out': 'Sign out',
    
    // Landing Page
    'landing.title': 'K3 AR Safety System',
    'landing.subtitle': 'Augmented Reality for Workplace Safety',
    'landing.description': 'Detect workplace hazards with AR technology',
    
    // Authentication
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.sign_in': 'Sign in',
    'auth.sign_up': 'Sign up',
    'auth.sign_in_anonymous': 'Sign in anonymously',
    'auth.no_account': "Don't have an account? ",
    'auth.have_account': 'Already have an account? ',
    'auth.sign_up_instead': 'Sign up instead',
    'auth.sign_in_instead': 'Sign in instead',
    'auth.or': 'or',
    'auth.invalid_password': 'Invalid password. Please try again.',
    'auth.sign_in_error': 'Could not sign in, did you mean to sign up?',
    'auth.sign_up_error': 'Could not sign up, did you mean to sign in?',
    
    // Dashboard
    'dashboard.ar_sessions': 'AR Sessions',
    'dashboard.hazards_detected': 'Hazards Detected',
    'dashboard.open_reports': 'Open Reports',
    'dashboard.hazard_distribution': 'Hazard Distribution by Risk Level',
    'dashboard.recent_reports': 'Recent Reports',
    'dashboard.no_reports': 'No recent reports',
    'dashboard.view_all': 'View All Reports',
    
    // AR Scanner
    'ar.start_scanning': 'Start AR Scanning',
    'ar.stop_scanning': 'Stop Scanning',
    'ar.location': 'Location',
    'ar.detected_hazards': 'Detected Hazards',
    'ar.no_hazards': 'No hazards detected in current view',
    'ar.camera_access': 'Camera access required for AR scanning',
    'ar.enable_camera': 'Enable Camera',
    'ar.hazard_detected': 'Hazard Detected',
    'ar.hazards_found': 'hazards found',
    'ar.scanning_environment': 'Scanning environment',
    
    // Reports
    'reports.title': 'Safety Reports',
    'reports.create_new': 'Create New Report',
    'reports.filter_all': 'All Reports',
    'reports.filter_reported': 'Reported',
    'reports.filter_investigating': 'Investigating',
    'reports.filter_resolved': 'Resolved',
    'reports.no_reports': 'No reports found',
    'reports.report_title': 'Report Title',
    'reports.description': 'Description',
    'reports.type': 'Report Type',
    'reports.severity': 'Severity',
    'reports.location': 'Location',
    'reports.create': 'Create Report',
    'reports.cancel': 'Cancel',
    'reports.created_success': 'Report created successfully',
    'reports.created_error': 'Failed to create report',
    'reports.updated_success': 'Report status updated successfully',
    'reports.updated_error': 'Failed to update report status',
    'reports.filter_closed': 'Closed',
    'reports.status_reported': 'Reported',
    'reports.status_investigating': 'Investigating',
    'reports.status_resolved': 'Resolved',
    'reports.status_closed': 'Closed',
    'reports.start_investigation': 'Start Investigation',
    'reports.mark_resolved': 'Mark Resolved',
    
    // Hazards
    'hazards.title': 'Hazard Management',
    'hazards.create_new': 'Create New Hazard',
    'hazards.filter_category': 'Filter by Category',
    'hazards.filter_area': 'Filter by Area',
    'hazards.all_categories': 'All Categories',
    'hazards.all_areas': 'All Areas',
    'hazards.no_hazards': 'No hazards found',
    'hazards.name': 'Hazard Name',
    'hazards.description': 'Description',
    'hazards.category': 'Category',
    'hazards.risk_level': 'Risk Level',
    'hazards.detection_keywords': 'Detection Keywords',
    'hazards.safety_measures': 'Safety Measures',
    'hazards.add_keyword': 'Add Keyword',
    'hazards.add_measure': 'Add Safety Measure',
    'hazards.create': 'Create Hazard',
    'hazards.cancel': 'Cancel',
    'hazards.active': 'Active',
    'hazards.inactive': 'Inactive',
    'hazards.created_success': 'Hazard created successfully',
    'hazards.created_error': 'Failed to create hazard',
    'hazards.updated_success': 'Hazard updated successfully',
    'hazards.updated_error': 'Failed to update hazard',
    'hazards.activated': 'activated',
    'hazards.deactivated': 'deactivated',
    'hazards.create_first': 'Create your first hazard to get started.',
    
    // Risk Levels
    'risk.low': 'Low',
    'risk.medium': 'Medium',
    'risk.high': 'High',
    'risk.critical': 'Critical',
    
    // Categories
    'category.physical': 'Physical',
    'category.chemical': 'Chemical',
    'category.biological': 'Biological',
    'category.ergonomic': 'Ergonomic',
    'category.psychosocial': 'Psychosocial',
    'category.electrical': 'Electrical',
    
    // Report Types
    'report_type.hazard_spotted': 'Hazard Spotted',
    'report_type.near_miss': 'Near Miss',
    'report_type.incident': 'Incident',
    'report_type.safety_concern': 'Safety Concern',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.close': 'Close',
    'common.confirm': 'Confirm',
    'common.search': 'Search',
    'common.filter': 'Filter',

    // Locations
    'location.bengkel_tkr': 'TKR Workshop',
    'location.bengkel_mesin': 'Machine Workshop',
    'location.bengkel_elind': 'Elind Workshop',
    'location.bengkel_tsm': 'TSM Workshop',
    'location.bengkel_tki': 'TKI Workshop',
    'location.warehouse': 'Warehouse',
    'location.other': 'Other',
  },
  id: {
    // Header & Navigation
    'app.title': 'K3 AR Safety',
    'nav.ar_scanner': 'Pemindai AR',
    'nav.dashboard': 'Dasbor',
    'nav.reports': 'Laporan',
    'nav.hazards': 'Bahaya',
    'auth.sign_out': 'Keluar',
    
    // Landing Page
    'landing.title': 'Sistem K3 AR Safety',
    'landing.subtitle': 'Augmented Reality untuk Keselamatan Kerja',
    'landing.description': 'Deteksi bahaya di tempat kerja dengan teknologi AR',
    
    // Authentication
    'auth.email': 'Email',
    'auth.password': 'Kata Sandi',
    'auth.sign_in': 'Masuk',
    'auth.sign_up': 'Daftar',
    'auth.sign_in_anonymous': 'Masuk sebagai anonim',
    'auth.no_account': 'Belum punya akun? ',
    'auth.have_account': 'Sudah punya akun? ',
    'auth.sign_up_instead': 'Daftar sebagai gantinya',
    'auth.sign_in_instead': 'Masuk sebagai gantinya',
    'auth.or': 'atau',
    'auth.invalid_password': 'Kata sandi tidak valid. Silakan coba lagi.',
    'auth.sign_in_error': 'Tidak dapat masuk, apakah Anda bermaksud mendaftar?',
    'auth.sign_up_error': 'Tidak dapat mendaftar, apakah Anda bermaksud masuk?',
    
    // Dashboard
    'dashboard.ar_sessions': 'Sesi AR',
    'dashboard.hazards_detected': 'Bahaya Terdeteksi',
    'dashboard.open_reports': 'Laporan Terbuka',
    'dashboard.hazard_distribution': 'Distribusi Bahaya berdasarkan Tingkat Risiko',
    'dashboard.recent_reports': 'Laporan Terbaru',
    'dashboard.no_reports': 'Tidak ada laporan terbaru',
    'dashboard.view_all': 'Lihat Semua Laporan',
    
    // AR Scanner
    'ar.start_scanning': 'Mulai Pemindaian AR',
    'ar.stop_scanning': 'Hentikan Pemindaian',
    'ar.location': 'Lokasi',
    'ar.detected_hazards': 'Bahaya Terdeteksi',
    'ar.no_hazards': 'Tidak ada bahaya terdeteksi dalam tampilan saat ini',
    'ar.camera_access': 'Akses kamera diperlukan untuk pemindaian AR',
    'ar.enable_camera': 'Aktifkan Kamera',
    'ar.hazard_detected': 'Bahaya Terdeteksi',
    'ar.hazards_found': 'bahaya ditemukan',
    'ar.scanning_environment': 'Memindai lingkungan',
    
    // Reports
    'reports.title': 'Laporan Keselamatan',
    'reports.create_new': 'Buat Laporan Baru',
    'reports.filter_all': 'Semua Laporan',
    'reports.filter_reported': 'Dilaporkan',
    'reports.filter_investigating': 'Diselidiki',
    'reports.filter_resolved': 'Diselesaikan',
    'reports.no_reports': 'Tidak ada laporan ditemukan',
    'reports.report_title': 'Judul Laporan',
    'reports.description': 'Deskripsi',
    'reports.type': 'Jenis Laporan',
    'reports.severity': 'Tingkat Keparahan',
    'reports.location': 'Lokasi',
    'reports.create': 'Buat Laporan',
    'reports.cancel': 'Batal',
    'reports.created_success': 'Laporan berhasil dibuat',
    'reports.created_error': 'Gagal membuat laporan',
    'reports.updated_success': 'Status laporan berhasil diperbarui',
    'reports.updated_error': 'Gagal memperbarui status laporan',
    'reports.filter_closed': 'Ditutup',
    'reports.status_reported': 'Dilaporkan',
    'reports.status_investigating': 'Diselidiki',
    'reports.status_resolved': 'Diselesaikan',
    'reports.status_closed': 'Ditutup',
    'reports.start_investigation': 'Mulai Investigasi',
    'reports.mark_resolved': 'Tandai Selesai',
    
    // Hazards
    'hazards.title': 'Manajemen Bahaya',
    'hazards.create_new': 'Buat Bahaya Baru',
    'hazards.filter_category': 'Filter berdasarkan Kategori',
    'hazards.filter_area': 'Filter berdasarkan Area',
    'hazards.all_categories': 'Semua Kategori',
    'hazards.all_areas': 'Semua Area',
    'hazards.no_hazards': 'Tidak ada bahaya ditemukan',
    'hazards.name': 'Nama Bahaya',
    'hazards.description': 'Deskripsi',
    'hazards.category': 'Kategori',
    'hazards.risk_level': 'Tingkat Risiko',
    'hazards.detection_keywords': 'Kata Kunci Deteksi',
    'hazards.safety_measures': 'Langkah Keselamatan',
    'hazards.add_keyword': 'Tambah Kata Kunci',
    'hazards.add_measure': 'Tambah Langkah Keselamatan',
    'hazards.create': 'Buat Bahaya',
    'hazards.cancel': 'Batal',
    'hazards.active': 'Aktif',
    'hazards.inactive': 'Tidak Aktif',
    'hazards.created_success': 'Bahaya berhasil dibuat',
    'hazards.created_error': 'Gagal membuat bahaya',
    'hazards.updated_success': 'Bahaya berhasil diperbarui',
    'hazards.updated_error': 'Gagal memperbarui bahaya',
    'hazards.activated': 'diaktifkan',
    'hazards.deactivated': 'dinonaktifkan',
    'hazards.create_first': 'Buat bahaya pertama Anda untuk memulai.',
    
    // Risk Levels
    'risk.low': 'Rendah',
    'risk.medium': 'Sedang',
    'risk.high': 'Tinggi',
    'risk.critical': 'Kritis',
    
    // Categories
    'category.physical': 'Fisik',
    'category.chemical': 'Kimia',
    'category.biological': 'Biologis',
    'category.ergonomic': 'Ergonomis',
    'category.psychosocial': 'Psikososial',
    'category.electrical': 'Listrik',
    
    // Report Types
    'report_type.hazard_spotted': 'Bahaya Terlihat',
    'report_type.near_miss': 'Nyaris Celaka',
    'report_type.incident': 'Insiden',
    'report_type.safety_concern': 'Kekhawatiran Keselamatan',
    
    // Common
    'common.loading': 'Memuat...',
    'common.save': 'Simpan',
    'common.edit': 'Edit',
    'common.delete': 'Hapus',
    'common.close': 'Tutup',
    'common.confirm': 'Konfirmasi',
    'common.search': 'Cari',
    'common.filter': 'Filter',

    // Locations
    'location.bengkel_tkr': 'Bengkel TKR',
    'location.bengkel_mesin': 'Bengkel Mesin',
    'location.bengkel_elind': 'Bengkel Elind',
    'location.bengkel_tsm': 'Bengkel TSM',
    'location.bengkel_tki': 'Bengkel TKI',
    'location.warehouse': 'Gudang',
    'location.other': 'Lainnya',
  }
};
