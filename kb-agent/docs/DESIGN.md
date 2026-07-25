# DESIGN — SourceTruth visual & interaction design

## Brand

- **Name:** SourceTruth
- **One-line pitch:** "Tells you which source to trust, and why."
- **Tone:** plain, trustworthy, unflashy. This is an internal operations
  tool, not a consumer product — clarity beats personality.

## Color palette

| Role | Color | Hex | Used for |
|---|---|---|---|
| Primary / accent | Indigo | `#3730a3` | Header gradient, primary button, source pills, links |
| Primary hover/gradient end | Indigo-light | `#4f46e5` | Header gradient end stop |
| Background | White | `#ffffff` | Page background |
| Secondary background | Off-white | `#f7f7fb` | Sidebar stat cards, example chips |
| Border | Light gray | `#e5e5f0` | Card borders, dividers |
| Text primary | Near-black | `#1e1e2e` | Body text |
| Text secondary | Muted gray | `#6b6b80` | Captions, labels, stat card labels |
| Conflict / warning | Amber | `#f59e0b` (border), `#fff7ed` (bg) | Conflict callout box |
| Success | Green | `#86efac` (border), `#f0fdf4` (bg) | Ticket-created confirmation |

Rationale: indigo reads as "trustworthy/analytical" without being cold;
amber for conflicts follows standard warning conventions (not red — a
detected-and-resolved conflict isn't an error, it's the system working
correctly); green only appears for a completed, successful action (ticket
created).

## Typography

- System sans-serif stack (Streamlit default) — no custom font loading, to
  keep the app's load time and dependency footprint minimal.
- Header (`hero h1`): 1.6rem
- Body/answer text: default Streamlit body size
- Captions/labels: 0.72–0.8rem, often uppercase with slight letter-spacing
  for stat-card labels specifically (a small formal/data-dashboard cue)

## Layout

- **Hero header**: full-width gradient band, app name + one-sentence pitch.
  Sets expectations before the user reads anything else.
- **Sidebar**: knowledge-base composition (stat cards: # PDFs / # sheets /
  # emails) + LLM engine status (🟢 live / 🟡 demo) + manual re-ingest
  control. Purpose: let the user always see *what the agent actually knows*
  before they ask it anything — critical for trust in a tool whose whole
  value proposition is "don't trust the wrong source."
- **Example question chips**: shown only before the first question, removed
  once a conversation starts (not clutter once the user knows how to use it).
- **Chat thread**: standard chat bubbles; assistant turns wrap the answer in
  a bordered card (`answer-box`) distinct from the conflict callout above it,
  so a user scanning quickly sees "warning, then answer" as two visually
  separate things, not one wall of text.
- **Source pills**: pill-shaped, indigo-on-light-indigo, always directly
  below the answer they support — never separated by a scroll.
- **Ticket panel**: two-column form (subject/client/priority | body),
  primary-styled submit button, success confirmation as its own green card.

## Interaction principles

1. **Never show an answer without its sources directly beneath it.** This
   is non-negotiable for this product's trust proposition — don't let a
   future redesign separate them (e.g. sources in a collapsed expander) or
   the point of the tool is undermined.
2. **Conflict callouts appear above the answer, not inline within it or
   after it.** The user should know a conflict exists before reading the
   resolved answer, so they read the answer critically rather than at face
   value.
3. **The LLM engine status (live vs. demo mode) must always be visible**,
   not just discoverable — a demo-mode answer and a live-LLM answer are not
   interchangeable in a real decision, and the UI should never let that
   distinction go unnoticed.
4. **The ticket panel always reflects the *last* answer**, not a manually
   re-selected one, to keep the "answer → ticket" flow to the two clicks
   promised in PRD.md §4.

## Design debt / open items

- No dark mode yet (discussed, deferred — see conversation history)
- No mobile-specific layout considerations (internal desktop tool assumption)
- Iconography is emoji-based (🧭 📄 📊 ✉️ 🎫) rather than a proper icon set —
  acceptable for the prototype, worth revisiting if this becomes client-facing
