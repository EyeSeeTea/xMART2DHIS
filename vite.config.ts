/// <reference types="vitest" />
import { UserConfig, defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import nodePolyfills from "vite-plugin-node-stdlib-browser";
import * as path from "path";

const redirectPaths = ["/dhis-web-pivot", "/dhis-web-data-visualizer"];

export default ({ mode }): UserConfig => {
    const env = { ...process.env, ...loadEnv(mode, process.cwd()) };

    return defineConfig({
        base: "", // Rutas relativas (útil para empaquetado DHIS2 ZIP)
        plugins: [nodePolyfills(), react()],
        test: {
            environment: "jsdom",
            include: ["**/*.{spec,test}.{ts,tsx}"],
            setupFiles: "./src/tests/setup.js",
            exclude: ["node_modules", "src/tests/playwright"],
            globals: true,
        },
        server: {
            port: parseInt(env.VITE_PORT || "8081", 10),
            proxy: getProxy(env),
        },
        resolve: {
            alias: {
                $: path.resolve(__dirname, "./src"),
            },
        },
    });
};

function getProxy(env: Record<string, string>) {
    // En build no hace falta proxy
    if (env.NODE_ENV === "production") return {};

    const targetUrl = env.VITE_DHIS2_BASE_URL;
    const auth = env.VITE_DHIS2_AUTH;
    const logLevel = env.VITE_PROXY_LOG_LEVEL || "warn";

    if (!targetUrl) {
        console.error("Set VITE_DHIS2_BASE_URL");
        process.exit(1);
    }

    return {
        "/dhis2": {
            target: targetUrl,
            changeOrigin: true,
            auth,
            // Mantener el comportamiento de CRA: /dhis2/xyz -> <target>/xyz
            rewrite: (p: string) => p.replace(/^\/dhis2\/?/, "/"),
            configure: (proxy: any) => {
                proxy.on("proxyReq", (proxyReq: any, req: any, res: any) => {
                    const reqPath = proxyReq?.path || req?.url || "";
                    const shouldRedirect = redirectPaths.some(redirectPath => reqPath.startsWith(redirectPath));
                    if (!shouldRedirect) return;

                    const redirectUrl = targetUrl.replace(/\/$/, "") + reqPath;
                    res.statusCode = 302;
                    res.setHeader("Location", redirectUrl);
                    res.end();
                });

                proxy.on("error", (err: any) => {
                    if (logLevel === "debug") {
                        // eslint-disable-next-line no-console
                        console.error(err);
                    }
                });
            },
        },
    };
}

