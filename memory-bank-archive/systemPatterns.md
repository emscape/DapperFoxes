# System Patterns

This file documents recurring patterns and standards used in the project.
It is optional, but recommended to be updated as the project evolves.
2025-03-22 20:40:00 - Log of updates made.

*

## Coding Patterns

* **File Organization:**
  * HTML files in root directory
  * CSS in /css directory
  * JavaScript in /js directory
  * Images in /images directory
  * Vendor libraries in /vendor directory

* **Naming Conventions:**
  * HTML files: kebab-case.html (e.g., photo-gallery.html)
  * CSS classes: BEM methodology (Block__Element--Modifier)
  * JavaScript functions: camelCase
  * JavaScript constants: UPPER_SNAKE_CASE

* **Responsive Design:**
  * Mobile-first approach
  * Media queries for tablet and desktop breakpoints
  * Fluid typography and spacing

## Architectural Patterns

* **Component-Based Structure:**
  * Modular components for reusability
  * Clear separation of concerns
  * Consistent styling across components

* **Form Handling:**
  * Client-side validation
  * Serverless function processing
  * Email notification system
  * Admin approval workflow

* **Content Management:**
  * Admin interface for content moderation
  * Approval system for user-generated content
  * Integration with Google services

## Testing Patterns

* **Cross-Browser Testing:**
  * Chrome, Firefox, Safari, Edge
  * Mobile browsers (iOS Safari, Android Chrome)

* **Responsive Testing:**
  * Mobile devices (320px+)
  * Tablets (768px+)
  * Desktops (1024px+)

* **Performance Testing:**
  * Page load time
  * Image optimization
  * Code minification