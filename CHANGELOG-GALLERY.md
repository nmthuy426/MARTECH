# Changelog

## Community Gallery
- Added `/gallery` route and demo memory cards.
- Gallery only displays records with UGC consent.
- Added story detail view and Gallery tracking events.

## Connect – Nurture
- Added optional email/phone capture after Memory Card creation; no login is required.
- Marketing consent and UGC/public Gallery consent are separate and unchecked by default.
- Added validation and consent/contact tracking events.
- Stores prototype records in browser `localStorage`; no backend or real Zalo/Email integration.
- When UGC consent is granted, the current card is added to the Gallery on the same browser/device only.
- Visitors can skip the step and still download their card.

## Memory Card Download
- Connected the Download button to a Canvas-based PNG export.
- Export includes the participant's nickname, year, story, and photo when the browser can load it.
- If a remote photo is blocked by cross-origin restrictions, the image export uses a placeholder in the photo area.

## Validation notes
- Source changes were reviewed, but a full Angular build could not be completed in this environment because the dependency installation was incomplete/offline and the available Node version (22.16.0) is below the Angular 22 package engine requirement shown by npm (22.22.3+).
