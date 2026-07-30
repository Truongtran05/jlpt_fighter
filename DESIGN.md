---
name: Bushido Academic
colors:
  surface: '#f1fcf7'
  surface-dim: '#d1ddd8'
  surface-bright: '#f1fcf7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#ebf6f1'
  surface-container: '#e5f0eb'
  surface-container-high: '#dfebe6'
  surface-container-highest: '#dae5e0'
  on-surface: '#141e1b'
  on-surface-variant: '#404942'
  inverse-surface: '#28332f'
  inverse-on-surface: '#e8f3ee'
  outline: '#707972'
  outline-variant: '#bfc9c0'
  surface-tint: '#2a6a4b'
  primary: '#00472c'
  on-primary: '#ffffff'
  primary-container: '#1e5f41'
  on-primary-container: '#96d7b1'
  inverse-primary: '#93d5af'
  secondary: '#4d6356'
  on-secondary: '#ffffff'
  secondary-container: '#cde6d5'
  on-secondary-container: '#51685a'
  tertiary: '#6b2800'
  on-tertiary: '#ffffff'
  tertiary-container: '#913800'
  on-tertiary-container: '#ffb899'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#aff1ca'
  primary-fixed-dim: '#93d5af'
  on-primary-fixed: '#002112'
  on-primary-fixed-variant: '#0a5134'
  secondary-fixed: '#d0e9d8'
  secondary-fixed-dim: '#b4ccbc'
  on-secondary-fixed: '#0a1f15'
  on-secondary-fixed-variant: '#364b3f'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb694'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#f1fcf7'
  on-background: '#141e1b'
  surface-variant: '#dae5e0'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-md:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 28px
  body-lg-kanji:
    fontFamily: Noto Sans
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 36px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  stats-number:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 24px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  gutter-desktop: 24px
  margin-desktop: 48px
  margin-mobile: 16px
  container-max: 1280px
---

## Brand & Style
The design system is built on the philosophy of "The Scholar-Warrior." It balances the discipline of academic study with the competitive momentum of a martial arts dojo. The target audience is serious JLPT (Japanese Language Proficiency Test) candidates who value efficiency, mastery, and visible progress.

The visual style is **Modern Corporate with a Tonal Warrior Edge**. It utilizes high-density layouts to mimic the rigor of traditional exams, offset by "battle-ready" accents—sharp angles, high-contrast states, and progress indicators that feel like health bars or leveling systems. The atmosphere should feel prestigious and focused, stripping away unnecessary distractions to center the user on the "battle" at hand: the Japanese language.

## Colors
This design system uses a palette derived from the provided logo to establish authority and focus.

- **Primary (Dojo Green):** Used for primary actions, success states, and progress indicators. It represents growth and the "green light" of mastery.
- **Secondary (Sage Mist):** A soft, desaturated green used for large surface areas and background containers to reduce eye strain during long study sessions.
- **Tertiary (Spirit Orange):** An accent color used sparingly for "Critical" alerts, call-to-actions that require immediate attention, and "Level Up" notifications. 
- **Neutral (Slate Katana):** A deep, near-black slate used for high-contrast typography and structural borders.

The default mode is **Light**, utilizing high-legibility backgrounds to ensure Kanji strokes are crisp and distinguishable.

## Typography
Typography is the most critical tool in this design system. We use a three-font strategy:

1.  **Space Grotesk (Headlines):** Its geometric and technical nature provides the "modern warrior" aesthetic. It is used for level headers, lesson titles, and achievement screens.
2.  **Noto Sans (Body/Japanese):** Specifically chosen for its exceptional support of CJK (Chinese, Japanese, Korean) characters. It ensures that complex Kanji are rendered with perfect clarity and standard stroke weights.
3.  **JetBrains Mono (Labels/Technical):** Used for UI metadata, timer countdowns, and JLPT level tags (e.g., N1, N2). This adds a "systematic/data-driven" feel to the academic experience.

All Kanji-specific blocks should use a minimum of 24px font size to ensure stroke visibility for learners.
<!-- 
## Layout & Spacing
The layout follows a **structured fluid grid** based on an 8px spacing unit. 

- **Desktop:** A 12-column grid with generous 24px gutters. Dashboard views utilize a "Command Center" layout with a fixed left sidebar for navigation and a right sidebar for "Daily Stats" and "Leaderboards," leaving the center wide for the primary learning content.
- **Tablet:** Transitions to an 8-column grid. Sidebars collapse into a bottom navigation bar or a hamburger menu.
- **Mobile:** A 4-column grid with 16px margins. Content is strictly vertical to facilitate "Flashcard" style interactions and one-handed "Battle" sessions.

Layouts should prioritize "Focus Zones"—isolated containers that hide secondary UI elements when a user enters a "Practice Test" or "Vocabulary Duel." -->

## Elevation & Depth
The design system avoids heavy shadows to maintain a clean, academic look. Depth is conveyed through **Tonal Layering and Tactical Outlines**:

- **Surface Levels:** The base layer is the background (Sage Mist). Cards and containers use a pure white surface.
- **Tactical Outlines:** Interactive elements use 1px or 2px solid borders in "Dojo Green" or "Slate Katana." 
- **Active Elevation:** When an item is selected (e.g., a multiple-choice answer), it does not lift with a shadow; instead, it receives a thick 3px interior border and a subtle 4px translation offset (moving the element slightly up and to the right) to feel "pressed" or "activated."
- **Focus Blur:** For modal overlays, a subtle backdrop blur (8px) is used to keep the user’s mind on the current task.

## Shapes
The shape language is **Soft (0.25rem)**. 

While the "warrior" theme might suggest sharp points, the "academic" side requires a more approachable feel. We use a small radius on cards and inputs to feel modern and professional. 

**Exceptions:**
- **Buttons:** Use `rounded-lg` (0.5rem) to feel more inviting for interaction.
- **Progress Bars:** Use fully pill-shaped caps to suggest a "liquid" flow of knowledge.
- **Achievement Badges:** Utilize hexagonal or octagonal frames, referencing traditional Japanese "Mon" (crests) and shield motifs.

## Components

### Buttons
- **Primary (Battle):** High-contrast "Dojo Green" background with white text. On hover, the border thickens.
- **Secondary (Study):** Transparent background with a "Slate Katana" border.
- **Ghost:** No border, used for navigation within lesson sub-steps.

<!-- ### Progress Bars (XP Bars)
Designed to look like "Health Bars." A dual-tone green bar (Light Green background, Dark Green fill) with a small "XP" label using JetBrains Mono. -->

### Flashcards & Quiz Tiles
Large, white containers with Noto Sans centered for Japanese characters. The "Back" of the card uses a "Sage Mist" tint to distinguish it from the "Front."

### Achievement Chips
Small, high-contrast labels used for JLPT levels (e.g., a "Slate Katana" chip with white "N3" text).

### Input Fields
Strict, rectangular fields with 1px Slate borders. Upon focus, the border changes to Dojo Green. Error states use "Spirit Orange."

<!-- ### Lists (The Leaderboard)
Dense, clean lists with zebra-striping in "Sage Mist" to maintain readability in long rankings. Avatars are contained in hexagonal frames. -->