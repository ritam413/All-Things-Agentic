# 09 - Design Systems & Aesthetics Specification

## 1. Aesthetic Direction: Cyber-Financial Glassmorphism
RoomieOps AI employs a sleek, dark-mode glassmorphic theme designed to create an instant "WOW" effect for hackathon judges:
- **Palette**: Deep obsidian backgrounds (`#0B0F19`), neon cyan/emerald accents (`#00F2FE`, `#10B981`), and warning amber/rose accents for escalations (`#F59E0B`, `#EF4444`).
- **Typography**: Google Fonts `Inter` for crisp data interfaces and `Outfit` for display headings.
- **Micro-animations**: Subtle glowing borders on active agent tasks, smooth spring transitions on debt simplification, and soft pulse badges for autonomous background crons.

---

## 2. CSS Design Tokens & Color Palette

```css
:root {
  /* Surface Tokens */
  --bg-primary: #080C14;
  --bg-surface: #0F172A;
  --bg-surface-glass: rgba(15, 23, 42, 0.75);
  --border-glass: rgba(255, 255, 255, 0.1);
  --border-glass-glow: rgba(0, 242, 254, 0.3);

  /* Brand Accents */
  --accent-cyan: #00F2FE;
  --accent-blue: #4FACFE;
  --accent-emerald: #10B981;
  --accent-amber: #F59E0B;
  --accent-rose: #EF4444;
  --accent-purple: #8B5CF6;

  /* Typography */
  --font-heading: 'Outfit', sans-serif;
  --font-body: 'Inter', -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

---

## 3. Glassmorphism Card Utility Classes

```css
.glass-card {
  background: var(--bg-surface-glass);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border-glass);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  border-color: var(--border-glass-glow);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px 0 rgba(0, 242, 254, 0.15);
}

.agent-pulse-badge {
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
  }
  50% {
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.8);
  }
}
```
