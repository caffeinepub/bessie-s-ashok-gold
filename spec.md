# Specification

## Summary
**Goal:** Automatically send a WhatsApp notification to the shop owner (+919137202881) with full order details whenever a new order is successfully placed.

**Planned changes:**
- After the `placeOrder` mutation resolves successfully on the frontend, construct a pre-filled WhatsApp deep-link URL (`https://wa.me/919137202881?text=<URL-encoded message>`) containing the Order ID, buyer's full name, country, phone number, address, list of ordered items (name and quantity), order total in €, and order timestamp.
- Open the WhatsApp deep-link in a new browser tab (`window.open`) inside the `onSuccess` callback of the `placeOrder` mutation (in `Cart.tsx` or `useQueries.ts`).
- Ensure the WhatsApp tab opening does not block or interfere with the existing order confirmation page redirect.

**User-visible outcome:** After a customer places an order, a new browser tab automatically opens with a pre-filled WhatsApp message to the shop owner containing all order details, while the customer is still redirected normally to the order confirmation page.
