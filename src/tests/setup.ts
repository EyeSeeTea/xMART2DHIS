// jest-dom v6 registers its matchers through this entry point. The older
// `import matchers from "@testing-library/jest-dom/matchers"` + expect.extend
// form relies on a CJS deep path that the Vite 7 resolver no longer honours.
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
    cleanup();
});
