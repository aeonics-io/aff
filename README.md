# Aeonics Frontend Framework (AFF)

AFF is a lightweight, pure-vanilla JavaScript starter for single page applications that talk to your backend over REST. It ships as standard ES modules and CSS so you can drop it onto any static host without a build or transpilation step.

## Why this approach?
- **Zero build tooling.** Everything is modern browser-native (ES modules, dynamic `import()`, `fetch`), so the footprint stays small and future browser changes have minimal impact.
- **UI-only focus.** Pages render UI and delegate logic to your APIs, keeping the frontend thin and asynchronous by design.
- **Composable utilities.** DOM helpers, notifications, modals, translation, and AJAX utilities are provided as small modules you can mix and match.

## Repository layout
- `ae/`: Reusable core assets shared by any site (JS modules in `ae/js`, lazy-loaded CSS in `ae/css`, shared images in `ae/img`).
- `demo/`: Example site consuming the core. Copy or mirror this structure for your own project and point the core to your shared `ae/` folder.

## Getting started
1. Serve the repo (or your site folder) from any static server. No bundler is required.
2. In your HTML, configure the core and site paths on a shared global before starting the app using the import map alias `core`:
   ```html
   <script>
     globalThis.config = {
       corePath: new URL('../ae/', location.href).href,
       sitePath: new URL('./', location.href).href,
       noCache: false,
       defaultPage: 'home',
       defaultLocale: 'en',
     };
   </script>
   <script type="importmap">
     {
       "imports": {
         "core": "../ae/js/index.js"
       }
     }
   </script>
   <script type="module">
     import { App } from 'core';
     const app = new App();
     app.setup();
   </script>
   ```
   The `setup()` call waits for DOM readiness, loads core CSS, optional translation files, and registers hash-based navigation.

The import map keeps your page modules free from long relative paths and ships utilities and helpers from the core classes.

## Core concepts
- **Routing via hash fragments.** `App` inspects the URL and  loads pages from `./js/pages/<name>.js` where the name is pulled from the `hash (#)` part of the URL. I.e.: `#home` loads `home.js`.
- **Pages are simple modules.** Export a `Page` subclass: Implement `show()` (and optionally `hide()`) and populate `this.dom` with your UI.
- **DOM helpers.** `Node` builds elements without templating engines (e.g., `Node.div({className: 'box'}, [Node.h2('Title'), Node.p('Copy')])`).
- **REST-friendly fetch.** `Ajax.fetch/get/post` wrap `fetch` with timeouts, credential support, and automatic JSON parsing. Authorization headers can be provided globally or per call.
- **UX utilities.**
  - `Notify` shows transient toast messages (`info/warning/success/error`).
  - `Modal` provides alert/confirm/prompt helpers and custom modal scaffolding.
  - `Translator` lazy-loads locale bundles (`./js/locale/<lang>/<name>.js`) and replaces `{}` placeholders.
  - `Cookie` offers small helpers to set/get/unset cookies with sane defaults.
- **Configuration.** Create `globalThis.config = {}` in your HTML before importing modules, then set `corePath` and `sitePath` values. The core reads from that shared object and loads the site defaults.

## Creating your own pages
1. Create `js/pages/dashboard.js` under your site folder.
2. Export a `Page` subclass:
   ```js
   import { Page, Node } from 'core';

   class DashboardPage extends Page
   {
     async show() {
       document.title = 'Dashboard';
       if (this.dom.children.length === 0) this.init();
     },
     init() {
       this.dom.append(
         Node.h2('Dashboard'),
         Node.p('Data comes from your REST endpoints.')
       );
     }
   });

   const page = new CustomPage();
   export { page as default };
   ```
3. Navigate to `#dashboard` to load it. Implement `hide()` if you need teardown logic when leaving the page.

## Loading styles
- Call `css('<name>')` to load `<sitePath>/css/<name>.css` (the `.css` suffix is optional). Calls are asynchronous by design—invoke
  them at the top of your module to start loading early. Requests are deduped per final URL so repeated calls are safe.

## Working with translations
- Place translation files under `js/locale/<lang>/<name>.js` exporting a key/value object.
- Call `locales('<name>')` to pull the bundle for the current locale from `<sitePath>/js/locale/<lang>/`. This call is synchronous so
  the bundle is available for the rest of the code, then use `Translator.get('key')` to inject values in your page.

## Notifications and modals
- Toasts: `Notify.success('Saved')`, `Notify.error('Failed')`, etc. Multiple toasts queue with a cap to avoid overload.
- Dialogs: `await Modal.alert('Message')`, `await Modal.confirm('Proceed?')`, or `await Modal.prompt('Name', formElement)`. CSS for these widgets is lazy-loaded when first used.

## AJAX helper
- `Ajax.get(url, { data, headers, timeout, withCredentials })` and `Ajax.post(url, { data, headers, timeout, withCredentials })` return a Promise resolving to `{ status, headers, response, rawResponse }` or rejecting with the same shape on errors.
- For authenticated flows, set `Ajax.authorization = 'Bearer <token>'` or pass `user/password` for basic auth. A 403 response clears the stored token cookie and reloads the page by default.

## Keeping it maintainable
AFF avoids custom syntax, build tools, or heavy dependencies. You use native ES modules, the DOM, and `fetch`, so the code stays readable, debuggable in the browser, and resilient to shifts in third-party tooling. Use only what you need from the utilities, and keep your business logic on the server—this repository stays focused on rendering a responsive UI shell.
