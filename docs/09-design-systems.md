# 09 - Design Systems & Aesthetics Specification: Say Briefly

> Creative agency sketchbook on cream paper. Hand-crafted, tactile, and delightfully human.

**Theme:** Light (Warm Cream Paper Canvas)

SayBriefly speaks the visual language of a creative studio's moodboard: warm cream paper, a single deep forest green that does the heavy lifting for text and primary actions, and a vivid school-bus yellow that acts as both highlight marker and playful punctuation. Type is deliberately split-personality — **Bricolage Grotesque** at extrabold for display headlines with positive tracking that gives the words a sticker-book chunkiness, paired with **Inter**'s clean humanist sans for everything functional, and **Roboto Mono** for micro-metadata. 

The overall feel is approachable, hand-made, and slightly rebellious: rounded 6px corners everywhere on buttons, minimal shadows, scattered pastel accent cards that feel like sticky notes rather than rigid UI cards. Color is rationed — green for structure, yellow for emphasis, and tiny washes of mint/teal/blush/terracotta as decorative one-offs.

---

## 1. Tokens — Colors

| Name | Hex Value | Token | Role |
|------|-----------|-------|------|
| **Forest Ink** | `#1a3300` | `--color-forest-ink` | Primary text, filled CTA buttons, link text, nav borders, card borders — the structural backbone. Near-black green carrying 90% of interface weight |
| **Highlighter Yellow** | `#ffe95c` | `--color-highlighter-yellow` | Text highlight wash (behind keywords in headlines), badge backgrounds, accent fills. Always reads as a marker stroke, never as a CTA button |
| **Cream Paper** | `#fcfaf5` | `--color-cream-paper` | Page canvas, card surfaces, nav background — warm off-white aged paper tone |
| **Pencil Gray** | `#b6b6b6` | `--color-pencil-gray` | Nav and divider borders — mid-gray hairlines that recede |
| **Whisper Gray** | `#f1f1f1` | `--color-whisper-gray` | Muted helper text, secondary labels, subtle outlines |
| **Sticky Note Teal** | `#a8e5e5` | `--color-sticky-note-teal` | Teal action color for filled buttons, selected navigation states, settlement summaries |
| **Sticky Note Mint** | `#d5f5c2` | `--color-sticky-note-mint` | Green action color for paid status, success confirmations, feature cards |
| **Sticky Note Blush** | `#f6d0ff` | `--color-sticky-note-blush` | Decorative card fill, roommate badges, persona avatars |
| **Terracotta** | `#cb5521` | `--color-terracotta` | Urgent escalation flags, late payment warnings, warm counterpoint |

---

## 2. Tokens — Typography

### Bricolage Grotesque (`--font-bricolage-grotesque`)
- **Role**: Display headlines only. Custom variable font with positive tracking (0.04-0.05em) that makes characters feel chunky and sticker-like. This is the signature voice — never use for body or UI.
- **Weights**: 800 (Extrabold)
- **Sizes**: 40px, 55px, 66px, 90px
- **Line Height**: 1.00 – 1.15
- **Letter Spacing**: 0.04em at 55px, 0.05em at 66-90px

### Inter (`--font-inter`)
- **Role**: Everything functional: body copy, navigation, buttons, cards, form inputs, subheadings.
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Sizes**: 12px, 14px, 16px, 18px, 20px, 24px, 28px
- **Line Height**: 1.25 – 1.6

### Roboto Mono (`--font-roboto-mono`)
- **Role**: Micro-labels in nav, UPI addresses, amounts, dates, timestamps, and technical metadata.
- **Weights**: 400, 500
- **Sizes**: 11px, 12px, 14px, 15px

---

## 3. Tokens — Spacing & Border Radii

- **Base Unit**: 8px
- **Button Radius**: `6px` (`--radius-buttons`)
- **Card Radius**: `12px` - `16px` (`--radius-cards`)
- **Nav Container Radius**: `16px` (`--radius-nav`)
- **Pills / Tags**: `9999px` (`--radius-tags`)
- **Page Max Width**: `1200px`
- **Section Gap**: `64px` - `80px`

---

## 4. Emil Kowalski Motion Engineering Standards (/animate & /emil-design-eng)

### Tactile Feedback (Kill Latency on Pointer-Down)
Every button and interactive surface shrinks to `scale(0.97)` on `:active` with an ultra-fast `120ms` transition.

```css
button:active:not(:disabled), [role="button"]:active {
  transform: scale(0.97);
}
```

### Custom Easings (No Generic Linear/Ease)
```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
```

### Modal & Popover Motion
- **Never animate from `scale(0)`**: Modals enter from `scale(0.95)` with `opacity: 0` using `.animate-pop-in`.
- **Under 300ms Duration**: Modal animations execute in `220ms` with `--ease-out`.
- **GPU-only transforms**: Strict transitions on `transform` and `opacity` only.
- **Reduced Motion Support**: Complete graceful degradation via `@media (prefers-reduced-motion: reduce)`.

---

## 5. Component Styling Rules

1. **Primary CTA Button**:
   - Filled Forest Ink (`#1a3300`) background, Cream Paper (`#fcfaf5`) text, `6px` radius, Inter 500/600 16px, inline arrow `→`, subtle shadow.
2. **Outline Secondary Button**:
   - Transparent background, `1px solid #1a3300` border, Forest Ink (`#1a3300`) text, `6px` radius.
3. **Highlighted Headline Marker**:
   - Individual keywords inside `Bricolage Grotesque` headlines wrapped in `bg-[#ffe95c] px-2 py-0.5 rounded-[3px] text-[#1a3300]`.
4. **Sticky Note Surface Cards**:
   - `12-16px` radius, `24px` padding, filled with Mint (`#d5f5c2`), Teal (`#a8e5e5`), Blush (`#f6d0ff`), or Cream Paper (`#fcfaf5`). `1px solid #1a3300` or `1px solid #b6b6b6` border. No heavy drop shadows.
5. **Floating Pill Top Navigation**:
   - Centered pill-shaped container, Cream Paper background, `16px` radius, `1px solid #b6b6b6` border, Forest Ink logo mark with yellow monogram.
