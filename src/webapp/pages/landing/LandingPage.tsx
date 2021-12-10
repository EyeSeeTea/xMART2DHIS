import { useSnackbar } from "@eyeseetea/d2-ui-components";
import React, { useMemo } from "react";
import { useHistory } from "react-router-dom";
import { AzureMSALRepository } from "../../../data/repositories/AzureMSALRepository";
import { InstanceD2ApiRepository } from "../../../data/repositories/InstanceD2ApiRepository";
import { XMartDefaultRepository } from "../../../data/repositories/XMartDefaultRepository";
import { LoadDataExample } from "../../../domain/usecases/actions/examples/LoadDataExample";
import { LoadModelExample } from "../../../domain/usecases/actions/examples/LoadModelExample";
import { LoadPipelineExample } from "../../../domain/usecases/actions/examples/LoadPipelineExample";
import i18n from "../../../locales";
import { Card, CardGrid } from "../../components/card-grid/CardGrid";
import { useAppContext } from "../../contexts/app-context";

export const LandingPage: React.FC = () => {
    const { instance } = useAppContext();

    const history = useHistory();
    const snackbar = useSnackbar();

    const cards: Card[] = useMemo(
        () => [
            {
                key: "tools",
                children: [
                    {
                        name: i18n.t("Actions"),
                        description: i18n.t("Actions are a way to trigger events in your application"),
                        listAction: () => history.push("/actions"),
                        addAction: () => history.push("/actions/new"),
                    },
                    {
                        name: i18n.t("Mapping Templates"),
                        description: i18n.t("Define templates of mapping models to import in the actions"),
                        listAction: () => history.push("/mapping-templates"),
                        addAction: () => history.push("/mapping-templates/new"),
                    },
                    {
                        name: i18n.t("Browse xMART"),
                        description: i18n.t("List table contents of the MART"),
                        listAction: () => history.push("/list"),
                    },
                ],
            },
            {
                key: "examples",
                title: i18n.t("Examples"),
                children: [
                    {
                        name: i18n.t("Load pipelines"),
                        description: i18n.t("Initial load of LOAD_DATA and LOAD_MODEL pipelines"),
                        listAction: () =>
                            new LoadPipelineExample(
                                new XMartDefaultRepository(new AzureMSALRepository()),
                                new InstanceD2ApiRepository(instance)
                            )
                                .execute()
                                .run(
                                    batch => snackbar.success(`Executed batch ${batch}`),
                                    error => snackbar.error(error)
                                ),
                    },
                    {
                        name: i18n.t("Load data"),
                        description: i18n.t("LOAD_DATA example"),
                        listAction: () =>
                            new LoadDataExample(
                                new XMartDefaultRepository(new AzureMSALRepository()),
                                new InstanceD2ApiRepository(instance)
                            )
                                .execute()
                                .run(
                                    batch => snackbar.success(`Executed batch ${batch}`),
                                    error => snackbar.error(error)
                                ),
                    },
                    {
                        name: i18n.t("Load model"),
                        description: i18n.t("LOAD_MODEL example"),
                        listAction: () =>
                            new LoadModelExample(
                                new XMartDefaultRepository(new AzureMSALRepository()),
                                new InstanceD2ApiRepository(instance)
                            )
                                .execute()
                                .run(
                                    batch => snackbar.success(`Executed batch ${batch}`),
                                    error => snackbar.error(error)
                                ),
                    },
                ],
            },
        ],
        [history, instance, snackbar]
    );

    return <CardGrid cards={cards} />;
};
