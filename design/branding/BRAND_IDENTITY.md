# Brand Identity & Design Guidelines

> **Document Status:** Authoritative Reference  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-06  
> **Owner:** Atlas Brand & Design Team  

---

## 1. Brand Vision & Positioning

**Atlas** is the Engineering Operating System for the AI Era. Its brand identity reflects **discipline, architectural stability, premium quality, and state-of-the-art developer engineering.** 

Unlike typical startup websites that use saturated colors, generic illustrations, and crowded bento boxes, the Atlas visual language is inspired by **high-end technical agencies, industrial brutalism, and editorial layout standards.** It is clean, spacious, structural, and visually commanding.

- **Tone of Voice:** Authoritative, direct, technical, precise, and uncompromising.
- **Design Metaphor:** The "Titan's Pillar" — solid architectural structures, structural wireframes, blueprint layouts, and thin, sharp dividing lines.

---

## 2. Logo System

The Atlas logo is a combination of a geometric symbol (the Icon) and a custom wordmark (the Type).

```
    Icon Concept: The Pillar / Coordinate Node
    
           ▲
         /   \
       /       \
     /           \
    │     ▲     │
    │   /   \   │
    │           │
    └───────────┘
```

- **Symbol Description:** An isometric drawing of an architectural pillar segment that doubles as a coordinate system node. It represents holding up the system's weight while mapping its complex structure.
- **Wordmark Typography:** Set in custom semi-extended **Outfit Bold** with geometric alignment.
- **Usage Rules:**
  - Standard version is cyber-white on obsidian background.
  - The icon can be used stand-alone on CLI screens or browser tab favicons.
  - Minimum clearance area of 100% of the icon's width must surround it in all applications.

---

## 3. Color Palette

Our color palette is curated to match sleek, dark-tech environments. We avoid pure primaries and rely on sophisticated HSL tones:

| Color Name | Hex Code | HSL Representation | Primary Application |
|------------|----------|--------------------|---------------------|
| **Obsidian (Bg)** | `#09090b` | `hsl(240, 10%, 3.9%)` | Primary page and console background. |
| **Coal (Surface)** | `#18181b` | `hsl(240, 5.9%, 10%)` | Card panels, sidebars, active input background. |
| **Titanium (Border)**| `#27272a` | `hsl(240, 5.9%, 16.7%)` | Standard dividers and container borders. |
| **Atlas White** | `#fafafa` | `hsl(0, 0%, 98%)` | Main headings and primary text. |
| **Muted Silver** | `#a1a1aa` | `hsl(240, 5%, 64.9%)` | Subheadings and body descriptions. |
| **Cyber Blue** | `#00d2ff` | `hsl(190, 100%, 50%)` | Interactive highlights, links, code tags. |
| **Toxic Green** | `#10b981` | `hsl(162, 76%, 41%)` | Validated state indicator, positive score. |
| **Alert Amber** | `#f59e0b` | `hsl(38, 92%, 50%)` | Drift warning state, pending reviews. |
| **Emergency Red** | `#ef4444` | `hsl(0, 84%, 60%)` | Constitutional failure state. |

---

## 4. Typography

Typography is a primary brand signifier. We use two Google Fonts families to separate interface content from technical specifications:

- **Primary Display Font: Outfit** (Google Fonts)
  - *Weights:* Light (300), Regular (400), Medium (500), SemiBold (600), Bold (700)
  - *Usage:* Page titles, subheadings, UI buttons, and navigation nodes.
- **Secondary Monospace Font: JetBrains Mono** (Google Fonts)
  - *Weights:* Regular (400), Medium (500), Bold (700)
  - *Usage:* CLI outputs, codebase paths, schema declarations, Protobuf definitions, and mathematical values.

---

## 5. UI Layout & Styling Guidelines

To ensure the web interface feels premium and clean:
1. **Borders over Shadows:** Container depth is established using thin, solid borders (`1px solid var(--border-color)`) rather than heavy blurred drop-shadows.
2. **Generous Spacing:** Pages must breathe. Hero sections should feature a minimum of `80px` vertical padding. Elements should have spacious margins to prevent cognitive overload.
3. **Subtle Interactive Motion:** Hover states utilize smooth CSS ease-in-out transitions (`transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1)`).
4. **Hardware-Accelerated Glows:** Subtle, low-opacity background gradients (`radial-gradient` backgrounds) create high-end "cybernetic illumination" effects behind key containers without affecting text legibility.
