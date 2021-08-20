import _ from "lodash";
import React, { useMemo } from "react";
import { useHistory } from "react-router-dom";
import i18n from "../../../locales";
import { Card, CardGrid } from "../../components/card-grid/CardGrid";

export const LandingPage: React.FC = () => {
    const history = useHistory();

    const cards: Card[] = useMemo(
        () =>
            _.compact([
                {
                    title: i18n.t("Common tools"),
                    key: "tools",
                    children: [
                        {
                            name: i18n.t("Actions"),
                            description: i18n.t("Actions are a way to trigger events in your application"),
                            listAction: () => history.push("/actions"),
                        },
                        {
                            name: i18n.t("Browse xMART"),
                            description: i18n.t("List table contents of the MART"),
                            listAction: () => history.push("/list"),
                        },
                    ],
                },
            ]),
        [history]
    );

    return <CardGrid cards={cards} />;
};
