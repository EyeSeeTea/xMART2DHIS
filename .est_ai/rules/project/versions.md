# Versions — project vs reference

The project runs older major versions than the reference (`dhis2-app-skeleton`). When replicating a reference file, adapt it to the project's versions; never use an API the project's version does not have, and never upgrade a dependency as a side effect of a change.

| Library            | Project | Reference | Watch out for                                                                    |
| ------------------ | ------- | --------- | -------------------------------------------------------------------------------- |
| `react`            | 17.0.2  | 18.2      | No `createRoot`, `useId`, `useTransition`, `useSyncExternalStore`                |
| `react-router-dom` | 6.30    | 5.3       | The project is **newer**: use `useNavigate`, `<Routes>`, `element` — not `useHistory`, `<Switch>`, `component` |
| `@dhis2/ui`        | 7.15    | 10        | Components and props added after v7 do not exist                                 |
| `vite`             | 4.5     | 7         | Config options added after v4                                                    |
| `vitest`           | 0.32    | 3         | `vi` APIs and config options added after 0.32                                    |

Source of truth: `package.json`. Update this table when a dependency is upgraded.
