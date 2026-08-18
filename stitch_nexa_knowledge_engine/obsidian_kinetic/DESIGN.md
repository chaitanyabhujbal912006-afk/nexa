---
name: Obsidian Kinetic
colors:
  surface: '#0c1324'
  surface-dim: '#0c1324'
  surface-bright: '#33394c'
  surface-container-lowest: '#070d1f'
  surface-container-low: '#151b2d'
  surface-container: '#191f31'
  surface-container-high: '#23293c'
  surface-container-highest: '#2e3447'
  on-surface: '#dce1fb'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dce1fb'
  inverse-on-surface: '#2a3043'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#c0c1ff'
  on-secondary: '#1000a9'
  secondary-container: '#3131c0'
  on-secondary-container: '#b0b2ff'
  tertiary: '#4cd7f6'
  on-tertiary: '#003640'
  tertiary-container: '#009eb9'
  on-tertiary-container: '#002f38'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#0c1324'
  on-background: '#dce1fb'
  surface-variant: '#2e3447'
typography:
  display-xl:
    fontFamily: Geist
    fontSize: 72px
    fontWeight: '700'
    lineHeight: 80px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-safe: 40px
  container-max: 1440px
---

## Brand & Style

This design system is engineered for deep-focus environments where high-density information meets cutting-edge intelligence. The personality is authoritative, precise, and sophisticated—evoking the feeling of a command center for a next-generation intelligence engine.

The design style is **Futuristic Modernism** with heavy influences from **Glassmorphism** and **Technical Minimalism**. It prioritizes extreme clarity through high contrast, using depth not through shadows, but through luminous layers and atmospheric glows. The interface should feel like a precision instrument: cold but responsive, dark but legible, and meticulously structured.

## Colors

The palette is rooted in a deep, near-black canvas to provide maximum contrast for technical data.

- **Canvas:** Use `#020617` for the primary background. Surfaces should be slightly lighter or utilize translucent overlays.
- **Accents:** Electric Blue (`#3b82f6`) and Indigo (`#6366f1`) serve as the primary drivers for interactive states and brand presence.
- **Highlights:** Cyan (`#06b6d4`) is reserved for success states and data points, while Violet (`#8b5cf6`) is used sparingly for AI-driven insights or "magic" moments.
- **Borders:** A consistent 1px border using `#1e293b` defines the structural grid.

## Typography

The typography strategy leverages high-impact scale and technical precision. **Geist** provides a monospaced-adjacent aesthetic for headings and labels, reinforcing the "engine" feel, while **Inter** ensures long-form readability for AI-generated knowledge.

Large display type should be set with tight tracking to appear intentional and powerful. Use the `label-sm` style for metadata and technical specs to maintain a "dashboard" look.

## Layout & Spacing

This design system utilizes a **Fixed Grid** model on desktop and a **Fluid Model** on mobile. 

- **Desktop (1440px+):** 12-column grid with 24px gutters. Content is centered with generous 40px+ margins to emphasize the premium, spacious aesthetic.
- **Tablet (768px - 1439px):** 8-column grid with 16px gutters.
- **Mobile (Below 768px):** 4-column fluid grid.

Negative space is a functional element here. Avoid crowding components; allow the deep navy background to act as a separator between logical sections.

## Elevation & Depth

Depth is achieved through **Atmospheric Layering** rather than traditional drop shadows.

- **Base Level:** The deep `#020617` background.
- **Surface Level:** Semi-transparent containers with a `backdrop-filter: blur(12px)` and a 1px border (`#1e293b`).
- **Luminous Depth:** Use subtle, low-opacity radial gradients (glows) behind active components. For example, a 15% opacity Electric Blue glow can sit behind a primary card to indicate focus.
- **Interconnects:** Use 1px solid or dashed lines to represent data flow between surfaces, reinforcing the "Knowledge Engine" concept.

## Shapes

The shape language is sharp and disciplined. We use **Soft (0.25rem)** roundedness to maintain a technical, engineered feel. Avoid overly rounded or "bubbly" corners, as they detract from the enterprise AI persona. 

Large containers and cards should use `rounded-lg` (0.5rem), while buttons and inputs should stick to the base 4px radius.

## Components

- **Glass Navigation:** A top-mounted or floating sidebar with a high-blur backdrop (`blur(20px)`), a thin top/bottom border, and no solid background color.
- **High-Precision Inputs:** Fields use a dark background (`#0b0f1a`) with a 1px border. On focus, the border transitions to Electric Blue with a subtle 4px outer glow.
- **Technical Cards:** Feature cards should be diagrammatic. Use internal 1px grid lines or "crosshair" corner decorations to mimic a technical blueprint.
- **Interactive Connections:** For data visualizations, use 1px lines with an animated "pulse" or "dash-offset" effect to show data movement.
- **Action Buttons:** Primary buttons use a solid Electric Blue to Indigo gradient. Secondary buttons use the "Ghost" style: transparent background with a 1px Indigo border.