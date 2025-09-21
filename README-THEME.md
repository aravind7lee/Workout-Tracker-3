# GymTracker Theme System

Production-ready Dark ↔ Light theme system with Apple-inspired toggle and energetic fitness palette.

## 🎨 Design Choices

**Accent Color**: Energetic Cyan `#00D4FF` - Modern, techy gym vibe that conveys energy and innovation
**Default Theme**: Dark - Better for gym environments and reduces eye strain during workouts
**Palette**: Fitness-focused with premium glass morphism effects

## 🚀 Quick Setup

### 1. Include CSS
```html
<link rel="stylesheet" href="/src/styles/themes.css">
```

### 2. Optional JS Enhancer (for persistence)
```html
<script src="/src/styles/theme-toggle.js"></script>
```

### 3. Add Toggle to Navbar

**Desktop Version:**
```html
<button 
  class="theme-toggle navbar-toggle-desktop" 
  role="switch" 
  aria-checked="false"
  aria-label="Switch to light theme"
>
  <svg class="theme-toggle-icon sun" fill="currentColor" viewBox="0 0 20 20">
    <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
  </svg>
  <svg class="theme-toggle-icon moon" fill="currentColor" viewBox="0 0 20 20">
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
  </svg>
</button>
```

**Mobile Version (in mobile menu):**
```html
<div class="navbar-toggle-mobile">
  <button 
    class="theme-toggle" 
    role="switch" 
    aria-checked="false"
    aria-label="Switch to light theme"
  >
    <!-- Same SVG icons as desktop -->
  </button>
</div>
```

## 🔧 Migration Examples

### Before (Tailwind/Framework)
```html
<div class="bg-slate-900 text-white border border-slate-700">
  <button class="bg-blue-600 text-white px-4 py-2 rounded">
    Primary Action
  </button>
</div>
```

### After (Theme Variables)
```html
<div class="card">
  <button class="btn-primary">
    Primary Action
  </button>
</div>
```

### Workout Card Migration
```html
<!-- Before -->
<div class="bg-slate-800 border border-slate-600 rounded-lg p-4">
  <h3 class="text-white font-bold">Push Day</h3>
  <p class="text-slate-400">Chest, Shoulders, Triceps</p>
  <span class="text-2xl font-bold text-blue-400">12</span>
</div>

<!-- After -->
<div class="card" style="padding: 16px;">
  <h3 style="color: var(--text); font-weight: bold;">Push Day</h3>
  <p class="muted-text">Chest, Shoulders, Triceps</p>
  <span class="stat-value" style="color: var(--accent);">12</span>
</div>
```

## 🎯 10-Point Migration Checklist

1. **Navbar**: Replace background with `var(--bg-soft)`, text with `var(--text)`
2. **Hero Section**: Use `var(--bg)` background, `var(--accent)` for CTAs
3. **Dashboard Cards**: Apply `.card` class or `var(--bg-soft)` background
4. **Workout Items**: Use `var(--panel-border)` for borders, `var(--muted)` for secondary text
5. **Modals**: Apply `.modal` class for consistent theming
6. **Form Inputs**: Use theme variables for background and borders
7. **Primary Buttons**: Apply `.btn-primary` class or use `var(--accent)` background
8. **Footer**: Use `var(--bg-soft)` background, `var(--muted)` text
9. **Toast Notifications**: Use `var(--success)` and `var(--danger)` for states
10. **Charts/Graphs**: Reference `--chart-*` variables for consistent data visualization

## 🎨 Customization

### Change Accent Color
```css
:root {
  --accent: #FF6A3D; /* Energetic Orange */
  /* or */
  --accent: #8E37EB; /* Premium Violet */
}
```

### Switch Default Theme to Light
```css
/* Move light theme variables to :root */
/* Move dark theme variables to [data-theme="dark"] */
```

## ⚡ Performance Notes

- Uses CSS custom properties for instant theme switching
- Minimal JS footprint (~2KB minified)
- Transitions only applied during theme changes
- Respects `prefers-reduced-motion`

## 🧪 Testing Checklist

### Functionality
- [ ] Toggle visible on desktop navbar (top-right)
- [ ] Toggle accessible in mobile menu
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Theme persists after page reload (with JS)
- [ ] Cross-tab sync works within 250ms (with JS)

### Visual
- [ ] Smooth color transitions (~220ms)
- [ ] Toggle has tactile bounce animation
- [ ] Focus states visible and accessible
- [ ] All UI elements update: backgrounds, text, borders, shadows

### Accessibility
- [ ] WCAG AA contrast ratios met in both themes
- [ ] Screen reader announces toggle state changes
- [ ] High contrast focus rings visible
- [ ] Works without JavaScript (CSS-only fallback)

### Browser Support
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (desktop & iOS)
- [ ] Android Chrome

## 🚫 No JavaScript Limitation

**If client forbids JavaScript**: Theme system works with CSS only, but has these limitations:
- No persistence - theme resets to default on page reload
- No cross-tab synchronization
- Manual toggle state management required in framework components

## 🎪 Theme Variables Reference

```css
/* Backgrounds */
--bg: Main app background
--bg-soft: Cards, panels, modals
--bg-accent: Subtle overlays, highlights

/* Text */
--text: Primary text color
--muted: Secondary text, captions

/* Structure */
--panel-border: Card borders, dividers
--shadow-soft: Elevation shadows

/* Brand */
--accent: Primary brand color (#00D4FF)
--accent-contrast: Text on accent backgrounds

/* States */
--success: Success messages, positive metrics
--danger: Errors, warnings, negative states
```

Built for GymTracker with ❤️ and premium aesthetics.