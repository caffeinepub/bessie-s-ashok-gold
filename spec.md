# Bessie's Ashok Gold

## Current State
Full e-commerce site with:
- Shop with 4 categories: Necklace, Bangle, Earrings, Fingering
- Admin panel (password protected: vivek@1870) with product management, order management, stock toggle, order status
- Cart with currency switcher (base EUR), €30 delivery charge
- Customer checkout form (name, country, phone, address)
- Contact page with WhatsApp/email links
- Blob storage component selected for image uploads
- "Ashok Gold" branding in navigation

## Current Problem
Products cannot be added in the admin panel. The error "Failed to add product" appears. Root cause: the backend actor fails to initialize or the addProduct call throws. The blob-storage Mixin is not properly integrated into main.mo (backend edit is restricted), so image upload calls to `_caffeineStorageCreateCertificate` fail silently and the entire product add operation fails.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- Regenerate backend so blob-storage Mixin is properly integrated via the code generator
- Frontend: improve robustness of addProduct flow — when image upload fails, still save the product without image (already coded but needs the actor to be properly initialized)
- Frontend: add a retry mechanism in useActor — if actor is not ready after 3 seconds, retry automatically
- Frontend: show clearer loading state while actor initializes

### Remove
- Nothing

## Implementation Plan
1. Regenerate backend (generate_motoko_code) — this will produce a fresh main.mo with blob-storage Mixin included
2. Update frontend useQueries.ts to handle actor not-ready scenario more gracefully with a wait/retry
3. Deploy
