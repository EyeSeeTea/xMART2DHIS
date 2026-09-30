# Yarn Resolutions

This file documents every entry in the `resolutions` block of `package.json`. Each entry answers
three questions: **why it exists**, **what it fixes** and **when it can be removed**.

`package.json` doesn't allow comments, so this file is the only place that knowledge lives. **If you
add or remove a resolution, update this file in the same commit.**

The format and conventions follow
[dhis2-app-skeleton/RESOLUTIONS.md](https://github.com/EyeSeeTea/dhis2-app-skeleton/blob/master/RESOLUTIONS.md).
Read its _Conventions_ section before adding an entry. The short version:

-   A security pin is a **floor** and takes a `^` range. An exact version decays: `axios: 1.13.5`,
    `qs: 6.14.2`, `form-data: 4.0.4`, `minimatch: 3.1.3` and `brace-expansion: 1.1.12` were all written
    to fix an advisory here and all ended up holding the tree at a vulnerable version.
-   An exact version is a **fixture**: something binds to that release. Write the condition for
    unpinning it.
-   Prefer `parent/child` to a global entry, and re-resolution (`yarn up -R <package>`) to any entry.
-   Test an entry by removing it, forcing re-resolution and comparing the **resolved versions**, not
    the lockfile bytes. Some packages resolve _downwards_ when their entry is removed.
-   Verify with the tool that uses the package, not only with `yarn install`.

## Audit cadence

Re-audit monthly, before every release and before requesting review on a dependency change:
`yarn npm audit --recursive`, plus the Dependency-Track analysis of the branch, which is what the CI
gate reads. The two score severity from different sources, so do not mix their counts.

## Active resolutions

### Security floors

#### `axios: ^1.18.0`

-   **Why:** direct dependency, and runtime: every xMART and DHIS2 request goes through it.
    `@eyeseetea/d2-api` requests exactly `1.6.4`. The direct dependency is kept on the same range so
    the manifest does not declare an older one.
-   **Fixes:** the 11 high advisories open against 1.13.5, patched up to 1.16.0 (among them
    GHSA-hfxv-24rg-xrqf, ReDoS via cookie names), and GHSA-42h9-826w-cgv3 (medium, 1.18.0).
-   **Drop when:** every consumer requests `^1.18.0` or later. `@eyeseetea/d2-api` is the blocker.

#### `lodash: ^4.18.0`

-   **Why:** `@eyeseetea/d2-api` and `@eyeseetea/d2-ui-components` request exactly `4.17.21`. Without
    the entry lodash resolves _down_ to it.
-   **Fixes:** GHSA-f23m-r3pf-42rh, GHSA-xxjr-mmjv-4gpg and the other advisories fixed in 4.18.0.
-   **Drop when:** both EyeSeeTea libraries request `^4.18.0`. Fixable upstream, and that removes the
    entry from every app that uses them.

#### `qs: ^6.16.0`

-   **Why:** `@eyeseetea/d2-api` builds every DHIS2 query string with `qs.stringify`, so this is
    runtime, and it requests exactly `6.9.7`. Its output was compared between 6.14.2 and 6.16.0 over DHIS2 query parameters: identical.
-   **Fixes:** GHSA-q8mj-m7cp-5q26, GHSA-4mjr-xmp4-gh2g, GHSA-x5fp-wj9c-mxmx.
-   **Drop when:** every consumer requests `>= 6.16.0`. `@eyeseetea/d2-api` is the blocker.

#### `node-fetch: ^2.6.7`

-   **Why:** load-bearing. Without it `node-fetch@1.7.3` comes back through a consumer requesting
    `^1.0.1`, and that range cannot reach the fix. As a floor it resolves 2.7.0.
-   **Fixes:** GHSA-r683-j2x4-v87g.
-   **Drop when:** `yarn why node-fetch -R` shows no consumer requesting the 1.x line.

#### `@babel/runtime: ^7.26.10`

-   **Why:** load-bearing. Without it `@babel/runtime@7.0.0-beta.42` comes back.
-   **Fixes:** GHSA-968p-4wvh-cqc8 (inefficient RegExp in generated code, fixed in 7.26.10).
-   **Drop when:** `yarn why @babel/runtime -R` shows no consumer requesting a pre-7.26.10 release.

### Scoped security pins

#### `i18next-conv/node-gettext: ^3.0.1`

-   **Why:** `i18next-conv@6.1.1`, under `@dhis2/d2-i18n-extract` and `@dhis2/d2-i18n-generate`,
    requests `node-gettext@^2.0.0`. ⚠️ The advisory records no patched version, so tooling reports it
    as unfixable, but its range is `<= 3.0.0` and 3.0.1 is published. Build-only: it runs in
    `yarn localize`, which generates the same translations with 3.0.1.
-   **Fixes:** GHSA-g974-hxvm-x689 (high), prototype pollution.
-   **Drop when:** `i18next-conv` requests `node-gettext@^3.0.1` or drops it, or the archived
    `@dhis2/d2-i18n-*` packages are replaced.

#### `react-linkify/linkify-it: ^5.0.2`

-   **Why:** `@eyeseetea/d2-ui-components` requests exactly `react-linkify@1.0.0-alpha`, which requests
    `linkify-it@^2.0.3`; the 2.x line has no fix. `<Linkify>` still renders URL and `mailto:` links with
    linkify-it 5, as the skeleton found.
-   **Fixes:** GHSA-v245-v573-v5vm, GHSA-22p9-wv53-3rq4 (high), quadratic-complexity DoS.
-   **Drop when:** `@eyeseetea/d2-ui-components` drops or replaces `react-linkify`.

#### `refractor/prismjs: ^1.30.0`

-   **Why:** `react-code-blocks` (the `CopyBlock` in the pipeline setup dialog) uses
    `react-syntax-highlighter`, whose `refractor@3` requests `prismjs@~1.27.0`. No `react-code-blocks`
    release changes that. `CopyBlock` still highlights HTML with prism-core 1.30.
-   **Fixes:** GHSA-x7hr-w5r2-h6wg, DOM clobbering.
-   **Drop when:** `react-syntax-highlighter` moves to a `refractor` that requests `prismjs >= 1.30.0`,
    or `react-code-blocks` is replaced.

#### `@eyeseetea/d2-ui-components/moment: ^2.31.0`

-   **Why:** `@eyeseetea/d2-ui-components@2.11.0` requests exactly `moment@2.29.4`; everything else in
    the tree already resolves 2.31.0. Its date helpers format as before.
-   **Fixes:** GHSA-4p3w-j4w9-5jqw, path traversal via a non-string locale name
    (`>= 2.29.2, < 2.31.0`).
-   **Drop when:** `@eyeseetea/d2-ui-components` requests `>= 2.31.0`.

### Fixtures

#### `i18next: 19.8.5`

-   **Why:** added with the Snyk pass of `629530f` for SNYK-JS-I18NEXT-575536, -585930 and -1065979,
    which are not in the GitHub advisory database. Without it `i18next@10.6.0` comes back under
    `@dhis2/d2-i18n` and `i18next-scanner`. The skeleton keeps the same exact version.
-   **Drop when:** the archived `@dhis2/d2-i18n` stack is replaced, or it is shown that a `^19.8.5`
    floor works for every consumer.

#### `@types/react: 17.0.38`

-   **Why:** the app runs React 17. Without it some packages bring `@types/react@19.3.0` and `tsc`
    fails in `src/index.tsx`.
-   **Drop when:** the app moves to the React version those types describe.

## Rejected pins

| Pin                            | What breaks                                                                                                      |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `brace-expansion: ^5` (global) | `minimatch@3.x` fails with `expand is not a function`. Measured in the skeleton; every minimatch line is patched |

## Known findings with no fix available

#### `elliptic@6.6.1`, GHSA-848j-6mx2-7j84

-   **Chain:** `vite-plugin-node-polyfills` → `node-stdlib-browser` → `crypto-browserify` →
    `browserify-sign` and `create-ecdh`.
-   **Why it cannot be fixed:** the advisory covers every version `<= 6.6.1`, and 6.6.1 is the latest
    release.
-   **Impact:** the polyfills are there because `md5.js` (`src/utils/uid.ts`) needs `Buffer`. The ECDSA
    path is never reached.
-   **Drop when:** `elliptic` publishes a fix, or `md5.js` is replaced and the polyfills leave the tree.

#### `react-router` and `react-router-dom` 6.30.6, GHSA-wrjc-x8rr-h8h6 and GHSA-337j-9hxr-rhxg

-   **Why it cannot be fixed here:** both are patched in 7.18.0 only, and 6.30.6 is the last v6
    release. Moving to v7 changes the routing API, so it is a migration, not a bump.
-   **Severity:** medium, below the high threshold the CI gate reads.
-   **Drop when:** the app migrates to react-router v7.

#### `eslint@8.57.1`, GHSA-p5wg-g6qr-c7cg

Not in the tree any more (ESLint 9.39.5), but worth knowing: GitHub withdrew this advisory on
2026-02-03, and scanners can keep reporting it. Dismiss it; do not remediate it.
