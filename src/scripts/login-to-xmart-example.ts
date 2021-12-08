import { ConfidentialClientApplication } from "@azure/msal-node";
import "dotenv-flow/config";
import "isomorphic-fetch";

const TENANT_ID = "f610c0b7-bd24-4b39-810b-3dc280afb590";
const CLIENT_ID = "192e3789-682d-4aeb-8d05-1a70acb86ab8";
const XMART_UAT_SCOPE = "api://b85362d6-c259-490b-bd51-c0a730011bef/.default";

async function main() {
    const client = new ConfidentialClientApplication({
        auth: {
            clientId: CLIENT_ID,
            authority: `https://login.microsoftonline.com/${TENANT_ID}`,
            clientSecret: process.env.AZURE_CLIENT_SECRET,
        },
    });

    const tokenResponse = await client.acquireTokenByClientCredential({ scopes: [XMART_UAT_SCOPE] });
    const { accessToken } = tokenResponse ?? {};

    fetch("https://portal-uat.who.int/xmart-api/odata/TRAINING_ARC/AGGREGATED", {
        headers: { Authorization: `Bearer ${accessToken}` },
    })
        .then(response => response.json())
        .then(data => console.log(data));
}

main();
