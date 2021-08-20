import { AppConfig } from "./webapp/pages/app/AppConfig";

export const appConfig: AppConfig = {
    appKey: "xMART2DHIS",
    appearance: {
        showShareButton: true,
    },
    feedback: {
        token: ["03242fc6b0c5a48582", "2e6b8d3e8337b5a0b95fe2"],
        createIssue: true,
        sendToDhis2UserGroups: ["Administrators"],
        issues: {
            repository: "EyeSeeTea/xMART2DHIS",
            title: "[User feedback] {title}",
            body: "## dhis2\n\nUsername: {username}\n\n{body}",
        },
        snapshots: {
            repository: "EyeSeeTeaBotTest/snapshots",
            branch: "master",
        },
        feedbackOptions: {},
    },
};
