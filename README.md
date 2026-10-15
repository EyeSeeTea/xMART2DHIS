## Setup

```
$ nvm use # uses node version in .nvmrc
$ yarn install
```

This project uses **Yarn 4** managed by **Corepack** and declares:

```json
"packageManager": "yarn@4.12.0"
```

### Recommended: disable Corepack auto-pin globally (macOS, zsh)

To avoid Corepack modifying the `package.json` of **other** projects when you run `corepack enable` or `yarn` in repositories that do **not** define `packageManager`, it is recommended to disable the global auto-pin:

1. Open your shell configuration (`zsh`):
    ```bash
    nano ~/.zshrc   # or use code/vim, etc.
    ```
2. Add this line at the end of the file:
    ```bash
    export COREPACK_ENABLE_AUTO_PIN=0
    ```
3. Reload the configuration in the current session:
    ```bash
    source ~/.zshrc
    ```
4. Verify that it is active:
    ```bash
    echo $COREPACK_ENABLE_AUTO_PIN
    # should print: 0
    ```

From that point on, with `corepack enable` active, when you run `yarn` in projects **without** `packageManager`, Corepack will no longer add the `packageManager` field automatically to their `package.json`.

### If you have Yarn 1 globally and see a packageManager error

If running `yarn` shows an error like:

> This project's package.json defines "packageManager": "yarn@4.12.0". However the current global version of Yarn is 1.22.x.

do the following once on your machine:

```bash
# 1) Remove global Yarn (optional but recommended)
npm uninstall -g yarn

# 2) Enable Corepack (shipped with Node 16.9+ / 14.19+)
corepack enable

# 3) Set Yarn 1.x as the default for projects WITHOUT packageManager
corepack prepare yarn@1.22.22 --activate
```

Then, in this project (normal case, once Corepack is enabled):

```bash
nvm use                 # use the version from .nvmrc
yarn install
```

If for some reason `yarn --version` still shows `1.x` inside this repo (for example due to old Corepack state), prepare the Yarn 4 binary without changing the global default or `package.json`:

```bash
COREPACK_ENABLE_AUTO_PIN=0 corepack prepare yarn@4.12.0
yarn --version          # should now print 4.12.0
yarn install
```

After this:

- This repo will use **Yarn 4.12.0**.
- Other repos without `packageManager` will keep using **Yarn 1.22.22** (or whatever you activated with `corepack prepare`).

## Development

Start development server:

```
$ VITE_PORT=8081 VITE_DHIS2_BASE_URL="http://localhost:8080" yarn start
```

Linting:

```
$ yarn lint
```

## Tests

Run unit tests:

```
$ yarn test
```

## Build app ZIP

```
$ yarn build
```

## Setting up a mart in xMART

The app sends data to xMART through three pipelines in each mart:

-   `LOAD_PIPELINE_V2`: registers the other two. It is the only one created by hand.
-   `LOAD_MODEL_V2`: creates or updates the mart's tables and fields.
-   `LOAD_DATA_V2`: loads rows into a table.

Versions up to 0.4.2 use `LOAD_PIPELINE`, `LOAD_MODEL` and `LOAD_DATA` instead.

To set up a mart, or to upgrade one used by a previous version:

1. In the app, run **Test connection** on the connection. If the mart is not set up, the setup dialog opens (also available from the **Help setting up pipeline** action).
2. In xMART, open the mart's pipelines page (`https://portal-uat.who.int/xmart4/<MART>/pipelines` for UAT, `https://extranet.who.int/xmart4/<MART>/pipelines` for PROD) and click **New** above the list (**Create a Pipeline** if the mart has no pipelines yet).
3. Create a pipeline with the code `LOAD_PIPELINE_V2` and the type **Normal**, not Flow.
4. Paste the XML shown in the dialog's last step into the pipeline's configuration and click **Publish**.
5. Run **Test connection** again: it registers `LOAD_MODEL_V2` and `LOAD_DATA_V2` and the connection shows as working.

The previous pipelines are left untouched, so a mart can be used by this version and older ones at the same time. Once no older installation uses the mart, `LOAD_PIPELINE`, `LOAD_MODEL` and `LOAD_DATA` can be deleted in xMART, together with any leftover `xMART2DHIS_*` documents in DHIS2.

## Some development tips

### Structure

-   `i18n/`: Contains literal translations (gettext format)
-   `public/`: Main app folder with a `index.html`, exposes the APP, contains the feedback-tool.
-   `src/pages`: Main React components.
-   `src/domain`: Domain layer of the app (clean architecture)
-   `src/data`: Data of the app (clean architecture)
-   `src/components`: Reusable React components.
-   `src/types`: `.d.ts` file types for modules without TS definitions.
-   `src/utils`: Misc utilities.
-   `src/locales`: Auto-generated, do not update or add to the version control.

### i18n

```
$ yarn update-po
# ... add/edit translations in i18n/*.po files ...
$ yarn localize
```

### App context

The file `src/contexts/app-context.ts` holds some general context so typical infrastructure objects (`api`, `d2`, ...) are readily available. Add your own global objects if necessary.
