# Migration Plan: Removing Solar Farms/Projects from Type 3 Solar Platform

**Objective:**  
Completely eliminate all code, UI, database, and content related to solar farms/projects, refocusing the platform on products, sales, and associated services.

---

## 1. Preparation

- **Backup:**  
  - Backup the database (Supabase export).
  - Backup the codebase (create a new branch or tag).
- **Team Communication:**  
  - Notify all stakeholders of the migration timeline and expected changes.

---

## 2. Comprehensive Audit

- **Search for all references to:**  
  - `solar_farms`
  - `projects`
  - “Solar Farms”, “Projects”, “Farm”, etc. (case-insensitive, including in comments, docs, and UI text)
- **Tools:**  
  - Use codebase-wide search (e.g., VSCode, ripgrep).
  - Search in Supabase for tables, views, RLS, triggers, and functions.
  - Search in assets, documentation, and tests.

---

## 3. Database Migration

- **Drop/Archive Tables:**  
  - `solar_farms` table (and any related tables: e.g., farm_investments, farm_reports, etc.)
- **Remove RLS Policies:**  
  - Delete Row Level Security (RLS) policies, triggers, and functions attached to removed tables.
- **Foreign Keys & References:**  
  - Remove or update foreign key constraints in related tables.
- **Migrations:**  
  - Document all SQL migrations for rollback if needed.

---

## 4. Backend/API Layer

- **Remove Endpoints:**  
  - Delete all API endpoints/functions that interact with solar farms/projects.
- **Supabase Queries:**  
  - Remove or refactor queries referencing solar farms/projects.
- **Shared Logic:**  
  - Remove helpers, utilities, or constants related to solar farms/projects.

---

## 5. Frontend (React) Codebase

### a. Pages & Components

- **Delete:**  
  - `/project/src/pages/admin/SolarfarmsProjects.tsx`
  - `/project/src/pages/admin/SolarfarmsInvestors.tsx`
  - `/project/src/pages/admin/SolarfarmsCalculator.tsx`
  - `/project/src/pages/admin/SolarfarmsReturns.tsx`
  - `/project/src/pages/SolarFarms.tsx`
  - Components: SolarFarmCard, ProjectList, ProjectDetails, etc.
- **Update Admin Dashboard:**  
  - Remove all widgets, cards, and charts referencing solar farms/projects.
  - Refocus dashboard on product, sales, and service data.

### b. State Management

- **Remove:**  
  - Context providers, Redux slices, or hooks related to solar farms/projects.

### c. Navigation & Routing

- **Update:**  
  - Remove sidebar, navbar, and menu links to solar farm/project pages (e.g., in AdminLayout.tsx, Navbar.tsx).
  - Remove or redirect routes for deleted pages.
  - Ensure navigation is focused on products, sales, and services.

### d. UI/UX & Copy

- **Audit and Update:**  
  - Remove all textual and visual references to solar farms/projects (Home, Dashboard, etc.).
  - Update landing pages, about pages, and marketing content.
  - Ensure all tooltips, error messages, and notifications are updated.

### e. Assets

- **Delete:**  
  - Images, icons, and illustrations specific to solar farms/projects.

---

## 6. Types, Models, and Helpers

- **Remove:**  
  - TypeScript interfaces, types, and helper functions related to solar farms/projects.

---

## 7. Testing

- **Delete or update:**
  - Unit, integration, and E2E tests referencing solar farms/projects.

---

## 8. Summary of Audit Results

**Database:**
- `solar_farms` table and related tables (e.g., `farm_investments`, `farm_reports`)
- RLS policies, triggers, and functions related to `solar_farms`
- Foreign key constraints referencing `solar_farms`

**Backend/API:**
- All Supabase queries referencing `solar_farms`
- API endpoints/functions for solar farms/projects
- Helpers/utilities/constants related to solar farms/projects

**Frontend:**
- Pages/components listed above
- Navigation/sidebar/menu links (AdminLayout.tsx, Navbar.tsx)
- Dashboard cards/widgets/charts referencing solar farms/projects
- Textual/visual references in Home, Dashboard, and other pages
- Interfaces/types like `SolarFarm`
- Contexts, hooks, Redux slices for solar farms
- Images, icons, and illustrations specific to solar farms/projects
- Unit/integration/E2E tests referencing solar farms/projects

---

## 9. Next Steps

1. **Remove/Archive Database Tables and Policies**
   - Prepare and execute SQL migration scripts for dropping/archiving relevant tables and policies.
2. **Delete/Refactor Backend/API Code**
   - Remove all Supabase and API code referencing solar farms.
3. **Delete Frontend Pages, Components, and Routes**
   - Remove all identified files and references in navigation.
4. **Remove Types, Helpers, State Management**
   - Clean up TypeScript types, context providers, and helpers.
5. **Remove/Update Assets and Tests**
   - Delete or update images, icons, and tests.

---

**Proceed with the above steps to fully remove solar farms/projects from the Type 3 Solar Platform.**

- **Delete/Update:**  
  - Unit, integration, and end-to-end tests referencing solar farms/projects.
  - Update test data and mocks.

---

## 8. Documentation

- **Update:**  
  - README, onboarding docs, and internal documentation.
  - Remove all references to solar farms/projects.
  - Document new business focus.

---

## 9. Review & QA

- **Manual Review:**  
  - Check for any missed references in code, UI, and documentation.
- **Automated Tests:**  
  - Run all tests to ensure nothing is broken.
- **Accessibility & Responsiveness:**  
  - Ensure the updated UI remains accessible and responsive.

---

## 10. Deployment

- **Staging:**  
  - Deploy to staging for stakeholder review.
- **Production:**  
  - Deploy to production after approval.

---

## 11. Post-Migration

- **Monitor:**  
  - Monitor for errors or missed references post-launch.
- **Feedback:**  
  - Gather feedback from users and stakeholders for further refinement.

---

## Detailed Checklist

- [ ] Backup database and codebase
- [ ] Remove all database tables, RLS, and references for solar farms/projects
- [ ] Remove all backend/API logic for solar farms/projects
- [ ] Delete all frontend pages, components, and routes for solar farms/projects
- [ ] Update navigation (sidebars, navbars, menus) to remove solar farm/project links
- [ ] Remove all types, helpers, and state management for solar farms/projects
- [ ] Delete or update all tests referencing solar farms/projects
- [ ] Remove or update all assets (images, icons) for solar farms/projects
- [ ] Update all documentation and marketing content
- [ ] Refactor admin dashboard and landing pages for new business focus
- [ ] Run full QA and accessibility checks
- [ ] Deploy and monitor

---

**Note:**  
This migration should be performed on a feature branch and reviewed by at least one other developer. All changes should be tested in staging before going live.
