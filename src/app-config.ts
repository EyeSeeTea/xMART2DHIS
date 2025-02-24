import { AppConfig } from "./webapp/pages/app/AppConfig";

export const appConfig: AppConfig = {
    appKey: "xMART2DHIS",
    appearance: {
        showShareButton: true,
    },
    feedback: {
        repositories: {
            clickUp: {
                apiUrl: "https://dev.eyeseetea.com/clickup",
                listId: "170646854",
                title: "[User feedback] {title}",
                body: "## dhis2\n\nUsername: {username}\n\n{body}",
                status: "Misc",
            },
        },
        layoutOptions: {
            showContact: false,
            descriptionTemplate: "## Summary\n\n## Steps to reproduce\n\n## Actual results\n\n## Expected results\n\n",
        },
    },
};
