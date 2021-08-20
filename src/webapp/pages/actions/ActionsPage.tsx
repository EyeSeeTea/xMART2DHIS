import { ObjectsTable, TableAction, TableColumn, useSnackbar } from "@eyeseetea/d2-ui-components";
import { Sync } from "@material-ui/icons";
import _ from "lodash";
import { useMemo } from "react";
import styled from "styled-components";
import { Future, FutureData } from "../../../domain/entities/Future";
import i18n from "../../../locales";
import { PageHeader } from "../../components/page-header/PageHeader";
import { useAppContext } from "../../contexts/app-context";

export const ActionsPage: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    const rows: TableObject[] = useMemo(
        () => [
            {
                id: "action-1",
                name: i18n.t("Action 1"),
                description: i18n.t("Description 1"),
                usecase: compositionRoot.actions.action1,
            },
            {
                id: "action-2",
                name: i18n.t("Action 2"),
                description: i18n.t("Description 2"),
                usecase: compositionRoot.actions.action2,
            },
            {
                id: "action-3",
                name: i18n.t("Action 3"),
                description: i18n.t("Description 3"),
                usecase: compositionRoot.actions.action2,
            },
            {
                id: "action-4",
                name: i18n.t("Action 4"),
                description: i18n.t("Description 4"),
                usecase: compositionRoot.actions.action2,
            },
        ],
        [compositionRoot]
    );

    const columns: TableColumn<TableObject>[] = useMemo(
        () => [
            { name: "name", text: i18n.t("Name") },
            { name: "description", text: i18n.t("Description") },
        ],
        []
    );

    const actions: TableAction<TableObject>[] = useMemo(
        () => [
            {
                name: "run",
                text: i18n.t("Run"),
                icon: <Sync />,
                multiple: true,
                onClick: (ids: string[]) => {
                    const futures = _.compact(ids.map(id => rows.find(item => item.id === id))).map(({ usecase }) =>
                        usecase()
                    );

                    Future.parallel(futures, { maxConcurrency: 1 }).run(
                        () => snackbar.success(i18n.t("Executed {{total}} actions", { total: futures.length })),
                        error => snackbar.error(error)
                    );
                },
            },
        ],
        [snackbar, rows]
    );

    return (
        <Container>
            <PageHeader title={i18n.t("Actions")} onBackClick={() => window.history.back()} />

            <ObjectsTable<TableObject> rows={rows} columns={columns} actions={actions} />
        </Container>
    );
};

const Container = styled.div`
    margin: 20px;
`;

type TableObject = {
    id: string;
    name: string;
    description: string;
    usecase: () => FutureData<void>;
};
