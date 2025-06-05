# 🛡️ K3 AR Safety Application

> **Modern AR-powered Safety Management System with Multi-language Support**

A comprehensive safety management application built with React, TypeScript, and Convex, featuring AR scanning capabilities, real-time reporting, and professional mobile-responsive design.

## ✨ Features

### 🎯 Core Functionality
- **AR Scanner** - Real-time safety hazard detection using camera
- **Multi-language Support** - English and Indonesian (Bahasa Indonesia)
- **Real-time Dashboard** - Live statistics and safety metrics
- **Report Management** - Create, track, and manage safety reports
- **Hazard Management** - Comprehensive hazard tracking system

### 🎨 Design & UX
- **Modern Glassmorphism UI** - Professional design with backdrop blur effects
- **Mobile-First Responsive** - Optimized for all devices and screen sizes
- **Bottom Navigation** - Touch-friendly mobile navigation
- **Gradient Design System** - Consistent color palette and visual hierarchy
- **Smooth Animations** - 60fps performance with CSS transitions

### 🏭 Location Management
- **Bengkel TKR** - TKR Workshop
- **Bengkel Mesin** - Machine Workshop
- **Bengkel Elind** - Elind Workshop
- **Bengkel TSM** - TSM Workshop
- **Bengkel TKI** - TKI Workshop
- **Gudang** - Warehouse
- **Other** - Custom locations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Modern web browser with camera support

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/nug31/K3-AR.git
cd K3-AR
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:5174
```

## 📱 Mobile Experience

The application is fully optimized for mobile devices with:

- **Bottom Navigation Bar** - Easy thumb access
- **Fixed Headers** - Always accessible controls
- **Responsive Cards** - Optimized information density
- **Touch Targets** - 44px minimum for accessibility
- **Adaptive Typography** - Readable on all screen sizes

## 🌐 Multi-language Support

### Supported Languages
- 🇺🇸 **English** - Full interface translation
- 🇮🇩 **Bahasa Indonesia** - Complete Indonesian localization

### Language Features
- Dynamic language switching
- Persistent language preference
- Context-aware translations
- Professional terminology for safety industry

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool and dev server

### Backend & Database
- **Convex** - Real-time backend platform
- **Authentication** - Secure user management
- **Real-time Sync** - Live data updates

## 📊 Application Structure

```
src/
├── components/          # React components
│   ├── ARScanner.tsx   # AR camera interface
│   ├── Dashboard.tsx   # Statistics dashboard
│   ├── ReportsPanel.tsx # Report management
│   └── HazardManagement.tsx # Hazard tracking
├── contexts/           # React contexts
│   └── LanguageContext.tsx # Multi-language support
├── convex/            # Backend functions
└── styles/            # CSS and styling
```

## 🎯 Usage Guide

### 1. Authentication
- Sign in with email/password
- Anonymous access available for testing
- Secure session management

### 2. AR Scanner
- Select workshop location
- Start camera scanning
- Real-time hazard detection
- Capture and report findings

### 3. Dashboard
- View safety statistics
- Monitor active reports
- Track hazard trends
- Export data

### 4. Reports
- Create new safety reports
- Update report status
- Filter by location/date
- Generate summaries

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

This project is connected to the Convex deployment named [`terrific-giraffe-753`](https://dashboard.convex.dev/d/terrific-giraffe-753).

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Convex](https://convex.dev) as backend
- Created with K3AR Safety Framework
- Designed for safety professionals
- Optimized for Indonesian workshop environments

---

**🛡️ Stay Safe, Stay Smart with K3 AR Safety Application**
