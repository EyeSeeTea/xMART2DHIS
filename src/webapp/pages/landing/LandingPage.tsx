import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import i18n from "../../../locales";
import { Card, CardGrid } from "../../components/card-grid/CardGrid";

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    const cards: Card[] = useMemo(
        () => [
            {
                key: "tools",
                children: [
                    {
                        name: i18n.t("Connections"),
                        description: i18n.t("List connections of the MART"),
                        listAction: () => navigate("/connections"),
                    },
                    {
                        name: i18n.t("Actions"),
                        description: i18n.t("Actions are a way to trigger events in your application"),
                        listAction: () => navigate("/actions"),
                        addAction: () => navigate("/actions/new"),
                    },
                    {
                        name: i18n.t("Browse xMART"),
                        description: i18n.t("List table contents of the MART"),
                        listAction: () => navigate("/list"),
                    },
                ],
            },
        ],
        [navigate]
    );

    return <CardGrid cards={cards} />;
};
