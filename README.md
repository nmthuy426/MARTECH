# ToysWeRememberMicorsite

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.7.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Community Gallery

After starting the Angular app, open `http://localhost:4200/gallery` or use the **GALLERY** link in the homepage header/footer. The gallery uses illustrative demo records stored in `src/app/pages/community-gallery/community-gallery.data.ts`. Records are shown only when `ugcConsent` is `true`.

The `community_gallery_view` and `community_story_view` events use the existing `MarTechService`, which currently logs events to the browser console; they are not sent to a backend or analytics platform.

## Updates: Connect – Nurture & Memory Card Download

After a visitor creates a Memory Card, the result page now includes an optional contact form. Visitors can enter an email address or phone number without creating an account. Marketing consent and Community Gallery (UGC) consent are separate and unchecked by default. Visitors can skip the form and still download their card.

For this prototype, contact/consent records are stored in the current browser's `localStorage` under `martech_connect_demo_records`. Cards with explicit UGC consent are stored under `community_user_memories` and can appear in the Gallery on that same browser/device. This is local demo storage only: it is not a shared database, does not send real Zalo/Email messages, and does not synchronize across devices.

The Download Card button creates a PNG file from the current Memory Card information using the browser Canvas API. The export recreates the card's retro visual style and includes the participant's nickname, year, story, and photo when the photo can be loaded by the browser. If a remote photo blocks cross-origin access, the PNG still downloads with a visual placeholder in the photo area.
