# AI Rules for this Project

This document outlines the technical stack and specific library usage guidelines for maintaining consistency and best practices within this application.

## Tech Stack Overview

*   **Frontend Framework:** React
*   **Language:** TypeScript
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
*   **UI Component Library:** shadcn/ui (built on Radix UI)
*   **Routing:** React Router DOM
*   **Data Fetching & Caching:** Tanstack Query
*   **Authentication & Database:** Supabase
*   **Form Management & Validation:** React Hook Form with Zod
*   **Notifications:** Sonner (for toasts)
*   **Icons:** Lucide React
*   **Spreadsheet Operations:** XLSX

## Library Usage Rules

To ensure consistency and maintainability, please adhere to the following rules when developing:

*   **UI Components:**
    *   Always prioritize using components from `shadcn/ui`.
    *   If a required component is not available in `shadcn/ui` or needs significant customization, create a new component in `src/components/` that wraps or extends existing `shadcn/ui` primitives, rather than modifying `shadcn/ui` files directly.
*   **Styling:**
    *   All styling must be done using **Tailwind CSS** classes. Avoid inline styles or custom CSS files for individual components (global styles are in `src/index.css`).
    *   Ensure designs are responsive by utilizing Tailwind's responsive utility classes.
*   **Routing:**
    *   Use `react-router-dom` for all client-side navigation.
    *   All primary routes should be defined within `src/App.tsx`.
*   **State Management:**
    *   For local component state, use React's `useState` and `useReducer` hooks.
    *   For global state, server-side data fetching, caching, and synchronization, use `Tanstack Query`.
*   **Authentication & Database:**
    *   All authentication and database interactions (CRUD operations) must be performed using the `Supabase` client, which is configured in `src/integrations/supabase/client.ts`.
*   **Forms & Validation:**
    *   Use `react-hook-form` for managing form state, submissions, and input handling.
    *   Use `zod` for defining form schemas and performing validation.
*   **Notifications:**
    *   Use `sonner` for displaying all toast notifications to the user.
*   **Icons:**
    *   All icons should be imported from the `lucide-react` library.
*   **Date Handling:**
    *   For any date manipulation, formatting, or parsing, use `date-fns`.
*   **Spreadsheet Operations:**
    *   For reading from or writing to spreadsheet files (e.g., Excel), use the `xlsx` library.
*   **File Structure:**
    *   New components should be created in `src/components/`.
    *   New pages should be created in `src/pages/`.
    *   Utility functions should reside in `src/lib/utils.ts` or a new, appropriately named utility file within `src/utils/`.
    *   Keep files small and focused, ideally under 100 lines of code for components.