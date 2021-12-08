import { makeStyles, Typography } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import { OrgUnitsSelector, useSnackbar } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import i18n from "../../../../locales";
import { D2Api } from "../../../../types/d2-api";
import { useAppContext } from "../../../contexts/app-context";
import { SyncWizardStepProps } from "../SyncWizard";

const useStyles = makeStyles({
    loading: {
        display: "flex",
        justifyContent: "center",
    },
});

const OrganisationUnitsSelectionStep: React.FC<SyncWizardStepProps> = ({ action, onChange }) => {
    const { compositionRoot } = useAppContext();
    const classes = useStyles();
    const snackbar = useSnackbar();

    const [orgUnitRootIds, setOrgUnitRootIds] = useState<string[] | undefined>();
    const [api, setApi] = useState<D2Api>();

    useEffect(() => {
        setApi(compositionRoot.d2Api);

        compositionRoot.metadata.getOrgUnitRoots().run(
            roots => setOrgUnitRootIds(roots.map(({ id }) => id)),
            () => snackbar.error("An error has occurred loading organisation units")
        );
    }, [compositionRoot, snackbar]);

    const changeSelection = (orgUnitPaths: string[]) => {
        onChange(action.update({ orgUnitPaths }));
    };

    if (!orgUnitRootIds || !api) {
        return (
            <div className={classes.loading}>
                <CircularProgress />
            </div>
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

export default OrganisationUnitsSelectionStep;
