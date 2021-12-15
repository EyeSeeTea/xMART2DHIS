import { RowConfig, useSnackbar } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useCallback, useState } from "react";
import { DataSetModel, ProgramModel } from "../../../../domain/entities/models/D2Models";
import i18n from "../../../../locales";
import { MetadataType } from "../../../../utils/d2";
import MetadataTable from "../../metadata-table/MetadataTable";
import { ActionWizardStepProps } from "../ActionWizard";

const models = [ProgramModel, DataSetModel];

export function MetadataSelectionStep({ action, onChange }: ActionWizardStepProps) {
    const snackbar = useSnackbar();

    const [metadataIds, updateMetadataIds] = useState<string[]>([]);

    const changeSelection = useCallback(
        (newMetadataIds: string[], _newExclusionIds: string[]) => {
            const additions = _.difference(newMetadataIds, metadataIds);
            if (additions.length > 0) {
                snackbar.info(i18n.t("Selected {{difference}} elements", { difference: additions.length }), {
                    autoHideDuration: 1000,
                });
            }

            const removals = _.difference(metadataIds, newMetadataIds);
            if (removals.length > 0) {
                snackbar.info(
                    i18n.t("Removed {{difference}} elements", {
                        difference: Math.abs(removals.length),
                    }),
                    { autoHideDuration: 1000 }
                );
            }

            onChange(action.update({ metadataIds: newMetadataIds }));

            updateMetadataIds(newMetadataIds);
        },
        [metadataIds, onChange, snackbar, action]
    );

    const rowConfig = React.useCallback(
        (item: MetadataType): RowConfig => ({
            disabled: !item.model.getIsSelectable(),
            selectable: item.model.getIsSelectable(),
        }),
        []
    );

    return (
        <MetadataTable
            rowConfig={rowConfig}
            models={models}
            selectedIds={action.metadataIds}
            notifyNewSelection={changeSelection}
            showIndeterminateSelection={true}
        />
    );
}
