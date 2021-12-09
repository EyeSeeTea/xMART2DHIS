import { OrgUnitsSelector, useSnackbar } from "@eyeseetea/d2-ui-components";
import { Typography } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import i18n from "../../../../locales";
import { useAppContext } from "../../../contexts/app-context";
import { SyncWizardStepProps } from "../SyncWizard";

export const OrganisationUnitsSelectionStep: React.FC<SyncWizardStepProps> = ({ action, onChange }) => {
    const { compositionRoot, api } = useAppContext();
    const snackbar = useSnackbar();

    const [orgUnitRootIds, setOrgUnitRootIds] = useState<string[] | undefined>();

    useEffect(() => {
        compositionRoot.metadata.getOrgUnitRoots().run(
            roots => setOrgUnitRootIds(roots.map(({ id }) => id)),
            () => snackbar.error("An error has occurred loading organisation units")
        );
    }, [compositionRoot, snackbar]);

    const changeSelection = (orgUnitPaths: string[]) => {
        onChange(action.update({ orgUnitPaths }));
    };

    if (!orgUnitRootIds) {
        return (
            <LoadingWrapper>
                <CircularProgress />
            </LoadingWrapper>
        );
    } else if (_.isEmpty(orgUnitRootIds)) {
        return <Typography>{i18n.t("You do not have assigned any organisation unit")}</Typography>;
    } else {
        return (
            <OrgUnitsSelector
                api={api}
                onChange={changeSelection}
                selected={action.orgUnitPaths}
                rootIds={orgUnitRootIds}
                withElevation={false}
                initiallyExpanded={action.orgUnitPaths}
                controls={{
                    filterByLevel: true,
                    filterByGroup: true,
                    filterByProgram: true,
                    selectAll: true,
                }}
            />
        );
    }
};

const LoadingWrapper = styled.div`
    display: flex;
    justify-content: center;
`;
