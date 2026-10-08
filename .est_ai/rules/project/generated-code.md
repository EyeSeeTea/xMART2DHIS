# Generated code

- **Never edit `src/locales/` by hand.** It is generated (and git-ignored) by `yarn localize` from `i18n/*.po`. To change a translation, edit the `.po` file under `i18n/` and run `yarn localize`.
- UI texts go through `i18n.t(...)`, imported from `src/utils/i18n`, so `yarn extract-pot` picks them up.
