import React, { useMemo } from "react";
import { useHistory } from "react-router-dom";
import i18n from "../../../locales";
import { Card, CardGrid } from "../../components/card-grid/CardGrid";
import { useAppContext } from "../../contexts/app-context";

export const LandingPage: React.FC = () => {
    const history = useHistory();
    const { compositionRoot } = useAppContext();

    const cards: Card[] = useMemo(
        () => [
            {
                key: "tools",
                children: [
                    {
                        name: i18n.t("Actions"),
                        description: i18n.t("Actions are a way to trigger events in your application"),
                        listAction: () => history.push("/actions"),
                        addAction: () => compositionRoot.actions.exampleAction().run(console.debug, console.error),
                    },
                    {
                        name: i18n.t("Browse xMART"),
                        description: i18n.t("List table contents of the MART"),
                        listAction: () => history.push("/list"),
                    },
                    {
                        name: i18n.t("Connections"),
                        description: i18n.t("List connections of the MART"),
                        listAction: () => history.push("/connections"),
                    },
                ],
            },
        ],
        [history, compositionRoot]
    );

    return <CardGrid cards={cards} />;
};
