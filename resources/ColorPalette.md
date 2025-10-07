# Color Palette & Semantic Tokens

This document lists the semantic color tokens available in the design system. Values are stored as OKLCH for perceptual consistency across light/dark modes.

## Core Brand
- Primary (`--primary` / `--primary-foreground`)
  - Light: oklch(0.53 0.17 262)
  - Dark:  oklch(0.72 0.17 262)

## Semantic Status Colors
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| success | oklch(0.73 0.15 150) | oklch(0.62 0.14 150) | Positive / confirmations / pass states |
| info | oklch(0.8 0.07 240) | oklch(0.68 0.08 240) | Neutral informative notices |
| warning | oklch(0.86 0.16 80) | oklch(0.7 0.16 80) | Caution / pending attention |
| critical | oklch(0.55 0.25 25) | oklch(0.46 0.23 25) | High severity (above destructive) |
| destructive | oklch(0.577 0.245 27.325) | oklch(0.396 0.141 25.723) | Irreversible / dangerous action |

## Foreground Strategy
Foreground tokens aim for AA contrast with their backgrounds; verify with a contrast checker if adjusting lightness/chroma.

## Component Variant Mapping
| Component | Variant | Tokens |
|-----------|---------|--------|
| Button | success | bg-success text-success-foreground |
| Button | info | bg-info text-info-foreground |
| Button | warning | bg-warning text-warning-foreground |
| Button | critical | bg-critical text-critical-foreground |
| Button | subtle | bg-primary/10 text-primary |
| Badge | success | bg-success text-success-foreground |
| Badge | warning | bg-warning text-warning-foreground |
| Badge | info | bg-info text-info-foreground |
| Badge | critical | bg-critical text-critical-foreground |
| Alert | success | bg-success/15 text-success border-success/30 |
| Alert | info | bg-info/15 text-info border-info/30 |
| Alert | warning | bg-warning/15 text-warning border-warning/30 |
| Alert | critical | bg-critical/15 text-critical border-critical/30 |
| Input | success | border-success focus-visible:ring-success |
| Input | warning | border-warning focus-visible:ring-warning |
| Input | critical | border-critical focus-visible:ring-critical |

## Adding a New Semantic Token
1. Add `--token` / `--token-foreground` to `:root` and `.dark` with OKLCH values.
2. Map to `--color-token` / `--color-token-foreground` inside the `@theme` block.
3. Reference in components (e.g., `bg-token text-token-foreground`).
4. Update this document.

## Rationale for OKLCH
- More uniform perceived steps than RGB/HSL
- Easier to lighten/darken without hue drift
- Improves consistency across light & dark adaptation

## Contrast Testing
Use `jest-axe` (planned) or manual tooling to ensure variants meet WCAG guidelines:
- Text on solid semantic backgrounds: aim for 4.5:1 (normal) / 3:1 (bold >= 600 weight or large text).

---
Generated: see design system automation tasks for future sync.
