# PowerCast Mobile (Flat Structure Architecture)

React Native application built with **Expo SDK 52**, **TypeScript**, and **NativeWind (Tailwind CSS)** structured according to the **Flat Structure** best practice pattern referenced from DhineshKumar Thirupathi's guide (*"Best Practices for Structuring Your React Native Projects"*).

---

## 📁 Project Architecture: Flat Structure

In a **Flat Structure**, files are categorized by their technical role into broad, top-level directories directly under `src/` without deep nesting:

```text
├── App.tsx                     # Main application entry point & root state router
├── src/
│   ├── assets/                 # Static assets (images, icons, fonts)
│   ├── components/             # Reusable UI components
│   │   ├── Button.tsx          # Reusable styled button with variants & loading state
│   │   ├── Card.tsx            # Card wrapper container component
│   │   ├── Header.tsx          # App bar / screen header component
│   │   └── Input.tsx           # Form input component with label & error handling
│   ├── screens/                # Full screen views
│   │   ├── HomeScreen.tsx      # Main dashboard & telemetry overview
│   │   └── ProfileScreen.tsx   # User profile, credentials & settings
│   ├── services/               # API clients, network requests & authentication
│   │   ├── api.ts              # Generic HTTP client wrapper
│   │   └── auth.ts             # Authentication methods (login, logout, fetch user)
│   ├── utils/                  # Shared helpers and constants
│   │   ├── constants.ts        # App configuration, routes, and constants
│   │   └── helpers.ts          # Utility functions (cn for Tailwind, formatters)
│   ├── hooks/                  # Custom reusable React hooks
│   │   └── useAuth.ts          # Authentication state management hook
│   ├── types/                  # Global TypeScript interfaces & definitions
│   │   └── index.ts            # Type definitions (User, AuthState, ScreenName, etc.)
│   └── styles.css              # NativeWind / Tailwind CSS entry directives
```

### When to Use Flat Structure:
- **Ideal for:** MVPs, prototypes, smaller to medium applications, or when seeking quick navigation without complex folder overhead.
- **Benefits:**
  - Simple, clean mental model with zero nested directory clutter.
  - Highly intuitive file lookup across technical categories (`components`, `screens`, `services`, `utils`).
  - Clear import paths using the `@/*` alias (e.g. `@/components/Button`).

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Start Expo Development Server
```bash
npm start
```

Press `w` in terminal for web preview, `a` for Android emulator, or `i` for iOS simulator.

---

## 🛠 Available Scripts

- `npm run start` - Launch the Expo development server
- `npm run typecheck` - Validate TypeScript types (`tsc --noEmit`)
- `npm run lint` - Run ESLint checks
- `npm run web` - Run in browser
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator
