---
name: Midnight Sentinel
colors:
  surface: '#0f131c'
  surface-dim: '#0f131c'
  surface-bright: '#353942'
  surface-container-lowest: '#0a0e16'
  surface-container-low: '#181c24'
  surface-container: '#1c2028'
  surface-container-high: '#262a33'
  surface-container-highest: '#31353e'
  on-surface: '#dfe2ee'
  on-surface-variant: '#d8c3ad'
  inverse-surface: '#dfe2ee'
  inverse-on-surface: '#2c3039'
  outline: '#a08e7a'
  outline-variant: '#534434'
  surface-tint: '#ffb95f'
  primary: '#ffc174'
  on-primary: '#472a00'
  primary-container: '#f59e0b'
  on-primary-container: '#613b00'
  inverse-primary: '#855300'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#d5c3ff'
  on-tertiary: '#3c0091'
  tertiary-container: '#bda2ff'
  on-tertiary-container: '#520fbb'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddb8'
  primary-fixed-dim: '#ffb95f'
  on-primary-fixed: '#2a1700'
  on-primary-fixed-variant: '#653e00'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#0f131c'
  on-background: '#dfe2ee'
  surface-variant: '#31353e'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '800'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '400'
    lineHeight: 12px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1rem
  margin-mobile: 0.75rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style
The design system establishes a focused, high-contrast civic-defense aesthetic engineered for rapid situational awareness on mobile web screens in low-light environments. Blending utilitarian tactical dashboards with modern civic tech, the visual personality projects institutional reliability, immediate urgency, and community-backed vigilance. 

Surfaces stay grounded in deep night tones to reduce glare and visual fatigue during late-night urban transit, while vibrant hazard accents instantly communicate danger severity, transit state, and sensor telemetry. Interface boundaries favor precise, low-opacity glass layers paired with subtle perimeter glows, maintaining legibility across dynamic map layers and hardware screens under high-stress conditions.

## Colors
The system prioritizes high-contrast dark mode to maximize night-vision retention and display clarity:

- **Primary (Safe Amber / Neon Gold - `#F59E0B` / `#FBBF24`):** Designates active navigation paths, primary CTAs, community confirmations, and verified safe waypoints.
- **Secondary (Safety Teal - `#06B6D4`):** Reserved for live sensor tracking, pedestrian radar pulses, route filtering toggles, and safe-haven hubs.
- **Tertiary (Telemetry Electric Indigo - `#8B5CF6`):** Applied exclusively to connected hardware metrics, environmental acoustic sensors, municipal camera feeds, and automated telemetry badges.
- **Neutral Core (Obsidian to Slate):** Canvas utilizes `#0B0F17`, elevated panels sit on `#111827`, and interactive cards leverage `#1E293B` with border accents in `#334155` (Slate-700/60). Text strictly adheres to `#F8FAFC` (High-emphasis) and `#94A3B8` (Medium-emphasis metadata).
- **Severity Accent Tiers:**
  - High Hazard / Emergency: `#EF4444` (Crimson)
  - Elevated Warning: `#F97316` (Tangerine)
  - Cautionary Notice: `#EAB308` (Amber)
  - Verified Safe / Resolved: `#10B981` (Emerald)

## Typography
Typographic rhythm balances high-legibility sans-serif structures with tactical monospaced markers:

- **Headlines (`Plus Jakarta Sans`):** Provides sturdy geometric forms with generous aperture openings, ensuring rapid comprehension of route updates, incident titles, and critical warnings under low-light screen dimming.
- **Body & Prose (`Inter`):** Selected for its neutral, highly engineered x-height and distinct letterforms, facilitating seamless reading of incident reports, community feedback, and emergency instructions.
- **Telemetry & Metadata (`JetBrains Mono`):** Applied to latitude/longitude coordinates, dynamic time-to-arrival metrics, hardware battery readouts, confidence ratings, and municipal incident IDs. All numeric metrics use tabular figures to prevent layout shifting during real-time telemetry streaming.

## Layout & Spacing
The layout follows a fluid-first mobile architecture anchored by an edge-to-edge interactive canvas with fixed, reachable touch control zones:

- **Layout Structure:** Map views operate full-viewport (`100dvh`), with floating tactical controls pinned within standard thumb-reach zones (bottom 40% of the viewport). Overlays and audit drawers conform to a 4-column mobile fluid grid (up to 640px) expanding to an 8-column layout for tablet patrol dashboards.
- **Breakpoints:** Mobile layout spans up to `640px` with `0.75rem` canvas margins; tablet and desktop fold out past `768px` and `1024px` with split-pane audit views.
- **Touch Geometry:** All actionable map triggers, emergency beacons, and filter chips respect a minimum hit-target clearance of `48px x 48px`, decoupled from visual container bounds using outer touch paddings.

## Elevation & Depth
Depth is created using translucent dark slate tiers paired with back-surface dispersion and controlled perimeter stroke luminescence:

- **Layer 0 (Canvas Base):** Ground zero map viewports rendered on `#0B0F17`.
- **Layer 1 (Card & Bottom Sheets):** Translucent `#1E293B` at 85% opacity with an active `12px` backdrop blur (`backdrop-filter: blur(12px)`) and a `1px` structural outline of `rgba(51, 65, 85, 0.6)`.
- **Layer 2 (Floating Action Trays & Dialogs):** `#111827` at 92% opacity, stabilized by a delicate ambient shadow: `0 12px 32px -4px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(245, 158, 11, 0.15)`.
- **Layer 3 (Critical Alert HUD):** High-priority overlays introduce a soft radial alert glow using the active severity token (e.g., Crimson glow: `box-shadow: 0 0 24px -2px rgba(239, 68, 68, 0.35)`).

## Shapes
The design adopts a refined tactical silhouette (`roundedness: 2`):

- Standard components (buttons, input fields, and incident cards) use `0.5rem` (`8px`) corner radiuses, reflecting mechanical precision without harsh brutalist corners.
- Larger map slide-overs, route instruction cards, and modal drawers utilize `rounded-lg` (`1rem` / `16px`).
- Floating badges, live pulse dots, and telemetry tracking chips use fully pill-shaped contours (`rounded-full` / `9999px`) to visually differentiate floating status indicators from structural surface containers.

## Components

### Buttons
- **Primary Action (Start Safe Route / Confirm):** High-visibility Amber background (`#F59E0B`), text in Obsidian (`#0B0F17`), weight `700`, uppercase tracking. Active state shifts to `#D97706` with an inner border glow.
- **Emergency Beacon (SOS):** High Risk Crimson (`#EF4444`) with a continuous concentric radar pulse ring. White text (`#FFFFFF`) with `display-lg-mobile` sizing for uncompromised urgency.
- **Secondary & Tertiary:** Bordered tactical buttons in Slate (`#1E293B` fill, `rgba(148, 163, 184, 0.2)` border, `#F8FAFC` text).

### Chips & Severity Badges
- Constructed with a `rounded-full` contour, a subtle background tint (`15%` severity color opacity), and a `1px` matching perimeter border.
- Prefixed with an animated, glowing circular dot indicator (`6px x 6px`) conveying live status (pulsing for active hazards, steady for verified reports).

### Map Card Overlays
- Floating containers using Layer 1 elevation with Leaflet pan/zoom bypass gestures.
- Includes a direct severity header, time-since-reported label in `label-sm` monospace, and instant community verification voting controls ("Still Here" / "Clear").

### Form Inputs & Moderation Cues
- Search bars and incident report inputs utilize `#0F172A` with a distinct `1px` border of `#334155`. Focus states trigger a sharp Amber accent halo (`0 0 0 2px rgba(245, 158, 11, 0.4)`).
- Admin and moderation cue surfaces introduce a left-border strip (`3px` solid `#8B5CF6`) indicating municipal telemetry integration or active supervisor review.