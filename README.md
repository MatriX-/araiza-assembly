# Araiza Assembly prototype

Single-page local-service website prototype for Araiza Assembly, a furniture assembly and small furniture-building business serving Moore County, Fayetteville, Raeford, and nearby North Carolina communities.

## Run locally

This is intentionally a dependency-free static prototype.

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173` in a browser. The quote form is a visual prototype and does not send or store submissions. The phone links use `tel:+19105274800`.

## Design read

This is a trust-first local-service landing page for homeowners, renters, and people moving into a new space. It uses a warm paper canvas, deep ink typography, a single muted coral action color, structured service cards, and restrained motion. The structure keeps the information-rich feel of the supplied reference while giving the page more room to breathe on mobile.

The photos in `assets/` were generated specifically for this prototype. They contain no business claims, customer faces, logos, or reviews.

## Before production

- Replace the temporary email copy with the final business email.
- Connect the quote form to the chosen email or form service.
- Replace the prototype Open Graph image path with the deployed absolute URL.
- Add a final canonical URL to the metadata and JSON-LD.
- Confirm service-area wording, hours, travel policy, and any mounting or disposal boundaries.
- Create and verify the Google Business Profile before asking customers for reviews.
- Add a real privacy policy before collecting form submissions.
- Replace or crop generated photography if the business later has permissioned job photos.

## SEO plan

The prototype includes a page title, local meta description, Open Graph fields, a heading hierarchy, click-to-call links, visible service-area language, and a service-area `HomeAndConstructionBusiness` JSON-LD block with no invented address, hours, reviews, awards, or credentials. The public page uses natural phrases such as furniture assembly in Moore County, Fayetteville, and Raeford rather than repeating keywords unnaturally.

The internal pricing and first-five-customer plan is in [docs/pricing-and-marketing.md](docs/pricing-and-marketing.md).
