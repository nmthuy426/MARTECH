# Changelog

## Community Gallery
- Added `/gallery` route and demo memory cards.
- Gallery displays illustrative cards and approved live stories with UGC consent.
- Added story detail view and Gallery tracking events.

## Connect – Nurture
- Added optional email/phone capture after Memory Card creation; no login is required.
- Marketing consent and UGC/public Gallery consent are separate and unchecked by default.
- Added validation and consent/contact tracking events.
- Uses the existing live event and story stores; no backend or real Zalo/Email integration. Raw contact values are not persisted. Consent impressions retain the create/share/connect schema used by Admin.
- UGC submissions are saved as pending in the existing Admin store; publishing requires Admin approval. Hidden or revoked submissions do not appear in the Gallery.
- Visitors can skip the step and still download their card.

## Memory Card Download
- Connected the Download button to a Canvas-based PNG export.
- Export includes the participant's nickname, year, story, and photo when the browser can load it.
- If a remote photo is blocked by cross-origin restrictions, the image export uses a placeholder in the photo area.

## Main integration
- Retained Admin, the Campaign/Demo switch, branding, mock/live source separation, and all existing analytics event names.
- Kept newly added Gallery, PNG download, photo removal and contact/UGC preferences.
- Campaign stories and consent write to the live store even when Admin is viewing 400-customer mock data.
- Page 4 and Gallery load lazily; no external messaging is enabled.

## Validation
- Production build and unit/integration checks pass with the bundled Node runtime.
- Checked Campaign → contact/UGC → Admin approval → public Gallery in the browser.
