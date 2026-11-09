---
name: PowerCast Admin Console
description: Modern Soft Minimal enterprise design system for GRU energy demand forecasting across mobile and desktop.
colors:
  cobalt-primary: "#1D4ED8"
  cobalt-bright: "#2563EB"
  cobalt-deep: "#1E40AF"
  cobalt-mist: "#EFF6FF"
  cobalt-border: "#BFDBFE"
  emerald-renewables: "#0D9488"
  violet-gas: "#6D28D9"
  amber-oil: "#B45309"
  emerald-ink: "#065F46"
  emerald-bg: "#ECFDF5"
  amber-ink: "#92400E"
  amber-bg: "#FFFBEB"
  rose-ink: "#9F1239"
  rose-bg: "#FFF1F2"
  porcelain-canvas: "#F5F7FB"
  pure-surface: "#FFFFFF"
  recessed-well: "#F8FAFD"
  muted-track: "#EEF2F8"
  whisper-border: "#E2E8F2"
  strong-border: "#CBD5E4"
  slate-ink: "#0F172A"
  slate-body: "#334155"
  slate-meta: "#526077"
typography:
  display:
    fontFamily: "Manrope_600SemiBold, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.875rem, 4.2vw, 3.25rem)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Manrope_600SemiBold, Helvetica Neue, Arial, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.21
    letterSpacing: "-0.7px"
  title:
    fontFamily: "Manrope_600SemiBold, Helvetica Neue, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.38
    letterSpacing: "-0.2px"
  body:
    fontFamily: "Manrope_400Regular, Helvetica Neue, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.53
  label:
    fontFamily: "JetBrainsMono_500Medium, SFMono-Regular, Menlo, monospace"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.38
rounded:
  xs: "8px"
  sm: "12px"
  md: "14px"
  lg: "18px"
  card: "20px"
  sheet: "26px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  gutter-narrow: "16px"
  gutter-medium: "24px"
  gutter-wide: "36px"
components:
  button-primary:
    backgroundColor: "{colors.cobalt-primary}"
    textColor: "{colors.pure-surface}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.cobalt-deep}"
  button-secondary:
    backgroundColor: "{colors.pure-surface}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.pill}"
    padding: "9px 15px"
    height: "42px"
  button-danger:
    backgroundColor: "{colors.rose-bg}"
    textColor: "{colors.rose-ink}"
    rounded: "{rounded.pill}"
    padding: "9px 15px"
  card-surface:
    backgroundColor: "{colors.pure-surface}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.card}"
    padding: "20px"
  input-field:
    backgroundColor: "{colors.recessed-well}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
    height: "56px"
  chip-status-success:
    backgroundColor: "{colors.emerald-bg}"
    textColor: "{colors.emerald-ink}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
---

# Design System: PowerCast Admin Console

## Overview

**Creative North Star: "The Daylight Dispatch Studio"**

PowerCast's interface embodies a **Modern Soft Minimal — Rounded Enterprise UI** tailored for high-stakes GRU energy forecasting across desktop monitors and mobile field devices. Rather than resorting to fatiguing near-black neon control rooms or rigid, boxy legacy spreadsheets, the system pairs a calm porcelain-mist daylight canvas with crisp white rounded panels, tactile capsule controls, and high-contrast typographic hierarchy.

Density is calibrated for rapid operational scanning: primary work areas breathe inside generous rounded containers while interior data rows divide cleanly via 1px hairlines and recessed wells without nested card clutter. Every interactive element scales gracefully from pointer-driven desktop tables and right-hand drawers to thumb-friendly mobile bottom navigation, horizontal sub-page strips, and bottom sheets.

**Key Characteristics:**
- Soft porcelain daylight ground paired with pure white rounded panels and subtle slate offset shadows.
- Warm geometric-humanist UI typography (Manrope) paired with tabular monospaced numerals (JetBrains Mono) for GW, MAE/RMSE/MAPE, and timestamps.
- Persistent per-carrier color identity across all charts, mixes, and filters (Cobalt Electricity, Emerald-Teal Renewables, Violet Gas, Amber Oil).
- Mobile-first adaptive ergonomics with 44px+ touch targets, bottom sheet filter consolidation, and card-transformed data records.
- Deliberate spatial isolation and reason-gated confirmation for destructive or compute-intensive actions.

## Colors

A daylight-first enterprise palette anchored by cool porcelain neutrals, an authoritative cobalt action voice, dedicated energy-carrier series hues, and WCAG AA+ semantic status tints.

### Primary
- **Cobalt Primary** (`#1D4ED8`): Primary action buttons, active mobile sub-page capsules, focus rings, and selected control indicators.
- **Cobalt Bright** (`#2563EB`): Primary metered electricity curve and interactive chart highlights.
- **Cobalt Deep** (`#1E40AF`): Hover/pressed primary button state and informational badge ink.
- **Cobalt Mist** (`#EFF6FF`): Active sidebar pill fill, selected picker rows, and subtle selection highlights.

### Secondary
- **Emerald Renewables** (`#0D9488`): Renewables energy series, moving-average reference curves, and avg-latency lines.
- **Violet Gas** (`#6D28D9`): Natural gas energy series and GRU forecast overlay curves.
- **Amber Oil** (`#B45309`): Fuel oil / thermal reserve series and P99 latency curves.

### Tertiary
- **Emerald Ink & Wash** (`#065F46` / `#ECFDF5`): Operational, Current, Active, Succeeded, and risk-mitigating states.
- **Amber Ink & Wash** (`#92400E` / `#FFFBEB`): Delayed, Slow, Partial, Pending, and Medium-risk states.
- **Rose Ink & Wash** (`#9F1239` / `#FFF1F2`): Critical anomalies, Stalled feeds, Failed jobs, Suspended users, and isolated danger zones.

### Neutral
- **Porcelain Canvas** (`#F5F7FB`): App-wide background canvas providing calm contrast beneath white panels.
- **Pure Surface** (`#FFFFFF`): Elevated cards, navigation rails, modals, and drawers.
- **Recessed Well** (`#F8FAFD`): Input fields, SVG chart backdrops, and key-value telemetry cells.
- **Muted Track** (`#EEF2F8`): Segmented tab tracks, preset pill wells, and disabled fills.
- **Whisper & Strong Borders** (`#E2E8F2` / `#CBD5E4`): 1px structural hairlines and interactive control borders.
- **Slate Ink, Body & Meta** (`#0F172A` / `#334155` / `#526077`): Three-tier text hierarchy maintaining >= 4.5:1 contrast across light surfaces.

### Named Rules
**The Carrier Constancy Rule.** Each energy source owns one fixed hue across every chart, filter, and badge (Electricity Cobalt, Renewables Emerald-Teal, Gas Violet, Oil Amber); never repurpose those hues randomly across adjacent charts.

**The Tinted Status Ink Rule.** Semantic status pills pair a soft pastel wash with deep hue-matched ink (`#065F46`, `#92400E`, `#9F1239`, `#1E40AF`), never pure gray or low-contrast mid-tones.

## Typography

**Display Font:** Manrope (`Manrope_600SemiBold`, `Manrope_700Bold`) with Helvetica Neue / Arial fallback
**Body Font:** Manrope (`Manrope_400Regular`, `Manrope_500Medium`) with Helvetica Neue / Arial fallback
**Label/Mono Font:** JetBrains Mono (`JetBrainsMono_400Regular`, `JetBrainsMono_500Medium`) with SFMono-Regular / Menlo fallback

**Character:** Manrope lends approachable, modern geometric warmth to headings and controls, while JetBrains Mono anchors numerical GW telemetry, error metrics, timestamps, and IDs in crisp tabular columns.

### Hierarchy
- **Display** (600, `clamp(30px, 4.2vw, 52px)`, `1.12`): Auth hero statements only.
- **Headline** (600, `28px` desktop / `22px` mobile, `1.21`, `-0.7px`): Page titles across all 10 admin views and auth form headers.
- **Title** (600, `16px`–`20px`, `1.35`, `-0.2px`): Panel section headers, modal titles, and drawer headings.
- **Body** (400–500, `14px`–`15px`, `1.45`–`1.53`): Subtitles, operational notes, table labels, and form inputs.
- **Label / Mono** (400–500, `12px`–`13px`, `1.38`, `tabular-nums`): MAE/RMSE/MAPE readouts, row counts, IP addresses, request/job IDs, and axis ticks.

### Named Rules
**The Self-Sufficient Heading Rule.** Headings carry their own hierarchy without uppercase eyebrow kickers above them; context lives in navigation pills and calm subtitles below.

**The Tabular Telemetry Rule.** Every numeric measurement, timestamp, correlation ID, and percentage delta renders with tabular numerals so values align vertically across rows.

## Layout

Desktop (`>= 768px`) uses a persistent 256px left navigation rail paired with a fluid main workspace capped at `1320px` (`32px` horizontal padding, `16px`–`18px` vertical stack rhythm). Analytical views split into proportional two-column stages (`1.55 : 1` or `1.15 : 1`) above `980px`–`1020px` and stack cleanly into single-column flows below that threshold.

Mobile (`< 768px`) restructures rather than shrinks the desktop shell:
- A compact top header displays brand context and a one-tap role/account pill.
- A horizontal scrollable sub-page capsule strip provides one-tap switching across sibling pages within the active domain.
- Complex multi-dimension filters collapse into quick range pills plus a `Filters` button with active count badge opening a bottom sheet.
- Multi-column data tables automatically transform into structured mobile record cards below `880px`.
- A fixed 4-item bottom navigation bar keeps primary domain switching (`Analyze`, `Data`, `System`, `Users`) inside the natural thumb zone with safe-area inset padding.

## Elevation & Depth

PowerCast uses a restrained hybrid of tonal surface layering (`#F5F7FB` canvas -> `#FFFFFF` card -> `#F8FAFD` recessed well) and soft, downward-offset slate shadows. Depth separates primary panels and floating sheets from the canvas without heavy drop shadows or colored neon glows.

### Shadow Vocabulary
- **Subtle** (`0 2px 8px -2px rgba(15, 23, 42, 0.04)`): Active segmented tabs, header refresh capsules, and primary CTA lift.
- **Card** (`0 8px 24px -6px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)`): Primary white `SurfaceCard` containers and mobile bottom navigation bar.
- **Floating** (`0 20px 44px -10px rgba(15, 23, 42, 0.14), 0 4px 12px -2px rgba(15, 23, 42, 0.06)`): Right-side detail drawers, mobile bottom sheets, confirmation modals, and toast banners.

### Named Rules
**The Single-Elevation Container Rule.** Primary panels sit on `SurfaceCard`; interior groupings use `1px` hairlines (`#E2E8F2`) or flat `#F8FAFD` wells—never nested shadowed cards inside cards.

## Shapes

Generous, friendly enterprise rounding softens dense analytical telemetry:
- **Primary Cards & Modals:** `20px`–`24px` corner radius with a crisp `1px` `#E2E8F2` border.
- **Mobile Bottom Sheets:** `26px` top-left and top-right radius with a centered `44x5px` drag handle bar.
- **Inputs & Recessed Data Wells:** `14px`–`16px` radius.
- **Buttons, Filter Selectors, Segmented Tabs & Status Badges:** Full capsule pill (`999px`).

## Components

### Buttons
- **Shape:** Full pill (`999px`), minimum height `42px`–`48px` (`36px` compact inline actions).
- **Primary:** Cobalt `#1D4ED8` fill with `#FFFFFF` semi-bold label, shifting to `#1E40AF` on hover/press.
- **Secondary:** `#FFFFFF` fill with `1px` `#E2E8F2` border and `#0F172A` text, shifting to `#EEF2F8` on hover/press.
- **Danger:** Soft rose `#FFF1F2` fill with `#FECDD3` border and `#9F1239` text; isolated away from routine actions when destructive.

### Chips & Status Pills
- **Style:** Full pill (`999px`) with `1px` semantic border, `6px` status dot, and `12px` semi-bold hue-matched label.
- **Filter Selectors (`SelectPill`):** Capsule trigger (`#F8FAFD` fill, `#E2E8F2` border) opening a clean modal/sheet option list with checkmark confirmation.

### Cards / Containers
- **Corner Style:** `20px` radius (`24px` on auth forms and confirmation dialogs).
- **Background:** `#FFFFFF` over `#F5F7FB` canvas.
- **Shadow Strategy:** Soft `card` shadow paired with `1px` `#E2E8F2` border.
- **Internal Padding:** `20px` standard (`28px` on auth cards).

### Inputs / Fields
- **Style:** `14px` radius, `#F8FAFD` fill transitioning to `#FFFFFF` on focus, `1px` `#E2E8F2` border.
- **Focus:** Animated `1px` `#1D4ED8` border with `2px` offset focus ring on keyboard navigation.
- **Error:** `#9F1239` border and validation message with leading alert icon.

### Navigation
- **Desktop:** 256px white left rail grouping the 4 domains (`Analyze`, `Data Management`, `System Status`, `User Management`) with direct capsule links to all 10 sitemap pages and live alert count badges.
- **Mobile:** Fixed bottom tab bar (`52px+` item height + safe-area inset) paired with a sticky horizontal sub-page pill bar at the top.

### Shared Filter Bar & Contextual Drawer Sheet
- **SharedFilterBar:** Unified cross-page filter bar supporting date range presets + custom start/end dates, resolution, energy type, grid region, dataset, status, operator, and keyword search—inline on desktop (`>= 820px`) and consolidated into a 1-tap `Filters` bottom sheet with active count badge on mobile.
- **DetailDrawerSheet:** Right-hand `480px` slide-over panel on desktop (`>= 768px`) that automatically becomes a `26px`-rounded bottom sheet (`maxHeight: 88%`) on mobile for dataset schemas, forecast point residuals, anomaly notes, job logs, and user governance.

## Do's and Don'ts

### Do:
- **Do** keep every touch target at `38px`–`48px` height (`44px+` on mobile navigation and filter triggers) with clear active/focus feedback.
- **Do** transform wide multi-column tables into structured key-value record cards below `880px` so mobile operators never scroll horizontally to read critical status or actions.
- **Do** open item inspections (datasets, high-residual points, anomalies, error logs, user profiles) in `DetailDrawerSheet` rather than navigating away from filter context.
- **Do** separate destructive controls (account deletion, suspension, job cancellation) in dedicated confirmation flows with mandatory audit reasons where required.

### Don't:
- **Don't** place tracked-out uppercase eyebrow/kicker labels above headings.
- **Don't** nest bordered or shadowed cards inside `SurfaceCard`; use `1px` hairlines or flat `#F8FAFD` wells instead.
- **Don't** use colored `border-left` stripes thicker than `1px` on alerts, callouts, or list rows; use `StatusPill` badges or `1px` full semantic borders (`#FECDD3` on `#FFF1F2`).
- **Don't** hide administrative or analytical capabilities on mobile viewports—reflow controls into sheets and stacked sections with 100% feature parity.

