# Product

<!-- impeccable:product-schema 1 -->

## Platform

Mobile App

## Users

Grid operations engineers, energy data analysts, and platform administrators managing regional and national energy demand forecasting across desktop workstations and mobile devices in the field or on call.

## Product Purpose

PowerCast is an administrative intelligence and operations console for GRU-based multi-source energy demand forecasting. It enables teams to analyze historical demand and energy mix, audit forecast accuracy against actual consumption, monitor operational risk scores and data anomalies, govern dataset ingestion and quality, supervise live service/pipeline/model health, and control role-based user access.

## Positioning

Unifies GRU neural forecast evaluation (MAE, RMSE, MAPE, horizon residuals, and model drift) directly with upstream dataset freshness/quality pipelines and explainable risk factor attribution in a single mobile-ready operations workspace.

## Operating Context

Used continuously across desk monitors during shift reviews and on mobile phones when responding to anomaly alerts, delayed data pipelines, degraded API endpoints, or urgent reprocess/retrain triggers. Primary UI language is English. Access is gated behind authenticated sign-in with role-based permissions (`Admin`, `Analyst`, `Viewer`).

## Capabilities and Constraints

- **Authentication**: Mandatory sign-in/registration flow before entering the workspace; role-aware actions (`Admin`, `Analyst`, `Viewer`, with self-suspension protection and reason-logged destructive actions).
- **1. Analyze (3 pages)**:
  - `1.1 Overview / Trend`: Shared filters (time range + custom range, granularity, energy type, region/unit, dataset), time-series trend with moving average toggle, min/max/avg & period delta, zoom/export actions, and energy mix (type/region view, previous-period comparison, breakdown table).
  - `1.2 Forecast vs Actual`: Actual vs Forecast overlay chart, MAE / RMSE / MAPE metrics, residual chart, horizon selector (1d / 7d / 30d), model version selector, clickable high-error point inspection, export.
  - `1.3 Risk & Anomaly` (2 tabs): `Risk Score` (composite score + Low/Medium/High/Critical tier, score timeline, signed feature contribution bars, threshold bands, factor drill-down, alert threshold config) and `Anomaly` (detected spikes/drops/flatlines/gaps, expected vs actual, severity, status workflow, notes).
- **2. Data Management (3 pages)**:
  - `2.1 Datasets`: Dataset catalog (source API/File/DB, row count, coverage window, size, active/inactive status, owner, last updated timestamp, freshness status Current/Delayed/Stalled), search/filter/sort, detail drawer, jump to Import.
  - `2.2 Import`: Multi-step wizard (Choose source CSV/Excel/JSON or API -> Map columns -> Preview -> Confirm & run) with mode (Append / Replace / Merge), duplicate handling (Skip / Overwrite), plus Reprocess / Retrain trigger with date window, confirmation modal, live job state lock against double-submit, and operator attribution.
  - `2.3 Data Quality & History` (2 tabs): `Data Quality` (completeness %, missing, duplicates, out-of-range, invalid format, time gaps, row inspector, fix suggestions, report download) and `Import History` (runs, operator, method, succeeded/failed rows, status, error log viewer/download, retry).
- **3. System Status (2 pages)**:
  - `3.1 Health Dashboard`: Global time window (1h / 24h / 7d / custom) & auto-refresh toggle/interval; component status cards for Backend API (uptime, req count, 4xx/5xx, per-endpoint status), Data Pipeline (extract -> clean -> store stages, last/next run, duration, backlog), GRU Model (version, last trained, MAE/RMSE/MAPE, drift trend, Ready/Training/Degraded state), Response Time (Avg / P95 / P99 chart, slowest endpoints, warning threshold), and Forecast Jobs table (ID, start/end, duration, horizon, status, trigger type, view log / rerun / cancel).
  - `3.2 Logs & Errors`: Filterable event stream (Info / Warning / Error / Critical, component API/Pipeline/GRU/Auth, time window, keyword search, New/Acknowledged/Resolved state), bulk/row acknowledge, export, detail drawer.
- **4. User Management (2 pages)**:
  - `4.1 Users`: Search (name, email, user ID), filter (role, status Active/Suspended/Pending, created date, last login), sort & pagination, user detail drawer (profile, permissions, edit history), role-guarded actions (activate, suspend with mandatory reason, change role, reset password, delete with mandatory reason) recorded to audit log.
  - `4.2 Activity Log`: Login/logout/failed login/role change/import/forecast events with timestamp, user, IP, device/browser, result, anomaly highlighting (e.g. repeated failed logins), export, and deep link back to user profile drawer.
- **Technical stack**: Expo SDK 52 + React Native + React Native Web + TypeScript + `react-native-svg` + `lucide-react-native`.

## Brand Commitments

- Brand name: **PowerCast**.
- English UI copy across authentication and all 10 admin pages.
- Standing visual preference: **Modern Soft Minimal — Rounded Enterprise UI** (soft porcelain daylight ground, pure white generously rounded surfaces, soft ambient depth, Manrope + JetBrains Mono typography, refined cobalt & semantic energy palette), replacing the legacy `#050505` near-black theme across Login, Register, and Admin Dashboard.

## Evidence on Hand

- Functional client-side authentication flow (`src/screens/LoginScreen.tsx`, `src/screens/RegisterScreen.tsx`, `src/services/auth.ts`) using synthetic/demo session state; all telemetry, datasets, forecast series, system health metrics, and user records are illustrative client-side operational data until connected to a live backend API.

## Product Principles

1. **Mobile parity without feature loss**: Every filter, chart inspection, table record, wizard step, and administrative action works cleanly with thumb-friendly touch targets (44px+), responsive card/sheet transformations, and zero horizontal-scroll traps on mobile viewports.
2. **Shared filter discipline**: Reusable cross-page filter controls maintain context predictably across sibling views without overwhelming vertical screen real estate on phones.
3. **Drawer-first drilldowns**: Row inspections (anomalies, datasets, error logs, user profiles, high-residual forecast points) open in contextual sheets/drawers rather than stranding operators on dead-end subroutes.
4. **Guarded operational actions**: Destructive or compute-heavy triggers (reprocess, retrain, job cancel, user suspend/delete) require explicit confirmation, prevent duplicate submission while running, and record audit attribution.
