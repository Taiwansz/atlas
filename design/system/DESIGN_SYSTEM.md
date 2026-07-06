# Design System — UI Component System

> **Document Status:** Authoritative Reference  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-06  
> **Owner:** Atlas Design System Team  

---

## 1. CSS Design Tokens

These core CSS variables define our tokens for layout grid alignment, color maps, borders, and typography scales. Place these inside the root stylesheet `index.css`.

```css
:root {
  /* Color Palette */
  --bg-color: #09090b;
  --surface-color: #18181b;
  --surface-hover: #202024;
  --border-color: #27272a;
  
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;

  --accent-color: #00d2ff;
  --accent-glow: rgba(0, 210, 255, 0.15);
  
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #3b82f6;

  /* Typography */
  --font-display: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;

  /* Sizing and Spacing */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-xxl: 64px;

  /* Animations */
  --transition-smooth: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## 2. Core Global Layout System

Atlas pages are aligned on a **12-column fluid grid system** with a maximum container width of `1280px` and variable padding gutters:

```css
.layout__container {
  width: 100%;
  max-width: 1280px;
  margin-right: auto;
  margin-left: auto;
  padding-right: var(--space-lg);
  padding-left: var(--space-lg);
}

.layout__grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-lg);
}
```

---

## 3. UI Components Code Library

### 3.1 Card Component

Used to display modular features, system metrics, and database statistics.

```html
<div class="card card--interactive">
  <div class="card__header">
    <h3 class="card__title">Stripe Integration</h3>
    <span class="badge badge--success">Active</span>
  </div>
  <div class="card__body">
    <p>Auto-generating client endpoints from approved blueprint interfaces.</p>
  </div>
</div>
```

```css
.card {
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  transition: var(--transition-smooth);
}

.card--interactive:hover {
  border-color: var(--accent-color);
  background-color: var(--surface-hover);
  box-shadow: 0 4px 20px var(--accent-glow);
  transform: translateY(-2px);
}

.card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.card__title {
  font-family: var(--font-display);
  color: var(--text-primary);
  font-size: 1.125rem;
  margin: 0;
}
```

### 3.2 Button Component

```html
<button class="btn btn--primary">Approve Blueprint</button>
<button class="btn btn--secondary">Discard Draft</button>
```

```css
.btn {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 0.875rem;
  padding: 10px 18px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-smooth);
}

.btn--primary {
  background-color: var(--accent-color);
  color: var(--bg-color);
  border: 1px solid var(--accent-color);
}

.btn--primary:hover {
  background-color: transparent;
  color: var(--accent-color);
  box-shadow: 0 0 15px var(--accent-glow);
}

.btn--secondary {
  background-color: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.btn--secondary:hover {
  border-color: var(--text-primary);
  color: var(--text-primary);
}
```

### 3.3 Status Badge Component

```html
<span class="badge badge--success">Compliant</span>
<span class="badge badge--danger">Failed</span>
<span class="badge badge--warning">Draft</span>
```

```css
.badge {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
}

.badge--success {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
  border: 1px solid var(--color-success);
}

.badge--danger {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
  border: 1px solid var(--color-danger);
}

.badge--warning {
  background-color: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
  border: 1px solid var(--color-warning);
}
```

### 3.4 Interactive Graph Canvas

For rendering Neo4j-derived dependency charts:

```css
.graph__canvas {
  width: 100%;
  height: 500px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
  background-image: 
    radial-gradient(var(--border-color) 1px, transparent 1px);
  background-size: 20px 20px;
}
```
