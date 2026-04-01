/// <reference types="@welldone-software/why-did-you-render" />

import React from "react";

if (import.meta.env.DEV) {
    // `require` no existe en el navegador. Usamos `import()` dinámico (Vite/ESM).
    import("@welldone-software/why-did-you-render")
        .then(mod => {
            const whyDidYouRender = (mod as any).default ?? mod;
            whyDidYouRender(React, {
                trackAllPureComponents: true,
            });
        })
        .catch(err => {
            // eslint-disable-next-line no-console
            console.warn("WDYR no disponible:", err);
        });
}
