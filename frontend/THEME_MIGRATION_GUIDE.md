# Theme Migration Guide - Nutrition Page Complete

## Find/Replace Patterns for Theme-Aware Components

### 1. Container & Card Backgrounds
```
Find: className="card"
Replace: className="bg-light-bg-soft dark:bg-dark-bg-soft backdrop-blur-premium border border-gray-200 dark:border-dark-border rounded-2xl p-6 shadow-light-card dark:shadow-dark-card transition-all duration-300 hover:shadow-lg dark:hover:shadow-dark-glow"

Find: bg-white
Replace: bg-light-bg-primary dark:bg-dark-bg-soft

Find: bg-gray-50
Replace: bg-gray-50 dark:bg-dark-bg-secondary/60

Find: bg-gray-100
Replace: bg-gray-100 dark:bg-dark-bg-tertiary/50

Find: bg-gray-200
Replace: bg-gray-200 dark:bg-dark-bg-tertiary
```

### 2. Text Colors (Accessibility Compliant)
```
Find: text-gray-900
Replace: text-light-text-primary dark:text-dark-text-primary

Find: text-gray-800
Replace: text-light-text-primary dark:text-dark-text-primary

Find: text-gray-700
Replace: text-light-text-secondary dark:text-dark-text-secondary

Find: text-gray-600
Replace: text-light-text-muted dark:text-dark-text-muted

Find: text-gray-500
Replace: text-light-text-muted dark:text-dark-text-muted

Find: text-slate-400
Replace: text-light-text-muted dark:text-dark-text-muted

Find: text-white
Replace: text-light-text-primary dark:text-dark-text-primary
```

### 3. Borders & Dividers
```
Find: border-gray-200
Replace: border-gray-200 dark:border-dark-border

Find: border-gray-300
Replace: border-gray-300 dark:border-dark-border

Find: border-slate-600
Replace: border-gray-300 dark:border-dark-border
```

### 4. Input Fields
```
Find: bg-white dark:bg-slate-900
Replace: bg-light-bg-primary dark:bg-dark-bg-primary

Find: placeholder-gray-500 dark:placeholder-slate-400
Replace: placeholder-light-text-muted dark:placeholder-dark-text-muted

Find: focus:border-blue-500
Replace: focus:border-blue-500 dark:focus:border-dark-accent focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-dark-accent/20
```

### 5. Buttons
```
Find: bg-blue-600 hover:bg-blue-700
Replace: bg-blue-600 dark:bg-dark-accent hover:bg-blue-700 dark:hover:bg-dark-accent-hover

Find: className="btn
Replace: className="bg-blue-600 dark:bg-dark-accent hover:bg-blue-700 dark:hover:bg-dark-accent-hover text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg dark:hover:shadow-dark-glow focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-dark-accent/20
```

### 6. Chip Pills & Badges
```
Find: bg-gray-100 dark:bg-slate-800
Replace: bg-gray-100 dark:bg-dark-bg-secondary/60 backdrop-blur-xs

Find: hover:bg-gray-200 dark:hover:bg-slate-700
Replace: hover:bg-gray-200 dark:hover:bg-dark-bg-secondary/80 hover:shadow-sm dark:hover:shadow-dark-glow/30
```

### 7. Skeleton Loaders
```
Find: animate-pulse bg-gray-200 dark:bg-slate-700
Replace: animate-pulse bg-gray-200 dark:bg-dark-bg-tertiary/50

Find: dark:bg-slate-700/30
Replace: dark:bg-dark-bg-tertiary/50
```

### 8. Progress Bars
```
Find: bg-gray-200 dark:bg-slate-700
Replace: bg-gray-200 dark:bg-dark-bg-tertiary
```

## Component-Specific Examples

### Food Card Component
```jsx
// Before
<div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-4">
  <h3 className="text-gray-900 dark:text-white font-medium">{food.name}</h3>
  <p className="text-gray-600 dark:text-slate-400 text-sm">{food.serving}</p>
</div>

// After
<div className="bg-light-bg-primary dark:bg-dark-bg-secondary/70 border border-gray-200 dark:border-dark-border rounded-lg p-4 backdrop-blur-xs hover:shadow-lg dark:hover:shadow-dark-glow/50 transition-all duration-200">
  <h3 className="text-light-text-primary dark:text-dark-text-primary font-medium">{food.name}</h3>
  <p className="text-light-text-muted dark:text-dark-text-muted text-sm">{food.serving}</p>
</div>
```

### Pill Chip Component
```jsx
// Before
<button className="px-3 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-full text-sm border border-gray-200 dark:border-slate-600">
  {label}
</button>

// After
<button className="px-3 py-1 bg-gray-100 dark:bg-dark-bg-secondary/60 text-light-text-secondary dark:text-dark-text-secondary rounded-full text-sm border border-gray-200 dark:border-dark-border backdrop-blur-xs hover:shadow-sm dark:hover:shadow-dark-glow/30 transition-all duration-200">
  {label}
</button>
```

### Container Wrapper Component
```jsx
// Before
<div className="card">
  <h2 className="text-gray-900 dark:text-white text-lg font-semibold mb-4">Title</h2>
  {/* content */}
</div>

// After
<div className="bg-light-bg-soft dark:bg-dark-bg-soft backdrop-blur-premium border border-gray-200 dark:border-dark-border rounded-2xl p-6 shadow-light-card dark:shadow-dark-card transition-all duration-300 hover:shadow-lg dark:hover:shadow-dark-glow">
  <h2 className="text-light-text-primary dark:text-dark-text-primary text-lg font-semibold mb-4">Title</h2>
  {/* content */}
</div>
```

## Accessibility Compliance

### Contrast Ratios Achieved
- **Body Text**: ≥4.5:1 contrast ratio
  - Light mode: #0f172a on #ffffff (18.7:1)
  - Dark mode: #f8fafc on #0f172a (18.7:1)

- **Headings**: ≥3:1 contrast ratio
  - Light mode: #020617 on #ffffff (20.6:1)
  - Dark mode: #f8fafc on #0f172a (18.7:1)

- **Muted Text**: ≥4.5:1 contrast ratio
  - Light mode: #475569 on #ffffff (7.1:1)
  - Dark mode: #94a3b8 on #0f172a (5.9:1)

### Focus States
All interactive elements have visible focus indicators with 2px solid outline and glow effects in dark mode.

## Mobile Performance Optimizations

### Reduced Blur Effects
- Desktop: `backdrop-blur-premium` (12px)
- Mobile: `backdrop-blur-xs` (2px) for better performance

### GPU Acceleration
```css
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform, opacity;
}
```

### Smooth Transitions
```css
.smooth-transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

## Theme Toggle Instant Updates

### Prevent White Flashes
```css
/* Disable transitions during theme change */
.theme-changing * {
  transition: none !important;
}

/* Re-enable after change */
.theme-stable * {
  transition-property: background-color, border-color, color, box-shadow;
  transition-duration: 0.15s;
}
```

## Verification Checklist

- [ ] No visible pure white (#ffffff) filled boxes in dark mode
- [ ] All text has accessible contrast (body ≥4.5:1, headings ≥3:1)
- [ ] Pills, inputs, skeletons have dark backgrounds with visible borders
- [ ] Particles/overlays don't wash out text
- [ ] Theme toggle updates instantly without white flashes
- [ ] Glassmorphism effects work on all containers
- [ ] Neon accents appear on hover in dark mode
- [ ] Mobile performance is optimized with reduced blur effects