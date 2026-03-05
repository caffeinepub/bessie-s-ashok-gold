# Bessie's Ashok Gold

## Current State
Full e-commerce site with Home, Shop, Cart, Contact, Admin pages. Currently uses a neutral white/cream palette with gold accents and dark/charcoal text. Navigation, footer, product cards, hero, trust bar, admin panel all exist.

## Requested Changes (Diff)

### Add
- Vibrant bright color palette: vivid warm backgrounds (bright amber/yellow/orange tones) across hero, trust bar, section backgrounds, cards, navigation, footer
- Strong black (#000 / text-black) for ALL text, labels, headings, nav links, button text, descriptions, prices — everywhere previously using charcoal, foreground, muted-foreground

### Modify
- `index.css` CSS variables: set background to near-white or light warm tone, foreground/text tokens to pure black
- `tailwind.config.js`: update cream/charcoal colors; add bright accent colors (amber, yellow, warm orange)
- `Navigation.tsx`: bright vivid background (e.g. amber-400 or yellow-400), all nav links text-black, logo area, cart icon in black
- `Footer.tsx`: bright vivid background, all text in black
- `Home.tsx`: hero section bright warm gradient overlay, all text black; trust bar bright background; featured section bright bg; brand story bright bg; footer CTA strip bright instead of charcoal (use amber/yellow)
- `Shop.tsx`: page background bright, text black, filter inputs with black text
- `Cart.tsx`: bright backgrounds for summary cards, all text black
- `Contact.tsx`: bright hero banner, cards with black text
- `Admin.tsx`: admin panel cards/tabs with black text
- `ProductCard.tsx` (if any dark backgrounds): ensure text is black
- All buttons: primary CTAs remain visually bold but with black text on bright backgrounds, or white text on very dark buttons kept where needed for contrast
- Gold accent color: keep gold but ensure it reads on bright backgrounds

### Remove
- Dark/charcoal backgrounds (bg-charcoal, dark CTA strip)
- Low-contrast muted gray text tones — replace with black

## Implementation Plan
1. Update `index.css` CSS variables: set `--background` to bright warm light, `--foreground` / `--card-foreground` / `--popover-foreground` to pure black (oklch 0 0 0)
2. Update `tailwind.config.js`: add bright amber/yellow colors, update charcoal to near-black, cream to bright warm
3. Update `Navigation.tsx`: bright amber/yellow sticky header, black text on all links
4. Update `Footer.tsx`: bright vivid footer background, black text
5. Update `Home.tsx`: hero warm bright gradient, black headings/body text; trust bar bright amber bg; featured section white/bright bg, black text; brand story bright bg; CTA strip use bright amber instead of charcoal with black text
6. Update `Shop.tsx`: bright page background, black text labels and filter controls
7. Update `Cart.tsx`: bright card backgrounds, black text in forms and summary
8. Update `Contact.tsx`: bright hero, black text on cards
9. Update `Admin.tsx`: bright card/panel backgrounds, black text throughout
10. Validate and build
