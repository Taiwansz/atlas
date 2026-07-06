# ADR-009: Frontend Framework Selection (Next.js 15 & CSS Modules)

**Date:** 2026-07-06  
**Status:** Accepted  
**Deciders:** Atlas Architecture Council  
**Technical Area:** Frontend Architecture / User Interface  

---

## Context and Problem Statement

The Atlas Web Dashboard is the visualization portal of the OS. It must load complex dependency graphs, show real-time agent execution traces, display logs, and render live metrics. To deliver a premium, responsive experience, the frontend stack must satisfy:

1. **High Performance:** Initial load times under 1 second. Smooth UI interactions even with large graph render scopes.
2. **Dynamic Server Rendering:** Generating report views on-demand using live data from internal gRPC and PostgreSQL databases.
3. **Clean Styling Paradigm:** Highly customized, premium design system without code inflation or generic "boilerplate" layouts.
4. **Active Ecosystem:** Access to graph visualization components (React Flow, Vis.js) and clean telemetry dashboards.

---

## Decision Drivers

- **Developer Velocity & Routing:** Integrated API routing, code splitting, and layout controls.
- **Render Architecture:** Ability to blend Server-Side Rendering (SSR), Static Site Generation (SSG), and Client-Side Interactive Hydration.
- **CSS Architecture:** Scoped styling that avoids global naming collisions and minimizes runtime styling costs.
- **Future Readiness:** Full support for React 19 features (Server Actions, Suspense, and asset loading).

---

## Considered Options

### Option 1: Single Page Application (Vite + React 19)
- *Description:* A purely client-side React bundle compiled by Vite and served from an S3 bucket.
- *Pros:* Extremely fast local dev server, simple hosting, complete client-side routing.
- *Cons:* Poor SEO, large initial bundle size (everything loaded on day one), lacks native Server-Side Rendering or Server Actions out of the box.

### Option 2: Next.js 15 (App Router, RSC)
- *Description:* Hybrid React framework combining Server Components (RSC) and Client Components.
- *Pros:* Server Components reduce client-side bundle weight, Server Actions simplify API communication, dynamic streaming, and standard page/layout structures.
- *Cons:* Steeper learning curve, requires a Node.js runtime or serverless environment to host SSR paths.

---

## Decision Outcome

**Option 2 (Next.js 15)** was selected.

### Styling Strategy:
To deliver the requested high-end aesthetics, Atlas will use **Vanilla CSS with CSS Modules**.
- **No Tailwind CSS:** To enforce a premium, bespoke layout and prevent the "standardized Tailwind look", we utilize Vanilla CSS variables and CSS modules (`.module.css`).
- **Google Fonts:** Integration with "Outfit" and "JetBrains Mono" for typography.
- **Micro-Animations:** Driven by `framer-motion` and standard CSS transitions.
